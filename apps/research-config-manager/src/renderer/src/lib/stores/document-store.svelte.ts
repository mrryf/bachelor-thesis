import type { DocumentMetadata, DocumentScope, RefreshResult, ExternalChangeEvent } from '@shared/types';
import { toast } from 'svelte-sonner';

interface DocumentState {
  documents: DocumentMetadata[];
  config: DocumentScope | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  // Responsive state
  viewMode: 'compact' | 'list' | 'grid';
  isMobile: boolean;
  isTablet: boolean;
  filtersCollapsed: boolean;
}

class DocumentStore {
  state = $state<DocumentState>({
    documents: [],
    config: null,
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,
    // Responsive defaults
    viewMode: 'compact',
    isMobile: false,
    isTablet: false,
    filtersCollapsed: false
  });

  // Computed: filtered documents based on search query and selected category
  get filteredDocuments(): DocumentMetadata[] {
    let filtered = this.state.documents;

    // Filter by category
    if (this.state.selectedCategory) {
      filtered = filtered.filter((doc) => doc.categories.includes(this.state.selectedCategory!));
    }

    // Filter by search query
    if (this.state.searchQuery.trim()) {
      const query = this.state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.shortCitation.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  // Computed: document statistics
  get stats(): {
    total: number;
    enabled: number;
    disabled: number;
    totalPages: number;
    totalTokens: number;
    enabledTokens: number;
  } {
    const enabled = this.state.documents.filter((d) => d.enabled);
    const disabled = this.state.documents.filter((d) => !d.enabled);

    return {
      total: this.state.documents.length,
      enabled: enabled.length,
      disabled: disabled.length,
      totalPages: this.state.documents.reduce((sum, d) => sum + d.pages, 0),
      totalTokens: this.state.documents.reduce((sum, d) => sum + d.tokenEstimate, 0),
      enabledTokens: enabled.reduce((sum, d) => sum + d.tokenEstimate, 0)
    };
  }

  // Computed: categories with counts
  get categories(): Array<{ name: string; count: number; enabledCount: number }> {
    const categoryMap = new Map<string, { count: number; enabledCount: number }>();

    for (const doc of this.state.documents) {
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
  }

  // Actions
  async loadDocuments(): Promise<void> {
    this.state.isLoading = true;
    this.state.error = null;
    try {
      const documents = await window.api.documents.list();
      this.state.documents = documents;
      this.state.isLoading = false;
    } catch (err) {
      this.state.error = err instanceof Error ? err.message : 'Failed to load documents';
      this.state.isLoading = false;
    }
  }

  async loadConfig(): Promise<void> {
    try {
      const config = await window.api.config.read();
      this.state.config = config;

      // Subscribe to config updates (from our own changes)
      window.api.config.onUpdate((updatedConfig: DocumentScope) => {
        this.state.config = updatedConfig;
        // Reload documents to reflect new enabled/disabled state
        this.loadDocuments();
      });

      // Subscribe to external config changes (from other tools or manual edits)
      window.api.config.onExternalChange((event: ExternalChangeEvent) => {
        console.log('External config change detected:', event.file);
        toast.info('Configuration changed externally', {
          description: `${event.file} was modified outside the app`,
          action: {
            label: 'Reload',
            onClick: () => this.loadDocuments()
          },
          duration: 5000
        });

        // Auto-reload after a brief delay
        setTimeout(() => {
          this.loadDocuments();
          this.loadConfig();
        }, 1000);
      });
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  }

  async toggleDocument(docName: string, enabled: boolean): Promise<void> {
    // Optimistic update
    this.state.documents = this.state.documents.map((doc) =>
      doc.name === docName ? { ...doc, enabled } : doc
    );

    try {
      await window.api.documents.toggle(docName, enabled);
    } catch (err) {
      // Revert on error
      this.state.documents = this.state.documents.map((doc) =>
        doc.name === docName ? { ...doc, enabled: !enabled } : doc
      );
      this.state.error = err instanceof Error ? err.message : 'Failed to toggle document';
    }
  }

  async enableAll(): Promise<void> {
    this.state.isLoading = true;
    try {
      await window.api.documents.enableAll();
      await this.loadDocuments();
    } catch (err) {
      this.state.error = err instanceof Error ? err.message : 'Failed to enable all';
    } finally {
      this.state.isLoading = false;
    }
  }

  async disableAll(): Promise<void> {
    this.state.isLoading = true;
    try {
      await window.api.documents.disableAll();
      await this.loadDocuments();
    } catch (err) {
      this.state.error = err instanceof Error ? err.message : 'Failed to disable all';
    } finally {
      this.state.isLoading = false;
    }
  }

  setSearchQuery(query: string): void {
    this.state.searchQuery = query;
  }

  setSelectedCategory(category: string | null): void {
    this.state.selectedCategory = category;
  }

  async refresh(): Promise<RefreshResult> {
    return window.api.documents.refresh();
  }

  async bulkToggleCategory(category: string, enabled: boolean): Promise<void> {
    const categoryDocs = this.state.documents.filter((d) => d.categories.includes(category));
    const names = categoryDocs.map((d) => d.name);

    // Optimistic update
    this.state.documents = this.state.documents.map((d) =>
      names.includes(d.name) ? { ...d, enabled } : d
    );

    try {
      await window.api.documents.bulkToggle(category, enabled);
    } catch (err) {
      // Revert on error
      await this.loadDocuments();
      throw err;
    }
  }

  // Responsive helpers
  setViewportSize(width: number): void {
    this.state.isMobile = width < 640;
    this.state.isTablet = width >= 640 && width < 1024;
    if (this.state.isMobile && !this.state.filtersCollapsed) {
      this.state.filtersCollapsed = true; // Auto-collapse on mobile
    }
  }

  toggleFilters(): void {
    this.state.filtersCollapsed = !this.state.filtersCollapsed;
  }

  setViewMode(mode: 'compact' | 'list' | 'grid'): void {
    this.state.viewMode = mode;
  }
}

export const documentStore = new DocumentStore();
