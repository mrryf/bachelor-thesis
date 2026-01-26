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
  relevance: 'FOUNDATIONAL' | 'CORE' | 'SUPPORTING';
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

export interface DocumentScope {
  version: '1.0' | '1.1';
  lastModified: string;
  enabled: string[];
  disabled: string[];
  categories?: Record<string, string[]>;
  categoryDefinitions?: Record<string, string>;
  metadata?: DocumentScopeMetadata;
}

export interface PageIndexEntry {
  pageindex_name?: string;
  indexed_at: string;
  pages?: number;
  note?: string;
  marked_manually?: boolean;
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
  relevance: 'FOUNDATIONAL' | 'CORE' | 'SUPPORTING';
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
