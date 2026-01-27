# Implementation Plan: Research Config Manager - Phase 2 & 3

**Created**: 2026-01-26
**Depends on**: Phase 1 completion (plan-electron.md)
**Status**: Ready for future implementation

---

## Prerequisites

Before starting Phase 2-3, Phase 1 must be complete:

- [ ] Electron app scaffold with electron-vite
- [ ] Tailwind + shadcn/ui configured
- [ ] Document scope schema (Zod) defined
- [ ] Config service (read/write) working
- [ ] IPC handlers operational
- [ ] Zustand store initialized
- [ ] DocumentList + DocumentItem components rendering
- [ ] Toggle persistence to `.claude/document-scope.json`

---

## Phase 2: PageIndex Integration

**Goal**: Display real metadata from PageIndex and enable refresh for newly indexed documents

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phase 2 Data Flow                             │
└─────────────────────────────────────────────────────────────────┘

Existing Files (Read-Only)                 PageIndex MCP
┌─────────────────────────┐               ┌─────────────────────┐
│ .claude/                │               │ MCP Server          │
│ ├── pageindex-state.json│◄──────┐       │                     │
│ └── document-catalog.md │       │       │ find_relevant_docs()│
└─────────────────────────┘       │       │ get_document()      │
         │                        │       └─────────────────────┘
         │ Read on startup        │                │
         ▼                        │                │ Refresh
┌─────────────────────────────────┴────────────────┴──────────────┐
│                     Config Manager App                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Metadata     │  │ Catalog      │  │ PageIndex            │   │
│  │ Parser       │  │ Parser       │  │ Client               │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│          │                │                    │                 │
│          └────────────────┼────────────────────┘                 │
│                           ▼                                      │
│                  ┌──────────────────┐                            │
│                  │ Unified Document │                            │
│                  │ Store            │                            │
│                  └──────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Tasks

#### Task 2.1: Read pageindex-state.json

**File**: `src/main/services/config-service.ts`

```typescript
// Add to existing ConfigService class

import { z } from 'zod';

const PageIndexPaperSchema = z.object({
  citation_key: z.string(),
  pageindex_name: z.string().nullable(),
  indexed_at: z.string().nullable(),
  page_count: z.number().nullable(),
  status: z.enum(['indexed', 'pending', 'failed', 'not_found'])
});

const PageIndexStateSchema = z.object({
  last_sync: z.string(),
  indexed_papers: z.record(z.string(), PageIndexPaperSchema)
});

export type PageIndexState = z.infer<typeof PageIndexStateSchema>;

export class ConfigService {
  // ... existing methods ...

  async readPageIndexState(): Promise<PageIndexState> {
    const path = join(this.projectPath, '.claude', 'pageindex-state.json');
    const content = await fs.readFile(path, 'utf-8');
    return PageIndexStateSchema.parse(JSON.parse(content));
  }
}
```

**Acceptance Criteria**:
- Reads and validates pageindex-state.json
- Extracts page counts and indexed dates
- Handles missing or malformed file gracefully

---

#### Task 2.2: Parse document-catalog.md

**File**: `src/main/services/catalog-parser.ts`

```typescript
export interface CatalogEntry {
  shortCitation: string;      // "Davis 1989"
  pageIndexName: string;      // Full PageIndex document name
  categories: string[];       // ["TAM", "Foundational"]
  relevance: 'FOUNDATIONAL' | 'CORE' | 'SUPPORTING';
  keyPages?: string;          // "4-6 (theory), 10-15 (Study 1)"
  focus?: string;             // Brief description
}

export interface ParsedCatalog {
  lastUpdated: string;
  totalPapers: number;
  categories: string[];
  entries: CatalogEntry[];
}

export async function parseCatalog(catalogPath: string): Promise<ParsedCatalog> {
  const content = await fs.readFile(catalogPath, 'utf-8');
  const lines = content.split('\n');

  const entries: CatalogEntry[] = [];
  let currentCategory = '';
  let currentSubcategory = '';

  for (const line of lines) {
    // Parse header for metadata
    if (line.startsWith('**Papers indexed:**')) {
      // Extract count
    }

    // Parse category headers
    if (line.startsWith('#### ')) {
      currentSubcategory = line.replace('#### ', '').split(' ')[1];
    }
    if (line.startsWith('### ')) {
      currentCategory = line.replace('### ', '').split('. ')[1];
    }

    // Parse table rows
    if (line.startsWith('| ') && !line.includes('Paper |')) {
      const entry = parseTableRow(line, currentCategory, currentSubcategory);
      if (entry) entries.push(entry);
    }
  }

  return {
    lastUpdated: extractLastUpdated(content),
    totalPapers: entries.length,
    categories: [...new Set(entries.flatMap(e => e.categories))],
    entries
  };
}

function parseTableRow(line: string, category: string, subcategory: string): CatalogEntry | null {
  const cells = line.split('|').map(c => c.trim()).filter(Boolean);
  if (cells.length < 5) return null;

  const [shortCitation, pageIndexName, focus, keyPages, relevance] = cells;

  // Extract document name from backticks
  const nameMatch = pageIndexName.match(/`([^`]+)`/);
  if (!nameMatch) return null;

  return {
    shortCitation,
    pageIndexName: nameMatch[1],
    categories: [category, subcategory].filter(Boolean),
    relevance: parseRelevance(relevance),
    keyPages: keyPages !== 'TBD' ? keyPages : undefined,
    focus
  };
}

function parseRelevance(value: string): 'FOUNDATIONAL' | 'CORE' | 'SUPPORTING' {
  const upper = value.toUpperCase();
  if (upper.includes('FOUNDATIONAL')) return 'FOUNDATIONAL';
  if (upper.includes('CORE')) return 'CORE';
  return 'SUPPORTING';
}
```

**Acceptance Criteria**:
- Extracts all 74 papers from document-catalog.md
- Maps each paper to its categories
- Extracts relevance levels (FOUNDATIONAL, CORE, SUPPORTING)
- Returns structured data for UI consumption

---

#### Task 2.3: Merge Metadata into Document Store

**File**: `src/renderer/stores/document-store.ts`

```typescript
import { create } from 'zustand';

export interface DocumentMetadata {
  // Identity
  name: string;                 // PageIndex document name
  shortCitation: string;        // "Davis 1989"

  // From pageindex-state.json
  pageCount: number;
  indexedAt: string | null;
  status: 'indexed' | 'pending' | 'failed' | 'not_found';

  // From document-catalog.md
  categories: string[];
  relevance: 'FOUNDATIONAL' | 'CORE' | 'SUPPORTING';
  focus?: string;
  keyPages?: string;

  // Computed
  estimatedTokens: number;      // pageCount * 500

  // UI state
  enabled: boolean;
  isNew: boolean;               // Discovered in last refresh
}

interface DocumentStore {
  documents: DocumentMetadata[];
  isLoading: boolean;
  error: string | null;
  lastRefresh: string | null;

  // Actions
  initialize: () => Promise<void>;
  toggleDocument: (name: string, enabled: boolean) => Promise<void>;
  bulkToggle: (names: string[], enabled: boolean) => Promise<void>;
  refresh: () => Promise<RefreshResult>;

  // Selectors
  getByCategory: (category: string) => DocumentMetadata[];
  getEnabled: () => DocumentMetadata[];
  getDisabled: () => DocumentMetadata[];
  getStats: () => DocumentStats;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  isLoading: true,
  error: null,
  lastRefresh: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Fetch all data sources in parallel
      const [scope, pageIndexState, catalog] = await Promise.all([
        window.api.config.read(),
        window.api.documents.getPageIndexState(),
        window.api.documents.getCatalog()
      ]);

      // Merge into unified document list
      const documents = mergeDocumentData(scope, pageIndexState, catalog);

      set({
        documents,
        isLoading: false,
        lastRefresh: scope.lastModified
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ... other actions
}));

function mergeDocumentData(
  scope: DocumentScope,
  state: PageIndexState,
  catalog: ParsedCatalog
): DocumentMetadata[] {
  const documents: DocumentMetadata[] = [];
  const enabledSet = new Set(scope.enabled);
  const disabledSet = new Set(scope.disabled);

  // Create lookup from catalog
  const catalogLookup = new Map(
    catalog.entries.map(e => [e.pageIndexName, e])
  );

  // Iterate over pageindex-state entries
  for (const [key, paper] of Object.entries(state.indexed_papers)) {
    if (!paper.pageindex_name || paper.status !== 'indexed') continue;

    const catalogEntry = catalogLookup.get(paper.pageindex_name);

    documents.push({
      name: paper.pageindex_name,
      shortCitation: catalogEntry?.shortCitation ?? key,
      pageCount: paper.page_count ?? 0,
      indexedAt: paper.indexed_at,
      status: paper.status,
      categories: catalogEntry?.categories ?? ['Uncategorized'],
      relevance: catalogEntry?.relevance ?? 'SUPPORTING',
      focus: catalogEntry?.focus,
      keyPages: catalogEntry?.keyPages,
      estimatedTokens: (paper.page_count ?? 0) * 500,
      enabled: enabledSet.has(paper.pageindex_name) ||
               (!disabledSet.has(paper.pageindex_name) && scope.enabled.length === 0),
      isNew: false
    });
  }

  return documents.sort((a, b) => a.shortCitation.localeCompare(b.shortCitation));
}
```

**Acceptance Criteria**:
- Merges data from 3 sources into unified DocumentMetadata[]
- Handles missing catalog entries gracefully
- Computes token estimates
- Initializes enabled state from scope config

---

#### Task 2.4: PageIndex MCP Client

**File**: `src/main/services/pageindex-client.ts`

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface PageIndexDocument {
  name: string;
  pageCount?: number;
  status: string;
}

export class PageIndexClient {
  private client: Client | null = null;
  private isConnecting = false;

  async connect(): Promise<void> {
    if (this.client || this.isConnecting) return;

    this.isConnecting = true;

    try {
      // PageIndex MCP server command
      const transport = new StdioClientTransport({
        command: 'npx',
        args: ['-y', '@anthropic/mcp-pageindex'],
        env: process.env
      });

      this.client = new Client(
        { name: 'research-config-manager', version: '1.0.0' },
        { capabilities: {} }
      );

      await this.client.connect(transport);
    } finally {
      this.isConnecting = false;
    }
  }

  async listDocuments(limit = 100): Promise<PageIndexDocument[]> {
    await this.ensureConnected();

    const allDocs: PageIndexDocument[] = [];
    let cursor: string | undefined;

    do {
      const result = await this.client!.callTool({
        name: 'find_relevant_documents',
        arguments: { limit, cursor }
      });

      const parsed = this.parseDocumentList(result);
      allDocs.push(...parsed.documents);
      cursor = parsed.nextCursor;
    } while (cursor);

    return allDocs;
  }

  async getDocument(docName: string): Promise<PageIndexDocument | null> {
    await this.ensureConnected();

    try {
      const result = await this.client!.callTool({
        name: 'get_document',
        arguments: { doc_name: docName }
      });

      return this.parseDocument(result);
    } catch {
      return null;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.client) {
      await this.connect();
    }
  }

  private parseDocumentList(result: unknown): {
    documents: PageIndexDocument[];
    nextCursor?: string
  } {
    // Parse MCP tool result into documents array
    // Implementation depends on actual PageIndex response format
    const content = (result as any).content?.[0]?.text;
    if (!content) return { documents: [] };

    try {
      const data = JSON.parse(content);
      return {
        documents: data.documents || [],
        nextCursor: data.cursor
      };
    } catch {
      return { documents: [] };
    }
  }

  private parseDocument(result: unknown): PageIndexDocument | null {
    const content = (result as any).content?.[0]?.text;
    if (!content) return null;

    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  disconnect(): void {
    this.client?.close();
    this.client = null;
  }
}
```

**Acceptance Criteria**:
- Connects to PageIndex MCP server
- Fetches complete document list with pagination
- Handles connection errors gracefully
- Provides clean disconnect

---

#### Task 2.5: Refresh Service

**File**: `src/main/services/refresh-service.ts`

```typescript
export interface RefreshResult {
  success: boolean;
  totalDocuments: number;
  newDocuments: string[];
  removedDocuments: string[];
  error?: string;
}

export class RefreshService {
  constructor(
    private pageIndexClient: PageIndexClient,
    private configService: ConfigService
  ) {}

  async refresh(): Promise<RefreshResult> {
    try {
      // 1. Fetch current documents from PageIndex
      const pageIndexDocs = await this.pageIndexClient.listDocuments();
      const pageIndexNames = new Set(pageIndexDocs.map(d => d.name));

      // 2. Read existing state
      const existingState = await this.configService.readPageIndexState();
      const existingNames = new Set(
        Object.values(existingState.indexed_papers)
          .filter(p => p.pageindex_name && p.status === 'indexed')
          .map(p => p.pageindex_name!)
      );

      // 3. Identify changes
      const newDocs = pageIndexDocs.filter(d => !existingNames.has(d.name));
      const removedDocs = [...existingNames].filter(n => !pageIndexNames.has(n));

      // 4. Read current scope
      const scope = await this.configService.readScope();

      // 5. Add new documents to disabled list (user opts-in)
      const updatedScope = {
        ...scope,
        disabled: [
          ...scope.disabled.filter(d => pageIndexNames.has(d)), // Remove deleted
          ...newDocs.map(d => d.name) // Add new as disabled
        ],
        enabled: scope.enabled.filter(d => pageIndexNames.has(d)), // Remove deleted
        lastModified: new Date().toISOString(),
        metadata: {
          ...scope.metadata,
          totalDocuments: pageIndexDocs.length,
          disabledCount: scope.disabled.length - removedDocs.length + newDocs.length
        }
      };

      // 6. Save updated scope
      await this.configService.writeScope(updatedScope);

      return {
        success: true,
        totalDocuments: pageIndexDocs.length,
        newDocuments: newDocs.map(d => d.name),
        removedDocuments: removedDocs
      };
    } catch (error) {
      return {
        success: false,
        totalDocuments: 0,
        newDocuments: [],
        removedDocuments: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
```

**Acceptance Criteria**:
- Compares PageIndex with local state
- Identifies new and removed documents
- Updates document-scope.json appropriately
- Returns detailed result for UI feedback

---

#### Task 2.6: Refresh Button + Toast

**File**: `src/renderer/components/documents/StatsBar.tsx`

```typescript
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentStore } from '@/stores/document-store';

export function StatsBar() {
  const { documents, refresh, isLoading } = useDocumentStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => ({
    total: documents.length,
    enabled: documents.filter(d => d.enabled).length,
    disabled: documents.filter(d => !d.enabled).length,
    tokens: documents.reduce((sum, d) => sum + d.estimatedTokens, 0)
  }), [documents]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const result = await refresh();

      if (result.success) {
        if (result.newDocuments.length > 0) {
          toast.success(`Found ${result.newDocuments.length} new documents`, {
            description: 'New documents are disabled by default',
            action: {
              label: 'View',
              onClick: () => {
                // Scroll to first new document
                const firstNew = result.newDocuments[0];
                document.getElementById(`doc-${firstNew}`)?.scrollIntoView();
              }
            }
          });
        } else {
          toast.info('No new documents found');
        }

        if (result.removedDocuments.length > 0) {
          toast.warning(`${result.removedDocuments.length} documents no longer in PageIndex`);
        }
      } else {
        toast.error('Refresh failed', {
          description: result.error || 'Could not connect to PageIndex'
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{stats.total} documents</span>
        <span>~{formatTokens(stats.tokens)} tokens</span>
        <span className="text-green-600">{stats.enabled} enabled</span>
        <span className="text-gray-400">{stats.disabled} disabled</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleEnableAll}>
          Enable All
        </Button>
        <Button variant="outline" size="sm" onClick={handleDisableAll}>
          Disable All
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}k`;
  return tokens.toString();
}
```

**Acceptance Criteria**:
- Shows loading spinner during refresh
- Displays toast with new document count
- Shows warning for removed documents
- Provides "View" action to scroll to new docs

---

#### Task 2.7: New Document Highlighting

**File**: `src/renderer/components/documents/DocumentItem.tsx`

```typescript
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentItemProps {
  document: DocumentMetadata;
  onToggle: (enabled: boolean) => void;
}

export function DocumentItem({ document, onToggle }: DocumentItemProps) {
  const {
    name,
    shortCitation,
    categories,
    relevance,
    pageCount,
    estimatedTokens,
    enabled,
    isNew
  } = document;

  return (
    <div
      id={`doc-${name}`}
      className={cn(
        "flex items-start gap-3 p-3 border-b hover:bg-muted/50 transition-colors",
        isNew && "bg-amber-50 dark:bg-amber-950/20 border-l-2 border-l-amber-500"
      )}
    >
      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{shortCitation}</span>
          {isNew && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              NEW
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {categories.map(cat => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              relevance === 'FOUNDATIONAL' && "border-purple-300 text-purple-700",
              relevance === 'CORE' && "border-blue-300 text-blue-700",
              relevance === 'SUPPORTING' && "border-gray-300 text-gray-500"
            )}
          >
            {relevance}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {pageCount}p ~{formatTokens(estimatedTokens)} tok
          </span>
        </div>
      </div>

      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        className="flex-shrink-0"
      />
    </div>
  );
}
```

**Acceptance Criteria**:
- New documents have amber highlight
- "NEW" badge appears on recently discovered docs
- Categories display as colored badges
- Relevance level shows with appropriate styling

---

### 2.3 IPC Handlers for Phase 2

Add to `src/main/ipc/handlers.ts`:

```typescript
// New handlers for Phase 2
ipcMain.handle(IPC_CHANNELS.DOCUMENTS_GET_PAGEINDEX_STATE, async () => {
  return configService.readPageIndexState();
});

ipcMain.handle(IPC_CHANNELS.DOCUMENTS_GET_CATALOG, async () => {
  const catalogPath = join(projectPath, '.claude', 'document-catalog.md');
  return parseCatalog(catalogPath);
});

ipcMain.handle(IPC_CHANNELS.DOCUMENTS_REFRESH, async () => {
  return refreshService.refresh();
});
```

---

### 2.4 Phase 2 Deliverables

- [ ] Real page counts from pageindex-state.json
- [ ] Categories from document-catalog.md
- [ ] Relevance levels (FOUNDATIONAL/CORE/SUPPORTING)
- [ ] Refresh button connects to PageIndex MCP
- [ ] New documents highlighted with amber styling
- [ ] Toast notifications for refresh results

---

## Phase 3: Categories & Bulk Operations

**Goal**: Enable category-based filtering and bulk document management

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phase 3 UI Enhancement                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ [🔍 Search documents...]                                         │
│                                                                  │
│ Category: [All ▼]  |  [TAM] [Trust] [Framing] [Methodology]     │
│                       ↑ Click to filter    ↑ Click to bulk toggle│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Filtered Document List                                           │
│ • Search filters by name/citation                               │
│ • Category dropdown filters by single category                   │
│ • Category chips toggle entire category on/off                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Tasks

#### Task 3.1: Extract Categories from Catalog

**File**: `src/main/services/catalog-parser.ts` (extend)

```typescript
export interface CategorySummary {
  name: string;
  documentCount: number;
  enabledCount: number;
  totalTokens: number;
}

export function extractCategories(
  catalog: ParsedCatalog,
  documents: DocumentMetadata[]
): CategorySummary[] {
  const categoryMap = new Map<string, {
    docs: string[];
    enabled: number;
    tokens: number;
  }>();

  // Build category -> documents mapping
  for (const entry of catalog.entries) {
    for (const category of entry.categories) {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { docs: [], enabled: 0, tokens: 0 });
      }

      const doc = documents.find(d => d.name === entry.pageIndexName);
      if (doc) {
        const cat = categoryMap.get(category)!;
        cat.docs.push(doc.name);
        if (doc.enabled) cat.enabled++;
        cat.tokens += doc.estimatedTokens;
      }
    }
  }

  // Convert to array sorted by document count
  return Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      name,
      documentCount: data.docs.length,
      enabledCount: data.enabled,
      totalTokens: data.tokens
    }))
    .sort((a, b) => b.documentCount - a.documentCount);
}
```

**Acceptance Criteria**:
- Extracts all unique categories
- Counts documents per category
- Calculates enabled count and token totals

---

#### Task 3.2: Category Filter Dropdown

**File**: `src/renderer/components/documents/DocumentFilters.tsx`

```typescript
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DocumentFiltersProps {
  searchQuery: string;
  selectedCategory: string | null;
  categories: CategorySummary[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
}

export function DocumentFilters({
  searchQuery,
  selectedCategory,
  categories,
  onSearchChange,
  onCategoryChange
}: DocumentFiltersProps) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category Dropdown */}
      <Select
        value={selectedCategory ?? 'all'}
        onValueChange={(v) => onCategoryChange(v === 'all' ? null : v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All categories ({categories.reduce((sum, c) => sum + c.documentCount, 0)})
          </SelectItem>
          {categories.map(cat => (
            <SelectItem key={cat.name} value={cat.name}>
              {cat.name} ({cat.documentCount})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

**Acceptance Criteria**:
- Search filters documents by name/citation
- Dropdown shows all categories with counts
- "All categories" option shows total count

---

#### Task 3.3: Category Badges on Items

Already implemented in Task 2.7. Extend with click-to-filter:

```typescript
// In DocumentItem.tsx
<Badge
  key={cat}
  variant="secondary"
  className="text-xs cursor-pointer hover:bg-secondary/80"
  onClick={() => onCategoryClick?.(cat)}
>
  {cat}
</Badge>
```

---

#### Task 3.4: Bulk Enable/Disable by Category

**File**: `src/renderer/components/documents/CategoryChips.tsx`

```typescript
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  categories: CategorySummary[];
  onToggleCategory: (category: string, enabled: boolean) => void;
}

export function CategoryChips({ categories, onToggleCategory }: CategoryChipsProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 overflow-x-auto">
      <span className="text-xs text-muted-foreground flex-shrink-0">
        Bulk toggle:
      </span>

      {categories.map(cat => {
        const allEnabled = cat.enabledCount === cat.documentCount;
        const someEnabled = cat.enabledCount > 0 && !allEnabled;

        return (
          <Badge
            key={cat.name}
            variant="outline"
            className={cn(
              "cursor-pointer transition-colors flex items-center gap-1",
              allEnabled && "bg-green-100 border-green-300 text-green-800",
              someEnabled && "bg-yellow-50 border-yellow-300 text-yellow-800",
              !someEnabled && !allEnabled && "bg-gray-50"
            )}
            onClick={() => onToggleCategory(cat.name, !allEnabled)}
          >
            {allEnabled ? (
              <Check className="h-3 w-3" />
            ) : someEnabled ? (
              <span className="h-3 w-3 flex items-center justify-center text-xs">◐</span>
            ) : (
              <X className="h-3 w-3 text-gray-400" />
            )}
            {cat.name}
            <span className="text-xs opacity-60">
              {cat.enabledCount}/{cat.documentCount}
            </span>
          </Badge>
        );
      })}
    </div>
  );
}
```

**Acceptance Criteria**:
- Shows all categories as clickable chips
- Green = all enabled, Yellow = some enabled, Gray = none
- Click toggles all documents in category
- Shows enabled/total count

---

#### Task 3.5: Enable All / Disable All

**File**: `src/renderer/stores/document-store.ts` (extend)

```typescript
// Add to store actions
enableAll: async () => {
  const documents = get().documents;
  const allNames = documents.map(d => d.name);

  // Optimistic update
  set(state => ({
    documents: state.documents.map(d => ({ ...d, enabled: true }))
  }));

  try {
    await window.api.documents.bulkToggle('__all__', true);
  } catch (error) {
    // Rollback on error
    set(state => ({
      documents: state.documents.map(d => ({
        ...d,
        enabled: allNames.includes(d.name) ? d.enabled : d.enabled
      }))
    }));
    throw error;
  }
},

disableAll: async () => {
  // Similar implementation with enabled: false
},

toggleCategory: async (category: string, enabled: boolean) => {
  const documents = get().documents;
  const categoryDocs = documents.filter(d => d.categories.includes(category));
  const names = categoryDocs.map(d => d.name);

  // Optimistic update
  set(state => ({
    documents: state.documents.map(d =>
      names.includes(d.name) ? { ...d, enabled } : d
    )
  }));

  try {
    await window.api.documents.bulkToggle(category, enabled);
  } catch (error) {
    // Rollback
    await get().initialize();
    throw error;
  }
},
```

**IPC Handler** (`src/main/ipc/handlers.ts`):

```typescript
ipcMain.handle(IPC_CHANNELS.DOCUMENTS_BULK_TOGGLE, async (_, category: string, enabled: boolean) => {
  const scope = await configService.readScope();
  const catalog = await parseCatalog(catalogPath);

  let docsToToggle: string[];

  if (category === '__all__') {
    docsToToggle = catalog.entries.map(e => e.pageIndexName);
  } else {
    docsToToggle = catalog.entries
      .filter(e => e.categories.includes(category))
      .map(e => e.pageIndexName);
  }

  const newEnabled = enabled
    ? [...new Set([...scope.enabled, ...docsToToggle])]
    : scope.enabled.filter(d => !docsToToggle.includes(d));

  const newDisabled = enabled
    ? scope.disabled.filter(d => !docsToToggle.includes(d))
    : [...new Set([...scope.disabled, ...docsToToggle])];

  await configService.writeScope({
    ...scope,
    enabled: newEnabled,
    disabled: newDisabled,
    lastModified: new Date().toISOString()
  });
});
```

**Acceptance Criteria**:
- "Enable All" enables every document
- "Disable All" disables every document
- Category toggle affects only that category
- Optimistic updates with rollback on error

---

### 3.3 Phase 3 Deliverables

- [ ] Search filters documents by name
- [ ] Category dropdown filters to single category
- [ ] Category chips show enable state (all/some/none)
- [ ] Click category chip to bulk toggle
- [ ] Enable All / Disable All work correctly
- [ ] Optimistic updates for responsive UI

---

## Testing Checklist

### Phase 2 Tests

```typescript
// Unit tests
describe('CatalogParser', () => {
  it('parses all 74 papers from document-catalog.md');
  it('extracts categories correctly');
  it('handles missing relevance gracefully');
});

describe('RefreshService', () => {
  it('identifies new documents');
  it('identifies removed documents');
  it('adds new docs to disabled list');
});

// Integration tests
describe('PageIndex Integration', () => {
  it('connects to MCP server');
  it('fetches document list with pagination');
  it('handles connection failure gracefully');
});
```

### Phase 3 Tests

```typescript
describe('Filtering', () => {
  it('search filters by document name');
  it('search filters by short citation');
  it('category dropdown filters correctly');
  it('filters are combinable');
});

describe('Bulk Operations', () => {
  it('enable all enables all documents');
  it('disable all disables all documents');
  it('category toggle affects only that category');
  it('optimistic updates work correctly');
  it('rollback on error works');
});
```

---

## Migration Notes

### From Phase 1 to Phase 2

1. No breaking changes to document-scope.json
2. New files read (pageindex-state.json, document-catalog.md)
3. New IPC channels added
4. Store gains additional metadata fields

### From Phase 2 to Phase 3

1. No schema changes
2. UI components added (CategoryChips, DocumentFilters)
3. Store gains filter/search state
4. New bulk toggle IPC handler

---

## Estimated Effort

| Phase | Tasks | Complexity | Notes |
|-------|-------|------------|-------|
| Phase 2 | 7 tasks | Medium | MCP client is main complexity |
| Phase 3 | 5 tasks | Low | Pure UI work |

---

*Plan created 2026-01-26. Execute after Phase 1 completion.*
