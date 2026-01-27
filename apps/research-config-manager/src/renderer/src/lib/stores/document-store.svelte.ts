import type { DocumentMetadata, DocumentScope, RefreshResult, ExternalChangeEvent, EnrichedCatalog, EnrichedDocument } from '@shared/types';
import { toast } from 'svelte-sonner';

interface DocumentState {
  documents: DocumentMetadata[];
  config: DocumentScope | null;
  enrichedCatalog: EnrichedCatalog | null;
  isLoading: boolean;
  isSyncingBibtex: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  // Responsive state
  viewMode: 'compact' | 'list' | 'grid';
  isMobile: boolean;
  isTablet: boolean;
  filtersCollapsed: boolean;
}

function createDocumentStore() {
  const state = $state<DocumentState>({
    documents: [],
    config: null,
    enrichedCatalog: null,
    isLoading: false,
    isSyncingBibtex: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,
    // Responsive defaults
    viewMode: 'compact',
    isMobile: false,
    isTablet: false,
    filtersCollapsed: false
  });

  // Create a lookup map for enriched documents by PageIndex name
  const enrichedLookup = $derived.by(() => {
    if (!state.enrichedCatalog) return new Map<string, EnrichedDocument>();
    const lookup = new Map<string, EnrichedDocument>();
    for (const doc of Object.values(state.enrichedCatalog.documents)) {
      if (doc.pageindexName) {
        lookup.set(doc.pageindexName, doc);
      }
    }
    return lookup;
  });

  // Computed: filtered documents based on search query and selected category
  const filteredDocuments = $derived.by(() => {
    let filtered = state.documents;

    // Filter by category
    if (state.selectedCategory) {
      filtered = filtered.filter((doc) => doc.categories.includes(state.selectedCategory!));
    }

    // Filter by search query (searches name, citation, categories, focus, and enriched metadata)
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter((doc) => {
        // Basic document fields
        if (
          doc.name.toLowerCase().includes(query) ||
          doc.shortCitation.toLowerCase().includes(query) ||
          doc.categories.some(cat => cat.toLowerCase().includes(query)) ||
          (doc.focus?.toLowerCase().includes(query) ?? false)
        ) {
          return true;
        }

        // Enriched metadata fields
        const enriched = enrichedLookup.get(doc.name);
        if (enriched) {
          // Search in title
          if (enriched.title.toLowerCase().includes(query)) return true;

          // Search in authors
          if (enriched.authors.some(a =>
            a.surname.toLowerCase().includes(query) ||
            (a.givenName?.toLowerCase().includes(query) ?? false)
          )) return true;

          // Search in abstract
          if (enriched.abstract?.toLowerCase().includes(query)) return true;

          // Search in keywords
          if (enriched.keywords?.some(kw => kw.toLowerCase().includes(query))) return true;

          // Search in journal
          if (enriched.journal?.toLowerCase().includes(query)) return true;
        }

        return false;
      });
    }

    return filtered;
  });

  // Computed: document statistics
  const stats = $derived.by(() => {
    const documents = state.documents;
    const enabled = documents.filter((d) => d.enabled);
    const disabled = documents.filter((d) => !d.enabled);

    return {
      total: documents.length,
      enabled: enabled.length,
      disabled: disabled.length,
      totalPages: documents.reduce((sum, d) => sum + d.pages, 0),
      totalTokens: documents.reduce((sum, d) => sum + d.tokenEstimate, 0),
      enabledTokens: enabled.reduce((sum, d) => sum + d.tokenEstimate, 0)
    };
  });

  // Computed: categories with counts
  const categories = $derived.by(() => {
    const documents = state.documents;
    const categoryMap = new Map<string, { count: number; enabledCount: number }>();

    for (const doc of documents) {
      for (const cat of doc.categories) {
        if (!categoryMap.has(cat)) {
          categoryMap.set(cat, { count: 0, enabledCount: 0 });
        }
        const entry = categoryMap.get(cat)!;
        entry.count++;
        if (doc.enabled) {
          entry.enabledCount++;
        }
      }
    }

    return Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);
  });

  // Actions
  async function loadDocuments(): Promise<void> {
    state.isLoading = true;
    state.error = null;
    try {
      const documents = await window.api.documents.list();
      state.documents = documents;
      state.isLoading = false;
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to load documents';
      state.isLoading = false;
    }
  }

  async function loadConfig(): Promise<void> {
    try {
      const config = await window.api.config.read();
      state.config = config;

      // Subscribe to config updates (from our own changes)
      window.api.config.onUpdate((updatedConfig: DocumentScope) => {
        state.config = updatedConfig;
        // Reload documents to reflect new enabled/disabled state
        loadDocuments();
      });

      // Subscribe to external config changes (from other tools or manual edits)
      window.api.config.onExternalChange((event: ExternalChangeEvent) => {
        console.log('External config change detected:', event.file);
        toast.info('Configuration changed externally', {
          description: `${event.file} was modified outside the app`,
          action: {
            label: 'Reload',
            onClick: () => loadDocuments()
          },
          duration: 5000
        });

        // Auto-reload after a brief delay
        setTimeout(() => {
          loadDocuments();
          loadConfig();
        }, 1000);
      });
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  }

  async function toggleDocument(docName: string, enabled: boolean): Promise<void> {
    // Optimistic update
    state.documents = state.documents.map((doc) =>
      doc.name === docName ? { ...doc, enabled } : doc
    );

    try {
      await window.api.documents.toggle(docName, enabled);
    } catch (err) {
      // Revert on error
      state.documents = state.documents.map((doc) =>
        doc.name === docName ? { ...doc, enabled: !enabled } : doc
      );
      state.error = err instanceof Error ? err.message : 'Failed to toggle document';
    }
  }

  async function enableAll(): Promise<void> {
    state.isLoading = true;
    try {
      await window.api.documents.enableAll();
      await loadDocuments();
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to enable all';
    } finally {
      state.isLoading = false;
    }
  }

  async function disableAll(): Promise<void> {
    state.isLoading = true;
    try {
      await window.api.documents.disableAll();
      await loadDocuments();
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Failed to disable all';
    } finally {
      state.isLoading = false;
    }
  }

  function setSearchQuery(query: string): void {
    state.searchQuery = query;
  }

  function setSelectedCategory(category: string | null): void {
    state.selectedCategory = category;
  }

  async function refresh(): Promise<RefreshResult> {
    return window.api.documents.refresh();
  }

  async function loadEnrichedCatalog(): Promise<void> {
    try {
      const catalog = await window.api.bibtex.getCatalog();
      state.enrichedCatalog = catalog;
    } catch (err) {
      console.error('Failed to load enriched catalog:', err);
      // Non-fatal - the app works without enrichment
    }
  }

  async function syncBibtex(forceRefresh = false): Promise<void> {
    state.isSyncingBibtex = true;
    try {
      const result = await window.api.bibtex.sync(forceRefresh);
      if (result.success && result.catalog) {
        state.enrichedCatalog = result.catalog;
        toast.success('BibTeX synchronized', {
          description: `${result.stats?.matched ?? 0} documents enriched with metadata`
        });
      } else if (result.error) {
        toast.error('BibTeX sync failed', { description: result.error });
      }
    } catch (err) {
      console.error('Failed to sync BibTeX:', err);
      toast.error('BibTeX sync failed', { description: (err as Error).message });
    } finally {
      state.isSyncingBibtex = false;
    }
  }

  function getEnrichedDocument(docName: string): EnrichedDocument | undefined {
    return enrichedLookup.get(docName);
  }

  async function bulkToggleCategory(category: string, enabled: boolean): Promise<void> {
    const categoryDocs = state.documents.filter((d) => d.categories.includes(category));
    const names = categoryDocs.map((d) => d.name);

    // Optimistic update
    state.documents = state.documents.map((d) =>
      names.includes(d.name) ? { ...d, enabled } : d
    );

    try {
      await window.api.documents.bulkToggle(category, enabled);
    } catch (err) {
      // Revert on error
      await loadDocuments();
      throw err;
    }
  }

  // Responsive helpers
  function setViewportSize(width: number): void {
    state.isMobile = width < 640;
    state.isTablet = width >= 640 && width < 1024;
    if (state.isMobile && !state.filtersCollapsed) {
      state.filtersCollapsed = true; // Auto-collapse on mobile
    }
  }

  function toggleFilters(): void {
    state.filtersCollapsed = !state.filtersCollapsed;
  }

  function setViewMode(mode: 'compact' | 'list' | 'grid'): void {
    state.viewMode = mode;
  }

  return {
    get state() { return state; },
    get filteredDocuments() { return filteredDocuments; },
    get stats() { return stats; },
    get categories() { return categories; },
    get enrichedLookup() { return enrichedLookup; },
    loadDocuments,
    loadConfig,
    loadEnrichedCatalog,
    toggleDocument,
    enableAll,
    disableAll,
    setSearchQuery,
    setSelectedCategory,
    refresh,
    syncBibtex,
    getEnrichedDocument,
    bulkToggleCategory,
    setViewportSize,
    toggleFilters,
    setViewMode
  };
}

export const documentStore = createDocumentStore();
