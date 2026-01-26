# Implementation Plan: Research Config Manager - Phase 4

**Created**: 2026-01-26
**Depends on**: Phase 1-3 completion
**Status**: Ready for future implementation

---

## Prerequisites

Before starting Phase 4, Phases 1-3 must be complete:

- [ ] Phase 1: Document toggle with persistence
- [ ] Phase 2: PageIndex integration and refresh
- [ ] Phase 3: Category filtering and bulk operations

---

## Phase 4: Polish & Integration

**Goal**: Production-ready app with Claude Code integration, error handling, and packaging

### 4.1 Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phase 4 Components                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ File Watcher     │  │ Claude Code      │  │ Error Handling   │
│                  │  │ Integration      │  │                  │
│ • Watch configs  │  │ • CLAUDE.md      │  │ • Recovery       │
│ • Sync external  │  │ • Agent updates  │  │ • Fallbacks      │
│ • Debounce       │  │ • Hooks setup    │  │ • User feedback  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Loading States   │  │ App Packaging    │  │ Final Polish     │
│                  │  │                  │  │                  │
│ • Skeletons      │  │ • Icons          │  │ • Animations     │
│ • Progress       │  │ • DMG/installer  │  │ • Accessibility  │
│ • Transitions    │  │ • Auto-update    │  │ • Keyboard nav   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Tasks

### Task 4.1: File Watcher for External Changes

**Goal**: Sync UI when config files are edited outside the app (e.g., by another tool or manually)

**File**: `src/main/services/file-watcher.ts`

```typescript
import chokidar, { FSWatcher } from 'chokidar';
import { BrowserWindow } from 'electron';
import { debounce } from 'lodash-es';
import { join } from 'path';

export class FileWatcherService {
  private watcher: FSWatcher | null = null;
  private projectPath: string;
  private mainWindow: BrowserWindow | null = null;

  // Track our own writes to avoid echo
  private recentWrites = new Set<string>();
  private writeTimeout = 1000; // ms to ignore after our own write

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  start(): void {
    if (this.watcher) return;

    const watchPaths = [
      join(this.projectPath, '.claude', 'document-scope.json'),
      join(this.projectPath, '.claude', 'pageindex-state.json'),
      join(this.projectPath, '.claude', 'document-catalog.md'),
    ];

    this.watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      }
    });

    // Debounce to handle rapid changes
    const handleChange = debounce((path: string) => {
      this.onFileChanged(path);
    }, 500);

    this.watcher.on('change', handleChange);
    this.watcher.on('error', (error) => {
      console.error('File watcher error:', error);
    });
  }

  private onFileChanged(path: string): void {
    // Ignore our own writes
    if (this.recentWrites.has(path)) {
      return;
    }

    const filename = path.split('/').pop();

    // Notify renderer of external change
    this.mainWindow?.webContents.send('config:external-change', {
      file: filename,
      path,
      timestamp: Date.now()
    });
  }

  // Call this before writing to prevent echo
  markAsOurWrite(path: string): void {
    this.recentWrites.add(path);
    setTimeout(() => {
      this.recentWrites.delete(path);
    }, this.writeTimeout);
  }

  stop(): void {
    this.watcher?.close();
    this.watcher = null;
  }
}
```

**Preload addition** (`src/preload/index.ts`):

```typescript
// Add to existing API
config: {
  // ... existing methods ...

  onExternalChange: (callback: (event: ExternalChangeEvent) => void) => {
    ipcRenderer.on('config:external-change', (_, event) => callback(event));
  },

  removeExternalChangeListener: () => {
    ipcRenderer.removeAllListeners('config:external-change');
  }
}
```

**React hook** (`src/renderer/hooks/useExternalChanges.ts`):

```typescript
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useDocumentStore } from '@/stores/document-store';

export function useExternalChanges() {
  const { initialize } = useDocumentStore();

  useEffect(() => {
    const handleExternalChange = (event: ExternalChangeEvent) => {
      toast.info('Configuration changed externally', {
        description: `${event.file} was modified`,
        action: {
          label: 'Reload',
          onClick: () => initialize()
        },
        duration: 5000
      });

      // Auto-reload after brief delay
      setTimeout(() => initialize(), 1000);
    };

    window.api.config.onExternalChange(handleExternalChange);

    return () => {
      window.api.config.removeExternalChangeListener();
    };
  }, [initialize]);
}
```

**Acceptance Criteria**:
- Detects changes to document-scope.json, pageindex-state.json, document-catalog.md
- Ignores changes made by the app itself
- Shows toast notification for external changes
- Auto-reloads data after external change
- Debounces rapid changes

---

### Task 4.2: Update CLAUDE.md Instructions

**Goal**: Add document scope instructions so Claude Code respects the configuration

**File to update**: Project's `CLAUDE.md` (add new section)

```markdown
## Document Scope Configuration

The Research Config Manager app manages which PageIndex documents are available for querying.

### Configuration File

`.claude/document-scope.json` contains the active document scope:

```json
{
  "version": "1.0",
  "enabled": ["Doc1.pdf", "Doc2.pdf"],
  "disabled": ["Doc3.pdf"]
}
```

### Enforcement Rules

**Before any PageIndex query:**

1. Read `.claude/document-scope.json`
2. Only query documents listed in `enabled` array
3. If a document appears in search results but is in `disabled`, ignore it
4. If `enabled` is empty and `disabled` is empty, allow all documents (backwards compatible)

### Example Workflow

```
User: "What does Davis 1989 say about perceived usefulness?"

Claude (internal check):
1. Read document-scope.json
2. Check if "Davis - 1989 - Perceived Usefulness..." is in enabled
3. If yes: proceed with PageIndex query
4. If in disabled: respond "That document is currently disabled in your scope configuration"
```

### Scope Modes

| State | Behavior |
|-------|----------|
| Document in `enabled` | Always queryable |
| Document in `disabled` | Never queryable |
| Document in neither | Queryable (default allow) |
| Both arrays empty | All documents queryable |
```

**Implementation script** (`scripts/update-claude-md.ts`):

```typescript
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SCOPE_SECTION = `
## Document Scope Configuration

The Research Config Manager app manages which PageIndex documents are available for querying.

### Enforcement Rules

Before any PageIndex query:

1. Read \`.claude/document-scope.json\`
2. Only query documents listed in \`enabled\` array
3. If a document appears in search results but is in \`disabled\`, ignore it
4. If document-scope.json doesn't exist, allow all documents

### Usage

When a user asks about a specific paper:
1. Check if the paper is in the enabled scope
2. If disabled, inform user: "That document is currently disabled in your research scope"
3. If enabled or scope doesn't exist, proceed normally
`;

export async function updateClaudeMd(projectPath: string): Promise<void> {
  const claudeMdPath = join(projectPath, 'CLAUDE.md');

  try {
    let content = await readFile(claudeMdPath, 'utf-8');

    // Check if section already exists
    if (content.includes('## Document Scope Configuration')) {
      console.log('Document Scope section already exists in CLAUDE.md');
      return;
    }

    // Add section before any existing "## " heading or at end
    const insertPoint = content.lastIndexOf('\n## ');
    if (insertPoint > 0) {
      content = content.slice(0, insertPoint) + SCOPE_SECTION + content.slice(insertPoint);
    } else {
      content += '\n' + SCOPE_SECTION;
    }

    await writeFile(claudeMdPath, content, 'utf-8');
    console.log('Updated CLAUDE.md with Document Scope section');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Create new CLAUDE.md
      await writeFile(claudeMdPath, `# Project Instructions\n${SCOPE_SECTION}`, 'utf-8');
      console.log('Created CLAUDE.md with Document Scope section');
    } else {
      throw error;
    }
  }
}
```

**Acceptance Criteria**:
- CLAUDE.md contains Document Scope Configuration section
- Instructions are clear and actionable
- Backwards compatible (empty config = allow all)

---

### Task 4.3: Update pageindex-context-manager Agent

**Goal**: Modify the agent to enforce document scope

**File to update**: `.claude/agents/pageindex-context-manager.md`

**Addition to agent file**:

```markdown
## Document Scope Enforcement

Before executing any PageIndex query, you MUST check the document scope configuration.

### Pre-Query Protocol

1. **Read scope config**:
   ```
   Read .claude/document-scope.json
   ```

2. **Parse enabled/disabled lists**:
   - `enabled`: Documents explicitly allowed
   - `disabled`: Documents explicitly blocked

3. **Apply filtering**:
   - If querying specific document: verify it's not in `disabled`
   - If searching documents: filter results to exclude `disabled` items
   - If `enabled` is non-empty: only return documents in that list

### Scope Check Implementation

Before calling `find_relevant_documents()` or `get_page_content()`:

```
IF document-scope.json exists:
  IF target document is in disabled array:
    RETURN "Document [name] is disabled in current research scope"
  IF enabled array is non-empty AND target document NOT in enabled:
    RETURN "Document [name] is not in current research scope"
PROCEED with PageIndex query
```

### Example Scenarios

**Scenario 1: User queries disabled document**
```
User: "What does Bentler 1995 say about fit indices?"
Agent:
1. Read document-scope.json
2. Find "Bentler - 1995 - EQS 6..." in disabled array
3. Response: "The Bentler 1995 document is currently disabled in your research scope.
   Enable it in the Config Manager if you need to query it."
```

**Scenario 2: User queries enabled document**
```
User: "Summarize Davis 1989"
Agent:
1. Read document-scope.json
2. Find "Davis - 1989 - Perceived Usefulness..." in enabled array
3. Proceed with PageIndex query
```

**Scenario 3: No scope config exists**
```
Agent:
1. document-scope.json not found
2. Proceed with all documents (backwards compatible)
```

### Error Handling

- If document-scope.json is malformed: log warning, proceed with all docs
- If file read fails: log warning, proceed with all docs
- Never block user entirely due to scope config issues
```

**Acceptance Criteria**:
- Agent checks scope before every PageIndex operation
- Clear user feedback when document is disabled
- Graceful fallback if config is missing/invalid

---

### Task 4.4: Error Handling & Recovery

**Goal**: Comprehensive error handling with user-friendly feedback

**File**: `src/main/utils/error-handler.ts`

```typescript
import { dialog, BrowserWindow } from 'electron';
import { writeFile, readFile, copyFile } from 'fs/promises';
import { join } from 'path';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface AppError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  recoverable: boolean;
  details?: string;
  action?: RecoveryAction;
}

export interface RecoveryAction {
  label: string;
  handler: () => Promise<void>;
}

export const ERROR_CODES = {
  // Config errors
  CONFIG_READ_FAILED: 'CONFIG_READ_FAILED',
  CONFIG_WRITE_FAILED: 'CONFIG_WRITE_FAILED',
  CONFIG_INVALID_JSON: 'CONFIG_INVALID_JSON',
  CONFIG_SCHEMA_INVALID: 'CONFIG_SCHEMA_INVALID',

  // PageIndex errors
  PAGEINDEX_CONNECTION_FAILED: 'PAGEINDEX_CONNECTION_FAILED',
  PAGEINDEX_TIMEOUT: 'PAGEINDEX_TIMEOUT',
  PAGEINDEX_INVALID_RESPONSE: 'PAGEINDEX_INVALID_RESPONSE',

  // File system errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DISK_FULL: 'DISK_FULL',

  // IPC errors
  IPC_TIMEOUT: 'IPC_TIMEOUT',
  IPC_HANDLER_NOT_FOUND: 'IPC_HANDLER_NOT_FOUND'
} as const;

export class ErrorHandler {
  private projectPath: string;
  private mainWindow: BrowserWindow | null = null;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  async handleError(error: unknown, context: string): Promise<AppError> {
    const appError = this.normalizeError(error, context);

    // Log error
    console.error(`[${appError.code}] ${context}:`, appError.message, appError.details);

    // Send to renderer for UI feedback
    this.mainWindow?.webContents.send('app:error', appError);

    // Handle critical errors
    if (appError.severity === ErrorSeverity.CRITICAL) {
      await this.handleCriticalError(appError);
    }

    return appError;
  }

  private normalizeError(error: unknown, context: string): AppError {
    if (error instanceof Error) {
      // Node.js file system errors
      if ('code' in error) {
        const nodeError = error as NodeJS.ErrnoException;

        switch (nodeError.code) {
          case 'ENOENT':
            return {
              code: ERROR_CODES.FILE_NOT_FOUND,
              message: 'Configuration file not found',
              severity: ErrorSeverity.WARNING,
              recoverable: true,
              details: nodeError.path,
              action: {
                label: 'Create Default',
                handler: () => this.createDefaultConfig(nodeError.path!)
              }
            };

          case 'EACCES':
            return {
              code: ERROR_CODES.PERMISSION_DENIED,
              message: 'Permission denied',
              severity: ErrorSeverity.ERROR,
              recoverable: false,
              details: `Cannot access ${nodeError.path}`
            };

          case 'ENOSPC':
            return {
              code: ERROR_CODES.DISK_FULL,
              message: 'Disk is full',
              severity: ErrorSeverity.CRITICAL,
              recoverable: false,
              details: 'Free up disk space and try again'
            };
        }
      }

      // JSON parse errors
      if (error instanceof SyntaxError && context.includes('JSON')) {
        return {
          code: ERROR_CODES.CONFIG_INVALID_JSON,
          message: 'Invalid JSON in configuration file',
          severity: ErrorSeverity.ERROR,
          recoverable: true,
          details: error.message,
          action: {
            label: 'Reset to Default',
            handler: () => this.resetConfig()
          }
        };
      }

      // Zod validation errors
      if (error.name === 'ZodError') {
        return {
          code: ERROR_CODES.CONFIG_SCHEMA_INVALID,
          message: 'Configuration file has invalid structure',
          severity: ErrorSeverity.ERROR,
          recoverable: true,
          details: error.message,
          action: {
            label: 'Reset to Default',
            handler: () => this.resetConfig()
          }
        };
      }

      // Generic error
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
        severity: ErrorSeverity.ERROR,
        recoverable: false,
        details: error.stack
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      severity: ErrorSeverity.ERROR,
      recoverable: false
    };
  }

  private async handleCriticalError(error: AppError): Promise<void> {
    const response = await dialog.showMessageBox({
      type: 'error',
      title: 'Critical Error',
      message: error.message,
      detail: error.details,
      buttons: ['Quit', 'Try to Continue'],
      defaultId: 0
    });

    if (response.response === 0) {
      process.exit(1);
    }
  }

  private async createDefaultConfig(path: string): Promise<void> {
    const defaultScope = {
      version: '1.0',
      lastModified: new Date().toISOString(),
      enabled: [],
      disabled: []
    };

    await writeFile(path, JSON.stringify(defaultScope, null, 2), 'utf-8');
  }

  private async resetConfig(): Promise<void> {
    const scopePath = join(this.projectPath, '.claude', 'document-scope.json');

    // Backup existing
    try {
      const existing = await readFile(scopePath, 'utf-8');
      const backupPath = scopePath.replace('.json', `.backup-${Date.now()}.json`);
      await copyFile(scopePath, backupPath);
    } catch {
      // No existing file to backup
    }

    await this.createDefaultConfig(scopePath);
  }
}
```

**React error boundary** (`src/renderer/components/ErrorBoundary.tsx`):

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={this.handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Acceptance Criteria**:
- All error types have user-friendly messages
- Recovery actions available where possible
- Critical errors show dialog
- Errors logged for debugging
- React errors caught by boundary

---

### Task 4.5: Loading States

**Goal**: Smooth loading experience with skeletons and progress indicators

**File**: `src/renderer/components/ui/skeleton.tsx` (shadcn)

```bash
npx shadcn@latest add skeleton
```

**Document list skeleton** (`src/renderer/components/documents/DocumentListSkeleton.tsx`):

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function DocumentListSkeleton() {
  return (
    <div className="space-y-0">
      {/* Stats bar skeleton */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-40" />
      </div>

      {/* Document items skeleton */}
      {Array.from({ length: 8 }).map((_, i) => (
        <DocumentItemSkeleton key={i} />
      ))}
    </div>
  );
}

function DocumentItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 border-b">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-9 rounded-full" />
    </div>
  );
}
```

**Loading overlay** (`src/renderer/components/ui/LoadingOverlay.tsx`):

```typescript
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  className
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className={cn(
      "absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
      className
    )}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}
```

**Progress indicator for refresh** (`src/renderer/components/documents/RefreshProgress.tsx`):

```typescript
import { Progress } from '@/components/ui/progress';

interface RefreshProgressProps {
  isRefreshing: boolean;
  progress: number; // 0-100
  stage: 'connecting' | 'fetching' | 'comparing' | 'saving';
}

const STAGE_LABELS = {
  connecting: 'Connecting to PageIndex...',
  fetching: 'Fetching documents...',
  comparing: 'Checking for changes...',
  saving: 'Saving configuration...'
};

export function RefreshProgress({ isRefreshing, progress, stage }: RefreshProgressProps) {
  if (!isRefreshing) return null;

  return (
    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950 border-b">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-blue-700 dark:text-blue-300">
          {STAGE_LABELS[stage]}
        </span>
        <span className="text-xs text-blue-600 dark:text-blue-400">
          {progress}%
        </span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
}
```

**App loading screen** (`src/renderer/components/AppLoading.tsx`):

```typescript
import { Loader2 } from 'lucide-react';

export function AppLoading() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold">Research Config Manager</h1>
          <p className="text-sm text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- Skeleton shown while loading document list
- Progress indicator during refresh
- Loading overlay for blocking operations
- App loading screen on startup
- Smooth transitions between states

---

### Task 4.6: App Icon & Packaging

**Goal**: Create distributable macOS application

**App icon creation** (`resources/`):

```
resources/
├── icon.icns          # macOS app icon (multiple sizes)
├── icon.png           # 512x512 source PNG
├── icon@2x.png        # 1024x1024 retina
└── entitlements.mac.plist
```

**Icon specification**:
- Base design: Document stack with toggle switch overlay
- Colors: Blue primary (#2563eb), white background
- Sizes needed: 16, 32, 64, 128, 256, 512, 1024 pixels

**electron-builder configuration** (`electron-builder.json5`):

```json5
{
  "$schema": "https://raw.githubusercontent.com/electron-userland/electron-builder/master/packages/app-builder-lib/scheme.json",
  "appId": "com.research.config-manager",
  "productName": "Research Config Manager",
  "directories": {
    "output": "release",
    "buildResources": "resources"
  },
  "files": [
    "out/**/*"
  ],
  "mac": {
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      },
      {
        "target": "zip",
        "arch": ["x64", "arm64"]
      }
    ],
    "icon": "resources/icon.icns",
    "category": "public.app-category.developer-tools",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "resources/entitlements.mac.plist",
    "entitlementsInherit": "resources/entitlements.mac.plist"
  },
  "dmg": {
    "contents": [
      {
        "x": 130,
        "y": 220
      },
      {
        "x": 410,
        "y": 220,
        "type": "link",
        "path": "/Applications"
      }
    ],
    "window": {
      "width": 540,
      "height": 380
    }
  }
}
```

**Entitlements** (`resources/entitlements.mac.plist`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

**Package scripts** (`package.json`):

```json
{
  "scripts": {
    "build": "electron-vite build",
    "package": "npm run build && electron-builder --mac",
    "package:universal": "npm run build && electron-builder --mac --universal",
    "release": "npm run build && electron-builder --mac --publish always"
  }
}
```

**Build command**:

```bash
# Development
npm run dev

# Build for current architecture
npm run package

# Build universal binary (Intel + Apple Silicon)
npm run package:universal
```

**Output**:
```
release/
├── Research Config Manager-1.0.0-arm64.dmg
├── Research Config Manager-1.0.0-x64.dmg
├── Research Config Manager-1.0.0-arm64-mac.zip
└── Research Config Manager-1.0.0-x64-mac.zip
```

**Acceptance Criteria**:
- App has custom icon in Dock and Finder
- DMG installer with drag-to-Applications
- Universal binary for Intel + Apple Silicon
- App is code signed (if certificate available)
- Passes Gatekeeper on first launch

---

## Additional Polish

### Keyboard Navigation

```typescript
// src/renderer/hooks/useKeyboardNav.ts
import { useEffect } from 'react';
import { useDocumentStore } from '@/stores/document-store';

export function useKeyboardNav() {
  const { documents, toggleDocument } = useDocumentStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + F: Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }

      // Cmd/Ctrl + R: Refresh
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault();
        document.getElementById('refresh-button')?.click();
      }

      // Escape: Clear search
      if (e.key === 'Escape') {
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        if (searchInput && searchInput.value) {
          searchInput.value = '';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### Animations

```css
/* src/renderer/styles/globals.css */

/* Smooth toggle animation */
.toggle-transition {
  transition: background-color 150ms ease-in-out;
}

/* New document highlight pulse */
@keyframes highlight-pulse {
  0%, 100% { background-color: rgb(254 243 199 / 0.5); }
  50% { background-color: rgb(254 243 199 / 1); }
}

.new-document-highlight {
  animation: highlight-pulse 2s ease-in-out 3;
}

/* List item enter animation */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.document-item-enter {
  animation: slide-in 200ms ease-out;
}
```

### Accessibility

```typescript
// Ensure all interactive elements have proper ARIA labels
<Button
  aria-label="Refresh document list from PageIndex"
  title="Refresh (Cmd+R)"
>
  <RefreshCw />
</Button>

<Switch
  aria-label={`${enabled ? 'Disable' : 'Enable'} ${shortCitation}`}
  aria-checked={enabled}
/>

// Screen reader announcements for state changes
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
};
```

---

## Phase 4 Deliverables

- [ ] File watcher syncs external config changes
- [ ] CLAUDE.md updated with scope instructions
- [ ] pageindex-context-manager enforces scope
- [ ] Comprehensive error handling with recovery
- [ ] Loading skeletons and progress indicators
- [ ] macOS app packaged as DMG
- [ ] Keyboard shortcuts work (Cmd+F, Cmd+R, Escape)
- [ ] Smooth animations for state changes
- [ ] Accessible to screen readers

---

## Testing Checklist

### File Watcher Tests

```typescript
describe('FileWatcherService', () => {
  it('detects external changes to document-scope.json');
  it('ignores changes made by the app itself');
  it('debounces rapid file changes');
  it('notifies renderer of external changes');
});
```

### Error Handling Tests

```typescript
describe('ErrorHandler', () => {
  it('handles missing config file with recovery action');
  it('handles invalid JSON with reset option');
  it('handles permission denied errors');
  it('shows critical error dialog');
});
```

### Packaging Tests

```bash
# Verify DMG mounts correctly
hdiutil attach "release/Research Config Manager-1.0.0-arm64.dmg"

# Verify app launches
open "/Volumes/Research Config Manager/Research Config Manager.app"

# Verify code signature (if signed)
codesign -v "release/Research Config Manager.app"
```

---

## Success Criteria

- [ ] External edits to configs sync within 1 second
- [ ] Claude Code respects document scope
- [ ] All errors have user-friendly messages
- [ ] Loading states provide visual feedback
- [ ] App installs via drag-to-Applications
- [ ] App launches without Gatekeeper warnings
- [ ] Keyboard navigation fully functional

---

## File Paths Summary

| File | Purpose |
|------|---------|
| `src/main/services/file-watcher.ts` | Watch config file changes |
| `src/main/utils/error-handler.ts` | Centralized error handling |
| `src/renderer/components/ErrorBoundary.tsx` | React error boundary |
| `src/renderer/components/documents/DocumentListSkeleton.tsx` | Loading skeleton |
| `src/renderer/components/ui/LoadingOverlay.tsx` | Blocking load indicator |
| `src/renderer/components/documents/RefreshProgress.tsx` | Refresh progress bar |
| `src/renderer/hooks/useExternalChanges.ts` | External change hook |
| `src/renderer/hooks/useKeyboardNav.ts` | Keyboard shortcuts |
| `electron-builder.json5` | Packaging configuration |
| `resources/icon.icns` | macOS app icon |
| `resources/entitlements.mac.plist` | macOS entitlements |

---

*Plan created 2026-01-26. Execute after Phase 1-3 completion.*
