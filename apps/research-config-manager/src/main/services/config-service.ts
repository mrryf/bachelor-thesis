import { readFile, access } from 'fs/promises';
import { join } from 'path';
import {
  DocumentScopeSchema,
  PageIndexStateSchema,
  createDefaultScope,
  type DocumentScope,
  type PageIndexState
} from '../schemas/document-scope';
import { atomicWriteJson } from '../utils/atomic-write';
import type { DocumentMetadata } from '../../shared/types';
import { parseCatalog, createCatalogLookup, type ParsedCatalog } from './catalog-parser';

const TOKENS_PER_PAGE = 500;

export class ConfigService {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  private get scopePath(): string {
    return join(this.projectPath, '.claude', 'document-scope.json');
  }

  private get pageIndexStatePath(): string {
    return join(this.projectPath, '.claude', 'pageindex-state.json');
  }

  private get catalogPath(): string {
    return join(this.projectPath, '.claude', 'document-catalog.md');
  }

  async readScope(): Promise<DocumentScope | null> {
    try {
      await access(this.scopePath);
      const content = await readFile(this.scopePath, 'utf-8');
      const data = JSON.parse(content);
      return DocumentScopeSchema.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      console.error('Error reading document scope:', error);
      return null;
    }
  }

  async writeScope(scope: DocumentScope): Promise<void> {
    const validated = DocumentScopeSchema.parse(scope);
    await atomicWriteJson(this.scopePath, validated);
  }

  async readPageIndexState(): Promise<PageIndexState | null> {
    try {
      await access(this.pageIndexStatePath);
      const content = await readFile(this.pageIndexStatePath, 'utf-8');
      const data = JSON.parse(content);
      return PageIndexStateSchema.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      console.error('Error reading pageindex state:', error);
      return null;
    }
  }

  async listDocuments(): Promise<DocumentMetadata[]> {
    const pageIndexState = await this.readPageIndexState();
    if (!pageIndexState) {
      return [];
    }

    const scope = await this.readScope();
    const enabledSet = new Set(scope?.enabled || []);
    const disabledSet = new Set(scope?.disabled || []);

    // Load catalog for metadata enrichment
    const catalog = await parseCatalog(this.catalogPath);
    const catalogLookup = catalog ? createCatalogLookup(catalog) : new Map();

    const documents: DocumentMetadata[] = [];

    for (const [_key, entry] of Object.entries(pageIndexState.indexed_papers)) {
      // Skip entries without pageindex_name (manually marked or incomplete)
      if (!entry.pageindex_name) {
        continue;
      }

      const name = entry.pageindex_name;
      const pages = entry.pages || 0;

      // Determine enabled state:
      // - If in enabled list -> enabled
      // - If in disabled list -> disabled
      // - Otherwise -> default enabled (backwards compatible)
      let enabled = true;
      if (disabledSet.has(name)) {
        enabled = false;
      } else if (enabledSet.has(name)) {
        enabled = true;
      }

      // Get catalog entry if available
      const catalogEntry = catalogLookup.get(name);

      documents.push({
        name,
        shortName: this.shortenName(name),
        shortCitation: catalogEntry?.shortCitation ?? this.extractShortCitation(name),
        pages,
        tokenEstimate: pages * TOKENS_PER_PAGE,
        indexedAt: entry.indexed_at,
        enabled,
        categories: catalogEntry?.categories ?? ['Uncategorized'],
        relevance: catalogEntry?.relevance ?? 'SUPPORTING',
        focus: catalogEntry?.focus,
        keyPages: catalogEntry?.keyPages,
        isNew: false
      });
    }

    // Sort by short citation for better UX
    documents.sort((a, b) => a.shortCitation.localeCompare(b.shortCitation));

    return documents;
  }

  async getCatalog(): Promise<ParsedCatalog | null> {
    return parseCatalog(this.catalogPath);
  }

  async toggleDocument(docName: string, enabled: boolean): Promise<void> {
    let scope = await this.readScope();

    if (!scope) {
      scope = createDefaultScope();
    }

    const enabledSet = new Set(scope.enabled);
    const disabledSet = new Set(scope.disabled);

    if (enabled) {
      enabledSet.add(docName);
      disabledSet.delete(docName);
    } else {
      disabledSet.add(docName);
      enabledSet.delete(docName);
    }

    const updatedScope: DocumentScope = {
      ...scope,
      enabled: Array.from(enabledSet),
      disabled: Array.from(disabledSet),
      lastModified: new Date().toISOString(),
      metadata: this.calculateMetadata(
        Array.from(enabledSet),
        Array.from(disabledSet),
        await this.readPageIndexState()
      )
    };

    await this.writeScope(updatedScope);
  }

  async enableAll(): Promise<void> {
    const documents = await this.listDocuments();
    const allNames = documents.map((d) => d.name);

    const updatedScope: DocumentScope = {
      version: '1.0',
      lastModified: new Date().toISOString(),
      enabled: allNames,
      disabled: [],
      metadata: this.calculateMetadata(allNames, [], await this.readPageIndexState())
    };

    await this.writeScope(updatedScope);
  }

  async disableAll(): Promise<void> {
    const documents = await this.listDocuments();
    const allNames = documents.map((d) => d.name);

    const updatedScope: DocumentScope = {
      version: '1.0',
      lastModified: new Date().toISOString(),
      enabled: [],
      disabled: allNames,
      metadata: this.calculateMetadata([], allNames, await this.readPageIndexState())
    };

    await this.writeScope(updatedScope);
  }

  private shortenName(name: string, maxLength = 60): string {
    const withoutExt = name.replace(/\.pdf$/i, '');
    if (withoutExt.length <= maxLength) {
      return withoutExt;
    }
    return withoutExt.slice(0, maxLength - 3) + '...';
  }

  /**
   * Extract a short citation from the document name
   * e.g., "Davis - 1989 - Perceived Usefulness..." -> "Davis 1989"
   */
  private extractShortCitation(name: string): string {
    // Pattern: "Author(s) - Year - Title..."
    const match = name.match(/^(.+?)\s*-\s*(\d{4})\s*-/);
    if (match) {
      const author = match[1].trim();
      const year = match[2];
      // Shorten "Author et al." if too long
      const shortAuthor = author.length > 20 ? author.split(' ')[0] + ' et al.' : author;
      return `${shortAuthor} ${year}`;
    }
    // Fallback: first 30 chars
    return this.shortenName(name, 30);
  }

  private calculateMetadata(
    enabled: string[],
    disabled: string[],
    pageIndexState: PageIndexState | null
  ): DocumentScope['metadata'] {
    if (!pageIndexState) {
      return {
        totalDocuments: 0,
        totalPages: 0,
        estimatedTokens: 0,
        enabledCount: enabled.length,
        disabledCount: disabled.length
      };
    }

    let totalPages = 0;
    let totalDocuments = 0;

    for (const entry of Object.values(pageIndexState.indexed_papers)) {
      if (entry.pageindex_name) {
        totalDocuments++;
        totalPages += entry.pages || 0;
      }
    }

    return {
      totalDocuments,
      totalPages,
      estimatedTokens: totalPages * TOKENS_PER_PAGE,
      enabledCount: enabled.length,
      disabledCount: disabled.length
    };
  }
}
