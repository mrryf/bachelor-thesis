# Implementation Plan: Research Config Manager (Electron App)

**Created:** 2026-01-26
**Status:** Ready for Implementation
**Based on:** research-config-manager.md

---

## 1. Project Overview

### 1.1 Purpose

Build an Electron desktop application to manage document queryability and agent configurations for Claude Code research workflows. The app provides a visual interface to:

1. **Toggle documents** - Enable/disable which PageIndex documents Claude can query
2. **Refresh documents** - Fetch newly indexed papers from PageIndex
3. **View metadata** - See page counts, token estimates, and categories per document
4. **Bulk operations** - Enable/disable by category, enable all, disable all

### 1.2 Key Decisions (User-Confirmed)

| Decision | Choice |
|----------|--------|
| MVP Scope | Documents only (Phase 1) |
| Config Location | Project-level `.claude/` |
| Apply Changes | Immediate via hooks |
| Refresh Source | PageIndex (fetch newly indexed documents) |

### 1.3 Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                Research Config Manager (Electron)            │
├─────────────────────────────────────────────────────────────┤
│  React 19 Frontend (shadcn/ui, Tailwind)                    │
│  ├── Documents tab with search/filter/toggle                │
│  ├── Statistics bar (counts, tokens, enabled/disabled)      │
│  └── Refresh button → PageIndex MCP                         │
├─────────────────────────────────────────────────────────────┤
│  Electron Main Process                                       │
│  ├── IPC handlers for file operations                       │
│  ├── PageIndex MCP client (document list)                   │
│  ├── File watcher (.claude/document-scope.json)             │
│  └── Safe atomic writes                                     │
└─────────────────────────────────────────────────────────────┘
           │                              │
           │ Writes config                │ Calls MCP
           ▼                              ▼
┌──────────────────────┐    ┌───────────────────────────────┐
│ .claude/             │    │ PageIndex MCP Server          │
│ ├── document-scope   │    │ find_relevant_documents()     │
│ │   .json            │    │ get_document()                │
│ ├── pageindex-state  │    └───────────────────────────────┘
│ │   .json (read)     │
│ └── document-catalog │
│     .md (read)       │
└──────────────────────┘
           │
           │ Read by Claude Code
           ▼
┌──────────────────────────────────────────────────────────────┐
│ Claude Code CLI                                               │
│ ├── Reads document-scope.json at session start                │
│ ├── Injects active scope into system prompt                   │
│ └── pageindex-context-manager enforces filtering              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Architecture

### 2.1 Tech Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Electron 31+ | Desktop app with native feel |
| Build Tool | electron-vite | Fast builds, hot reload |
| Frontend | React 19 | Matches Cloud Config Manager |
| Language | TypeScript (strict) | Type safety |
| Styling | Tailwind CSS 4 | Utility-first, fast iteration |
| UI Components | shadcn/ui | Accessible, customizable |
| State | Zustand | Lightweight, simple |
| File Watching | chokidar | Cross-platform file events |
| Validation | Zod | Runtime schema validation |
| MCP Client | @modelcontextprotocol/sdk | Official MCP SDK |

### 2.2 Project Structure

```
apps/
└── research-config-manager/
    ├── package.json
    ├── electron.vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    │
    ├── src/
    │   ├── main/                      # Electron main process
    │   │   ├── index.ts               # Entry point
    │   │   ├── ipc/
    │   │   │   ├── handlers.ts        # IPC handlers
    │   │   │   └── channels.ts        # Type-safe channel defs
    │   │   ├── services/
    │   │   │   ├── config-service.ts  # Read/write configs
    │   │   │   ├── pageindex-client.ts# MCP client
    │   │   │   └── file-watcher.ts    # chokidar setup
    │   │   └── utils/
    │   │       └── atomic-write.ts    # Safe file writes
    │   │
    │   ├── preload/
    │   │   └── index.ts               # Context bridge
    │   │
    │   └── renderer/                  # React app
    │       ├── index.html
    │       ├── main.tsx
    │       ├── App.tsx
    │       ├── components/
    │       │   ├── ui/                # shadcn components
    │       │   ├── documents/
    │       │   │   ├── DocumentList.tsx
    │       │   │   ├── DocumentItem.tsx
    │       │   │   ├── DocumentFilters.tsx
    │       │   │   └── StatsBar.tsx
    │       │   └── layout/
    │       │       ├── Header.tsx
    │       │       └── TabBar.tsx
    │       ├── stores/
    │       │   └── document-store.ts  # Zustand store
    │       ├── hooks/
    │       │   ├── useDocuments.ts
    │       │   └── useConfig.ts
    │       ├── lib/
    │       │   ├── api.ts             # IPC wrapper
    │       │   └── utils.ts
    │       └── styles/
    │           └── globals.css
    │
    └── resources/                     # App icons, assets
```

### 2.3 Data Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                           User Actions                              │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────┐
│ Renderer Process (React)                                           │
│                                                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐    │
│  │ DocumentList│───▶│ Zustand     │───▶│ IPC invoke          │    │
│  │ Component   │    │ Store       │    │ (window.api.*)      │    │
│  └─────────────┘    └─────────────┘    └─────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ ipcRenderer.invoke
┌────────────────────────────────────────────────────────────────────┐
│ Main Process (Node.js)                                             │
│                                                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐    │
│  │ IPC Handler │───▶│ Config      │───▶│ File System         │    │
│  │             │    │ Service     │    │ (atomic writes)     │    │
│  └─────────────┘    └─────────────┘    └─────────────────────┘    │
│         │                                                          │
│         ▼                                                          │
│  ┌─────────────────────┐                                          │
│  │ PageIndex Client    │──────▶ MCP Server                        │
│  │ (refresh documents) │                                          │
│  └─────────────────────┘                                          │
└────────────────────────────────────────────────────────────────────┘
                                │
                                ▼ File watcher events
┌────────────────────────────────────────────────────────────────────┐
│ Renderer receives updates via IPC                                  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Configuration Schema

### 3.1 Document Scope Config

**File:** `.claude/document-scope.json`

```typescript
// src/main/schemas/document-scope.ts
import { z } from 'zod';

export const DocumentScopeSchema = z.object({
  version: z.literal('1.0'),
  lastModified: z.string().datetime(),

  // Documents enabled for Claude to query
  enabled: z.array(z.string()),  // PageIndex document names

  // Documents explicitly disabled
  disabled: z.array(z.string()),

  // Category-based bulk settings
  categories: z.record(z.string(), z.object({
    enabled: z.boolean(),
    documents: z.array(z.string())
  })).optional(),

  // Metadata for UI (not used by Claude)
  metadata: z.object({
    totalDocuments: z.number(),
    totalPages: z.number(),
    estimatedTokens: z.number(),
    enabledCount: z.number(),
    disabledCount: z.number()
  }).optional()
});

export type DocumentScope = z.infer<typeof DocumentScopeSchema>;
```

**Example:**
```json
{
  "version": "1.0",
  "lastModified": "2026-01-26T14:30:00Z",
  "enabled": [
    "Davis - 1989 - Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology.pdf",
    "Baroni et al. - 2022 - AI-TAM a model to investigate user acceptance and collaborative intention in human-in-the-loop AI a.pdf",
    "Lee and See - 2004 - Trust in Automation Designing for Appropriate Reliance.pdf"
  ],
  "disabled": [
    "Bentler - 1995 - EQS 6 Structural equations program manual.pdf",
    "Kelle - 2008 - Die Integration qualitativer und quantitativer Methoden in der empirischen Sozialforschung.pdf"
  ],
  "categories": {
    "TAM": {
      "enabled": true,
      "documents": [
        "Davis - 1989 - Perceived Usefulness, Perceived Ease of Use, and User Acceptance of Information Technology.pdf",
        "Baroni et al. - 2022 - AI-TAM a model to investigate user acceptance and collaborative intention in human-in-the-loop AI a.pdf"
      ]
    },
    "Methodology": {
      "enabled": false,
      "documents": [
        "Bentler - 1995 - EQS 6 Structural equations program manual.pdf"
      ]
    }
  },
  "metadata": {
    "totalDocuments": 63,
    "totalPages": 2847,
    "estimatedTokens": 1423500,
    "enabledCount": 3,
    "disabledCount": 2
  }
}
```

### 3.2 Document Metadata (Read-Only)

The app reads from existing files:

**`.claude/pageindex-state.json`** - Document inventory with page counts
**`.claude/document-catalog.md`** - Category assignments and key pages

### 3.3 App Settings

**File:** `~/.config/research-config-manager/settings.json` (app-level, not project)

```typescript
export const AppSettingsSchema = z.object({
  version: z.literal('1.0'),
  recentProjects: z.array(z.string()),  // Recently opened project paths
  windowBounds: z.object({
    x: z.number().optional(),
    y: z.number().optional(),
    width: z.number(),
    height: z.number()
  }).optional(),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  tokenEstimateMultiplier: z.number().default(500)  // tokens per page
});
```

---

## 4. UI Components

### 4.1 Main Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Research Config Manager                              [—] [□] [✕]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [🔍 Search documents...]                                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ 63 documents   ~1.4M tokens   [42 enabled] [21 disabled]        │
│  │                                           [Enable All] [↻]      │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                     │
│  Category: [All ▼]                                                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ [📄] Davis - 1989 - Perceived Usefulness...                     │
│  │      [TAM] [FOUNDATIONAL] [23p ~11.5k tok]          [Toggle ●─] │
│  ├─────────────────────────────────────────────────────────────────┤
│  │ [📄] Baroni et al. - 2022 - AI-TAM...                           │
│  │      [TAM] [Trust] [FOUNDATIONAL] [21p ~10.5k tok]  [Toggle ●─] │
│  ├─────────────────────────────────────────────────────────────────┤
│  │ [📄] Lee and See - 2004 - Trust in Automation...                │
│  │      [Trust] [FOUNDATIONAL] [31p ~15.5k tok]        [Toggle ●─] │
│  ├─────────────────────────────────────────────────────────────────┤
│  │ [📄] Bentler - 1995 - EQS 6 Structural...                       │
│  │      [Methodology] [SUPPORTING] [422p ~211k tok]    [Toggle ○─] │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                     │
│  Status: Config saved • Last sync: 2 min ago                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Specifications

#### StatsBar Component
```typescript
interface StatsBarProps {
  totalDocuments: number;
  totalTokens: number;
  enabledCount: number;
  disabledCount: number;
  onEnableAll: () => void;
  onDisableAll: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}
```

#### DocumentItem Component
```typescript
interface DocumentItemProps {
  name: string;           // PageIndex document name
  shortName: string;      // Display name (truncated)
  categories: string[];   // Category badges
  relevance: 'FOUNDATIONAL' | 'CORE' | 'SUPPORTING';
  pageCount: number;
  tokenEstimate: number;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}
```

#### DocumentFilters Component
```typescript
interface DocumentFiltersProps {
  searchQuery: string;
  selectedCategory: string | 'all';
  categories: string[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string | 'all') => void;
}
```

### 4.3 shadcn/ui Components to Install

```bash
# Core components
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add switch
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add scroll-area
npx shadcn@latest add separator
npx shadcn@latest add tooltip
npx shadcn@latest add sonner  # Toast notifications
```

---

## 5. IPC Communication

### 5.1 Channel Definitions

```typescript
// src/main/ipc/channels.ts
export const IPC_CHANNELS = {
  // Config operations
  CONFIG_READ: 'config:read',
  CONFIG_WRITE: 'config:write',
  CONFIG_WATCH: 'config:watch',

  // Document operations
  DOCUMENTS_LIST: 'documents:list',
  DOCUMENTS_REFRESH: 'documents:refresh',
  DOCUMENTS_TOGGLE: 'documents:toggle',
  DOCUMENTS_BULK_TOGGLE: 'documents:bulk-toggle',

  // App operations
  APP_GET_PROJECT_PATH: 'app:get-project-path',
  APP_OPEN_PROJECT: 'app:open-project',
} as const;
```

### 5.2 Preload Script

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

export type API = {
  config: {
    read: () => Promise<DocumentScope>;
    write: (scope: DocumentScope) => Promise<void>;
    onUpdate: (callback: (scope: DocumentScope) => void) => void;
  };
  documents: {
    list: () => Promise<DocumentMetadata[]>;
    refresh: () => Promise<RefreshResult>;
    toggle: (docName: string, enabled: boolean) => Promise<void>;
    bulkToggle: (category: string, enabled: boolean) => Promise<void>;
  };
  app: {
    getProjectPath: () => Promise<string>;
    openProject: (path: string) => Promise<void>;
  };
};

const api: API = {
  config: {
    read: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_READ),
    write: (scope) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_WRITE, scope),
    onUpdate: (callback) => {
      ipcRenderer.on(IPC_CHANNELS.CONFIG_WATCH, (_, scope) => callback(scope));
    },
  },
  documents: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_LIST),
    refresh: () => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_REFRESH),
    toggle: (docName, enabled) =>
      ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_TOGGLE, docName, enabled),
    bulkToggle: (category, enabled) =>
      ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_BULK_TOGGLE, category, enabled),
  },
  app: {
    getProjectPath: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PROJECT_PATH),
    openProject: (path) => ipcRenderer.invoke(IPC_CHANNELS.APP_OPEN_PROJECT, path),
  },
};

contextBridge.exposeInMainWorld('api', api);
```

---

## 6. PageIndex Refresh Implementation

### 6.1 MCP Client Setup

```typescript
// src/main/services/pageindex-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export class PageIndexClient {
  private client: Client | null = null;

  async connect(): Promise<void> {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@anthropic/mcp-pageindex']
    });

    this.client = new Client({
      name: 'research-config-manager',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await this.client.connect(transport);
  }

  async listDocuments(): Promise<PageIndexDocument[]> {
    if (!this.client) throw new Error('Client not connected');

    const result = await this.client.callTool({
      name: 'find_relevant_documents',
      arguments: { limit: 100 }  // Fetch all documents
    });

    return this.parseDocuments(result);
  }

  async getDocumentMetadata(docName: string): Promise<DocumentMetadata> {
    if (!this.client) throw new Error('Client not connected');

    const result = await this.client.callTool({
      name: 'get_document',
      arguments: { doc_name: docName }
    });

    return this.parseMetadata(result);
  }

  disconnect(): void {
    this.client?.close();
    this.client = null;
  }
}
```

### 6.2 Refresh Flow

```typescript
// src/main/services/refresh-service.ts
export class RefreshService {
  constructor(
    private pageIndexClient: PageIndexClient,
    private configService: ConfigService
  ) {}

  async refresh(): Promise<RefreshResult> {
    // 1. Fetch current documents from PageIndex
    const pageIndexDocs = await this.pageIndexClient.listDocuments();

    // 2. Read existing pageindex-state.json
    const existingState = await this.configService.readPageIndexState();

    // 3. Identify new documents
    const existingNames = new Set(
      Object.values(existingState.indexed_papers)
        .map(p => p.pageindex_name)
        .filter(Boolean)
    );

    const newDocuments = pageIndexDocs.filter(
      doc => !existingNames.has(doc.name)
    );

    // 4. Read current scope config
    const scope = await this.configService.readScope();

    // 5. Add new documents to disabled list (user must enable explicitly)
    const updatedScope: DocumentScope = {
      ...scope,
      disabled: [...scope.disabled, ...newDocuments.map(d => d.name)],
      lastModified: new Date().toISOString(),
      metadata: {
        ...scope.metadata,
        totalDocuments: pageIndexDocs.length,
        disabledCount: (scope.metadata?.disabledCount ?? 0) + newDocuments.length
      }
    };

    // 6. Save updated scope
    await this.configService.writeScope(updatedScope);

    return {
      total: pageIndexDocs.length,
      newCount: newDocuments.length,
      newDocuments: newDocuments.map(d => d.name)
    };
  }
}
```

### 6.3 Refresh UI Flow

```
User clicks [↻] Refresh
        │
        ▼
┌───────────────────────────────┐
│ Show loading spinner          │
│ "Fetching documents..."       │
└───────────────────────────────┘
        │
        ▼ IPC: documents:refresh
┌───────────────────────────────┐
│ Main process:                 │
│ 1. Connect to PageIndex MCP   │
│ 2. Call find_relevant_docs()  │
│ 3. Compare with existing      │
│ 4. Add new docs to disabled   │
│ 5. Save document-scope.json   │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ Show toast notification:      │
│ "Found 3 new documents"       │
│ [View] [Dismiss]              │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ Scroll to first new document  │
│ Highlight new items briefly   │
└───────────────────────────────┘
```

---

## 7. Claude Code Integration

### 7.1 Document Scope Injection

The app writes `.claude/document-scope.json`. Claude Code integration works via:

**Option A: CLAUDE.md Update (Recommended)**

Add to CLAUDE.md:
```markdown
## Active Document Scope

Before querying PageIndex, check `.claude/document-scope.json`:
- Only query documents in the `enabled` array
- Ignore documents in the `disabled` array
- If a document is in neither, treat as enabled (backwards compatible)
```

**Option B: pageindex-context-manager Agent Update**

Update `.claude/agents/pageindex-context-manager.md` to read scope config:
```markdown
## Document Scope Enforcement

Before any PageIndex query:
1. Read `.claude/document-scope.json`
2. Filter results to only include enabled documents
3. Refuse to extract content from disabled documents

If document-scope.json doesn't exist, allow all documents.
```

### 7.2 Hook for Immediate Updates

Create `.claude/hooks.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__pageindex__.*",
        "command": "cat .claude/document-scope.json | jq -r '.enabled[]' > /tmp/active-scope.txt"
      }
    ]
  }
}
```

Note: Claude Code hooks are still evolving. The current approach relies on prompt injection being respected.

---

## 8. Implementation Phases

### Phase 1: Foundation (MVP)

**Goal:** Working document toggle that persists to config file

| Task | Description | Files |
|------|-------------|-------|
| 1.1 | Project scaffold with electron-vite | `package.json`, configs |
| 1.2 | Tailwind + shadcn/ui setup | `tailwind.config.ts`, globals.css |
| 1.3 | Document scope schema (Zod) | `src/main/schemas/` |
| 1.4 | Config service (read/write) | `src/main/services/config-service.ts` |
| 1.5 | Atomic file writer | `src/main/utils/atomic-write.ts` |
| 1.6 | IPC handlers | `src/main/ipc/handlers.ts` |
| 1.7 | Preload script | `src/preload/index.ts` |
| 1.8 | Zustand store | `src/renderer/stores/document-store.ts` |
| 1.9 | DocumentList component | `src/renderer/components/documents/` |
| 1.10 | Toggle persistence | Wire up IPC to save |

**Deliverable:** Toggle documents, see changes in `.claude/document-scope.json`

### Phase 2: PageIndex Integration

**Goal:** Display real metadata and refresh from PageIndex

| Task | Description | Files |
|------|-------------|-------|
| 2.1 | Read pageindex-state.json | `config-service.ts` |
| 2.2 | Parse document-catalog.md | `catalog-parser.ts` |
| 2.3 | Merge metadata into UI | `document-store.ts` |
| 2.4 | PageIndex MCP client | `pageindex-client.ts` |
| 2.5 | Refresh service | `refresh-service.ts` |
| 2.6 | Refresh button + toast | `StatsBar.tsx` |
| 2.7 | New document highlighting | `DocumentItem.tsx` |

**Deliverable:** Refresh button fetches new documents from PageIndex

### Phase 3: Categories & Bulk

**Goal:** Category filtering and bulk operations

| Task | Description | Files |
|------|-------------|-------|
| 3.1 | Extract categories from catalog | `catalog-parser.ts` |
| 3.2 | Category filter dropdown | `DocumentFilters.tsx` |
| 3.3 | Category badges on items | `DocumentItem.tsx` |
| 3.4 | Bulk enable/disable by category | `document-store.ts`, IPC |
| 3.5 | Enable All / Disable All | `StatsBar.tsx` |

**Deliverable:** Full category-based management

### Phase 4: Polish & Integration

**Goal:** Production-ready with Claude integration

| Task | Description | Files |
|------|-------------|-------|
| 4.1 | File watcher for external changes | `file-watcher.ts` |
| 4.2 | Update CLAUDE.md instructions | `.claude/CLAUDE.md` |
| 4.3 | Update pageindex-context-manager | `.claude/agents/` |
| 4.4 | Error handling & recovery | Throughout |
| 4.5 | Loading states | UI components |
| 4.6 | App icon & packaging | `electron-builder` |

**Deliverable:** Installable app with full Claude Code integration

---

## 9. Future Phases (Post-MVP)

### Phase 5: Agent Management

Add agents tab with model selection (Haiku/Sonnet/Opus per agent).

### Phase 6: Cost Dashboard

Track token usage, display cost estimates, suggest optimizations.

### Phase 7: Profiles

Save named configurations ("thesis-writing", "code-review") for quick switching.

---

## 10. Development Commands

```bash
# Create project
mkdir -p apps/research-config-manager
cd apps/research-config-manager

# Initialize with electron-vite
npm create @electron-vite/create@latest . -- --template react-ts

# Install dependencies
npm install zustand zod chokidar @modelcontextprotocol/sdk
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node

# Setup Tailwind
npx tailwindcss init -p

# Install shadcn/ui
npx shadcn@latest init

# Development
npm run dev

# Build
npm run build

# Package for distribution
npm run package
```

---

## 11. Testing Strategy

### Unit Tests
- Schema validation (Zod)
- Catalog parser (markdown → categories)
- Config service (read/write/merge)

### Integration Tests
- IPC round-trips
- File watcher events
- PageIndex MCP client (mock server)

### E2E Tests
- Toggle document → verify file changed
- Refresh → verify new docs appear
- Category filter → verify list updates

---

## 12. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| PageIndex MCP unavailable | Graceful fallback to cached data in pageindex-state.json |
| Config file corruption | Atomic writes + automatic backups |
| Claude ignores scope config | Enforce via agent update + CLAUDE.md instructions |
| Large document count (>100) | Virtual list rendering, pagination |
| Electron security issues | Context isolation, no Node in renderer |

---

## 13. Success Criteria

### MVP (Phase 1-2)
- [ ] Can view all indexed documents with page counts
- [ ] Can toggle documents on/off
- [ ] Changes persist to `.claude/document-scope.json`
- [ ] Refresh button fetches new documents from PageIndex
- [ ] New documents appear with visual indicator

### Full Release (Phase 1-4)
- [ ] All MVP criteria
- [ ] Category filtering works
- [ ] Bulk operations work
- [ ] Claude Code respects scope configuration
- [ ] App is packaged for macOS installation
- [ ] File watcher updates UI on external changes

---

## 14. Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Config location | Project-level `.claude/` ✓ |
| Real-time sync | Immediate via file watcher + hooks ✓ |
| Document grouping | By category from document-catalog.md ✓ |
| MCP wrapper necessity | Prompt injection + agent enforcement (no custom MCP) ✓ |

---

## 15. Resources

### Documentation
- [electron-vite](https://electron-vite.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

### Existing Files to Integrate
- `.claude/pageindex-state.json` - Document inventory
- `.claude/document-catalog.md` - Categories and key pages
- `.claude/agents/pageindex-context-manager.md` - Agent to update

---

*Plan created 2026-01-26. Ready for implementation.*
