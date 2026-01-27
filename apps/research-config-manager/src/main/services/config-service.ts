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
import type { DocumentMetadata, DocumentScopePreferences } from '../../shared/types';
import { parseCatalog, createCatalogLookup, type ParsedCatalog, type CatalogEntry } from './catalog-parser';
import { ConfigParseError, ConfigValidationError } from '../errors/config-errors';
import { getFileWatcher } from './file-watcher';
import { logger } from '../utils/logger';

const TOKENS_PER_PAGE = 500;

interface PageIndexDocument {
  name: string;
  pages: number;
  indexedAt: string;
}

interface EnabledMap {
  enabledSet: Set<string>;
  disabledSet: Set<string>;
}

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
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }

    let content: string;
    let data: unknown;

    try {
      content = await readFile(this.scopePath, 'utf-8');
    } catch (error) {
      throw error;
    }

    try {
      data = JSON.parse(content);
    } catch (error) {
      throw new ConfigParseError(this.scopePath, error as Error);
    }

    try {
      return DocumentScopeSchema.parse(data);
    } catch (error) {
      throw new ConfigValidationError(this.scopePath, error as Error);
    }
  }

  async writeScope(scope: DocumentScope): Promise<void> {
    const validated = DocumentScopeSchema.parse(scope);

    // Mark write to prevent FileWatcher from notifying about our own change
    const fileWatcher = getFileWatcher(this.projectPath);
    fileWatcher.markAsOurWrite(this.scopePath);

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
      logger.error('Error reading pageindex state', error as Error);
      return null;
    }
  }

  async listDocuments(): Promise<DocumentMetadata[]> {
    // Fetch all data sources in parallel
    const [pageIndexState, scope, catalog] = await Promise.all([
      this.readPageIndexState(),
      this.readScope(),
      this.getCatalogLookup()
    ]);

    if (!pageIndexState) {
      return [];
    }

    const pageIndexDocs = this.getPageIndexDocuments(pageIndexState);
    const enabledMap = this.buildEnabledMap(scope);

    const documents = pageIndexDocs.map((doc) =>
      this.buildDocumentMetadata(doc, enabledMap, catalog, scope)
    );

    // Sort by short citation for better UX
    documents.sort((a, b) => a.shortCitation.localeCompare(b.shortCitation));

    return documents;
  }

  /**
   * Extract valid documents from PageIndex state
   */
  private getPageIndexDocuments(state: PageIndexState): PageIndexDocument[] {
    const documents: PageIndexDocument[] = [];

    for (const entry of Object.values(state.indexed_papers)) {
      // Skip entries without pageindex_name (manually marked or incomplete)
      if (!entry.pageindex_name) {
        continue;
      }

      documents.push({
        name: entry.pageindex_name,
        pages: entry.pages || 0,
        indexedAt: entry.indexed_at
      });
    }

    return documents;
  }

  /**
   * Build enabled/disabled sets from scope
   */
  private buildEnabledMap(scope: DocumentScope | null): EnabledMap {
    return {
      enabledSet: new Set(scope?.enabled || []),
      disabledSet: new Set(scope?.disabled || [])
    };
  }

  /**
   * Get catalog lookup map (async wrapper for parallel fetching)
   */
  private async getCatalogLookup(): Promise<Map<string, CatalogEntry>> {
    const catalog = await parseCatalog(this.catalogPath);
    return catalog ? createCatalogLookup(catalog) : new Map();
  }

  /**
   * Build metadata for a single document
   */
  private buildDocumentMetadata(
    doc: PageIndexDocument,
    enabledMap: EnabledMap,
    catalogLookup: Map<string, CatalogEntry>,
    scope: DocumentScope | null
  ): DocumentMetadata {
    const { disabledSet } = enabledMap;
    const catalogEntry = catalogLookup.get(doc.name);

    // Determine enabled state:
    // - If in disabled list -> disabled
    // - Otherwise -> enabled (backwards compatible)
    const enabled = !disabledSet.has(doc.name);

    // Get categories: prefer scope.categories, fallback to catalog, then 'Uncategorized'
    const scopeCategories = scope?.categories?.[doc.name];
    const categories =
      scopeCategories && scopeCategories.length > 0
        ? scopeCategories
        : catalogEntry?.categories ?? ['Uncategorized'];

    return {
      name: doc.name,
      shortName: this.shortenName(doc.name),
      shortCitation: catalogEntry?.shortCitation ?? this.extractShortCitation(doc.name),
      pages: doc.pages,
      tokenEstimate: doc.pages * TOKENS_PER_PAGE,
      indexedAt: doc.indexedAt,
      enabled,
      categories,
      focus: catalogEntry?.focus,
      keyPages: catalogEntry?.keyPages,
      isNew: false
    };
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

  /**
   * Batch toggle documents by category (single file write instead of N writes)
   * @param category Category name or '__all__' for all documents
   * @param enabled Whether to enable or disable the documents
   */
  async batchToggle(category: string, enabled: boolean): Promise<void> {
    const documents = await this.listDocuments();

    let docsToToggle: string[];
    if (category === '__all__') {
      docsToToggle = documents.map((d) => d.name);
    } else {
      docsToToggle = documents
        .filter((d) => d.categories.includes(category))
        .map((d) => d.name);
    }

    let scope = (await this.readScope()) ?? createDefaultScope();

    const enabledSet = new Set(scope.enabled);
    const disabledSet = new Set(scope.disabled);

    for (const name of docsToToggle) {
      if (enabled) {
        enabledSet.add(name);
        disabledSet.delete(name);
      } else {
        disabledSet.add(name);
        enabledSet.delete(name);
      }
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

  /**
   * Update user preferences in the document scope
   */
  async updatePreferences(preferences: Partial<DocumentScopePreferences>): Promise<DocumentScopePreferences> {
    let scope = await this.readScope();

    if (!scope) {
      scope = createDefaultScope();
    }

    const defaultPreferences: DocumentScopePreferences = {
      defaultModel: 'sonnet',
      showModelIndicator: true
    };

    const currentPreferences = scope.preferences ?? defaultPreferences;
    const updatedPreferences: DocumentScopePreferences = {
      ...currentPreferences,
      ...preferences
    };

    const updatedScope: DocumentScope = {
      ...scope,
      preferences: updatedPreferences,
      lastModified: new Date().toISOString()
    };

    await this.writeScope(updatedScope);
    return updatedPreferences;
  }

  /**
   * Get current preferences
   */
  async getPreferences(): Promise<DocumentScopePreferences> {
    const scope = await this.readScope();
    return scope?.preferences ?? {
      defaultModel: 'sonnet',
      showModelIndicator: true
    };
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
