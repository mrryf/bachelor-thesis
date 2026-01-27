export interface DocumentMetadata {
  name: string;
  shortName: string;
  shortCitation: string;
  pages: number;
  tokenEstimate: number;
  indexedAt: string;
  enabled: boolean;
  // From catalog
  categories: string[];
  focus?: string;
  keyPages?: string;
  // UI state
  isNew: boolean;
}

export interface DocumentScopeMetadata {
  totalDocuments: number;
  totalPages: number;
  estimatedTokens: number;
  enabledCount: number;
  disabledCount: number;
}

export type ModelPreference = 'haiku' | 'sonnet' | 'opus';

export interface DocumentScopePreferences {
  defaultModel: ModelPreference;
  showModelIndicator: boolean;
}

export interface DocumentScope {
  version: '1.0' | '1.1';
  lastModified: string;
  enabled: string[];
  disabled: string[];
  categories?: Record<string, string[]>;
  categoryDefinitions?: Record<string, string>;
  metadata?: DocumentScopeMetadata;
  preferences?: DocumentScopePreferences;
}

export interface PageIndexEntry {
  pageindex_name?: string;
  indexed_at: string;
  pages?: number;
  note?: string;
  marked_manually?: boolean;
}

/**
 * Validates that a PageIndexEntry has required fields and correct types
 * Prevents silent data corruption in downstream consumers
 */
export function validatePageIndexEntry(entry: unknown): entry is PageIndexEntry {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }
  const obj = entry as Record<string, unknown>;
  return (
    typeof obj.indexed_at === 'string' &&
    obj.indexed_at.length > 0 &&
    (obj.pageindex_name === undefined || typeof obj.pageindex_name === 'string') &&
    (obj.pages === undefined || typeof obj.pages === 'number') &&
    (obj.note === undefined || typeof obj.note === 'string') &&
    (obj.marked_manually === undefined || typeof obj.marked_manually === 'boolean')
  );
}

export interface PageIndexState {
  version: string;
  last_sync: string;
  note?: string;
  indexed_papers: Record<string, PageIndexEntry>;
  failed_papers?: Record<string, { reason: string; last_attempt: string }>;
}

export interface CatalogEntry {
  shortCitation: string;
  pageIndexName: string;
  categories: string[];
  keyPages?: string;
  focus?: string;
}

export interface CategorySummary {
  name: string;
  documentCount: number;
}

export interface ParsedCatalog {
  lastUpdated: string;
  totalPapers: number;
  categories: CategorySummary[];
  entries: CatalogEntry[];
}

export interface RefreshResult {
  success: boolean;
  totalDocuments: number;
  newDocuments: string[];
  removedDocuments: string[];
  error?: string;
}

export interface ExternalChangeEvent {
  file: string;
  path: string;
  timestamp: number;
}

// BibTeX Enrichment Types

/**
 * Represents a parsed author from BibTeX data
 * This is the single source of truth for author representations across the app
 */
export interface BibTexAuthor {
  surname: string;
  givenName?: string;
  full: string;
}

/**
 * Validates that a BibTexAuthor object has required fields
 */
export function validateBibTexAuthor(author: unknown): author is BibTexAuthor {
  if (typeof author !== 'object' || author === null) {
    return false;
  }
  const obj = author as Record<string, unknown>;
  return (
    typeof obj.surname === 'string' &&
    obj.surname.length > 0 &&
    typeof obj.full === 'string' &&
    obj.full.length > 0
  );
}

export type MatchMethod = 'direct' | 'author-year' | 'manual' | 'unmatched';

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

  // Catalog classification
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

export interface EnrichedCatalogStats {
  totalBibtex: number;
  totalPageIndex: number;
  matched: number;
  matchRate: number;
}

export interface EnrichedCatalog {
  version: string;
  generatedAt: string;
  bibtexHash: string;
  bibtexPath: string;
  stats: EnrichedCatalogStats;
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
