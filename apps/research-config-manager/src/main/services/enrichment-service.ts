import { readFile, access, writeFile, mkdir } from 'fs/promises';
import { createHash } from 'crypto';
import { join, dirname } from 'path';
import { parseBibTexFile, createBibTexLookup, type BibTexEntry } from './bibtex-parser';
import { matchBibTexToPageIndex, calculateMatchingStats, type MatchResult, type MatchMethod } from './catalog-matcher';
import { parseCatalog, createCatalogLookup, type CatalogEntry } from './catalog-parser';
import type { PageIndexState, BibTexAuthor } from '../../shared/types';
import { logger } from '../utils/logger';

export type MainCategory =
  | 'Theoretical Frameworks'
  | 'Empirical Studies'
  | 'Methodology'
  | 'Context-Specific'
  | 'Meta/Review'
  | 'Uncategorized';

export interface EnrichedDocument {
  // Identity
  bibtexKey: string;
  pageindexName: string | null;

  // Display metadata (from BibTeX)
  title: string;
  shortTitle?: string;
  authors: BibTexAuthor[];
  year: number;

  // Rich metadata
  abstract?: string;
  keywords?: string[];
  doi?: string;
  url?: string;
  journal?: string;

  // Catalog classification (from existing catalog)
  categories: string[];
  focus?: string;
  keyPages?: string;

  // PageIndex metadata
  pageCount?: number;
  indexedAt?: string;

  // Matching metadata
  matchMethod: MatchMethod;
  matchConfidence: number;
}

export interface EnrichedCatalog {
  version: string;
  generatedAt: string;
  bibtexHash: string;
  bibtexPath: string;
  stats: {
    totalBibtex: number;
    totalPageIndex: number;
    matched: number;
    matchRate: number;
  };
  documents: Record<string, EnrichedDocument>;
  unmatchedBibtex: string[];
  unmatchedPageIndex: string[];
}

export interface EnrichmentResult {
  success: boolean;
  catalog: EnrichedCatalog | null;
  error?: string;
  stats?: {
    totalDocuments: number;
    matched: number;
    matchRate: number;
    withAbstracts: number;
    withKeywords: number;
  };
}

export class EnrichmentService {
  private projectPath: string;
  private cachedCatalog: EnrichedCatalog | null = null;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  private get bibtexPath(): string {
    return join(this.projectPath, 'content', 'resources', 'bibliography.bib');
  }

  private get pageIndexStatePath(): string {
    return join(this.projectPath, '.claude', 'pageindex-state.json');
  }

  private get catalogPath(): string {
    return join(this.projectPath, '.claude', 'document-catalog.md');
  }

  private get enrichedCatalogPath(): string {
    return join(this.projectPath, '.claude', 'enriched-catalog.json');
  }

  /**
   * Load the enriched catalog from cache if valid, or generate fresh
   */
  async loadOrGenerateCatalog(forceRefresh = false): Promise<EnrichmentResult> {
    if (!forceRefresh && this.cachedCatalog) {
      // Check if BibTeX file has changed
      const currentHash = await this.computeBibTexHash();
      if (currentHash === this.cachedCatalog.bibtexHash) {
        return {
          success: true,
          catalog: this.cachedCatalog,
          stats: this.computeStats(this.cachedCatalog)
        };
      }
    }

    // Try to load from disk cache
    if (!forceRefresh) {
      const cached = await this.loadCachedCatalog();
      if (cached) {
        const currentHash = await this.computeBibTexHash();
        if (currentHash === cached.bibtexHash) {
          this.cachedCatalog = cached;
          return {
            success: true,
            catalog: cached,
            stats: this.computeStats(cached)
          };
        }
      }
    }

    // Generate fresh catalog
    return this.generateCatalog();
  }

  /**
   * Generate a fresh enriched catalog
   */
  async generateCatalog(): Promise<EnrichmentResult> {
    try {
      // Load all data sources
      const [bibtex, pageIndexState, existingCatalog] = await Promise.all([
        parseBibTexFile(this.bibtexPath),
        this.readPageIndexState(),
        parseCatalog(this.catalogPath)
      ]);

      if (!bibtex) {
        return {
          success: false,
          catalog: null,
          error: `BibTeX file not found: ${this.bibtexPath}`
        };
      }

      if (!pageIndexState) {
        return {
          success: false,
          catalog: null,
          error: `PageIndex state not found: ${this.pageIndexStatePath}`
        };
      }

      // Match BibTeX to PageIndex
      const matchResults = matchBibTexToPageIndex(bibtex.entries, pageIndexState);
      const matchStats = calculateMatchingStats(matchResults, pageIndexState);

      // Create lookups
      const bibtexLookup = createBibTexLookup(bibtex.entries);
      const catalogLookup = existingCatalog ? createCatalogLookup(existingCatalog) : new Map();

      // Build enriched documents
      const documents: Record<string, EnrichedDocument> = {};

      for (const matchResult of matchResults) {
        const bibtexEntry = bibtexLookup.get(matchResult.bibtexKey);
        if (!bibtexEntry) continue;

        const enriched = this.buildEnrichedDocument(
          bibtexEntry,
          matchResult,
          pageIndexState,
          catalogLookup
        );

        documents[matchResult.bibtexKey] = enriched;
      }

      // Compute hash and build catalog
      const bibtexHash = await this.computeBibTexHash();
      const matched = matchStats.directMatches + matchStats.authorYearMatches;

      const catalog: EnrichedCatalog = {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        bibtexHash,
        bibtexPath: this.bibtexPath,
        stats: {
          totalBibtex: matchStats.totalBibtex,
          totalPageIndex: matchStats.totalPageIndex,
          matched,
          matchRate: matchStats.totalBibtex > 0 ? matched / matchStats.totalBibtex : 0
        },
        documents,
        unmatchedBibtex: matchStats.unmatchedBibtexKeys,
        unmatchedPageIndex: matchStats.unmatchedPageIndexNames
      };

      // Cache in memory and on disk
      this.cachedCatalog = catalog;
      await this.saveCatalogToCache(catalog);

      logger.info(
        `Enrichment complete: ${matched}/${matchStats.totalBibtex} matched (${(catalog.stats.matchRate * 100).toFixed(1)}%)`
      );

      return {
        success: true,
        catalog,
        stats: this.computeStats(catalog)
      };
    } catch (error) {
      logger.error('Failed to generate enriched catalog', error as Error);
      return {
        success: false,
        catalog: null,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get the current enriched catalog (from cache)
   */
  getCatalog(): EnrichedCatalog | null {
    return this.cachedCatalog;
  }

  /**
   * Get enriched metadata for a specific document by PageIndex name
   */
  getDocumentByPageIndexName(name: string): EnrichedDocument | null {
    if (!this.cachedCatalog) return null;

    for (const doc of Object.values(this.cachedCatalog.documents)) {
      if (doc.pageindexName === name) {
        return doc;
      }
    }

    return null;
  }

  /**
   * Get enriched metadata for a specific document by BibTeX key
   */
  getDocumentByBibtexKey(key: string): EnrichedDocument | null {
    if (!this.cachedCatalog) return null;
    return this.cachedCatalog.documents[key] || null;
  }

  /**
   * Build an enriched document from all data sources
   */
  private buildEnrichedDocument(
    bibtex: BibTexEntry,
    matchResult: MatchResult,
    pageIndexState: PageIndexState,
    catalogLookup: Map<string, CatalogEntry>
  ): EnrichedDocument {
    // Get PageIndex metadata if matched
    let pageCount: number | undefined;
    let indexedAt: string | undefined;

    if (matchResult.pageindexName) {
      for (const entry of Object.values(pageIndexState.indexed_papers)) {
        if (entry.pageindex_name === matchResult.pageindexName) {
          pageCount = entry.pages;
          indexedAt = entry.indexed_at;
          break;
        }
      }
    }

    // Get catalog metadata if available
    const catalogEntry = matchResult.pageindexName
      ? catalogLookup.get(matchResult.pageindexName)
      : undefined;

    // Build enriched document
    return {
      bibtexKey: bibtex.key,
      pageindexName: matchResult.pageindexName,
      title: bibtex.title,
      shortTitle: bibtex.shortTitle,
      authors: bibtex.authors,
      year: bibtex.year,
      abstract: bibtex.abstract,
      keywords: bibtex.keywords,
      doi: bibtex.doi,
      url: bibtex.url,
      journal: bibtex.journal,
      categories: catalogEntry?.categories ?? ['Uncategorized'],
      focus: catalogEntry?.focus,
      keyPages: catalogEntry?.keyPages,
      pageCount,
      indexedAt,
      matchMethod: matchResult.matchMethod,
      matchConfidence: matchResult.matchConfidence
    };
  }

  /**
   * Compute stats from catalog
   */
  private computeStats(catalog: EnrichedCatalog): EnrichmentResult['stats'] {
    const docs = Object.values(catalog.documents);
    return {
      totalDocuments: docs.length,
      matched: docs.filter((d) => d.pageindexName !== null).length,
      matchRate: catalog.stats.matchRate,
      withAbstracts: docs.filter((d) => d.abstract).length,
      withKeywords: docs.filter((d) => d.keywords && d.keywords.length > 0).length
    };
  }

  /**
   * Compute SHA256 hash of the BibTeX file for cache invalidation
   * Logs hash for debugging cache issues
   */
  private async computeBibTexHash(): Promise<string> {
    try {
      const content = await readFile(this.bibtexPath, 'utf-8');
      const hash = createHash('sha256').update(content).digest('hex');
      logger.debug(`BibTeX hash computed: ${hash.slice(0, 8)}... (${content.length} bytes)`);
      return hash;
    } catch (error) {
      logger.warn(`Failed to compute BibTeX hash: ${(error as Error).message}`);
      return '';
    }
  }

  /**
   * Read PageIndex state from disk
   */
  private async readPageIndexState(): Promise<PageIndexState | null> {
    try {
      await access(this.pageIndexStatePath);
      const content = await readFile(this.pageIndexStatePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Load cached catalog from disk
   */
  private async loadCachedCatalog(): Promise<EnrichedCatalog | null> {
    try {
      await access(this.enrichedCatalogPath);
      const content = await readFile(this.enrichedCatalogPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Save catalog to disk cache
   */
  private async saveCatalogToCache(catalog: EnrichedCatalog): Promise<void> {
    try {
      // Ensure directory exists
      await mkdir(dirname(this.enrichedCatalogPath), { recursive: true });
      await writeFile(this.enrichedCatalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
    } catch (error) {
      logger.error('Failed to save enriched catalog cache', error as Error);
    }
  }
}

// Singleton instance
let enrichmentServiceInstance: EnrichmentService | null = null;

export function getEnrichmentService(projectPath: string): EnrichmentService {
  if (!enrichmentServiceInstance) {
    enrichmentServiceInstance = new EnrichmentService(projectPath);
  }
  return enrichmentServiceInstance;
}
