# CI/CD Strategy for Research Config Manager

This document outlines the CI/CD strategy for the Electron app, integrating with the existing bachelor thesis project infrastructure.

## Current CI/CD Landscape

| Component | Tests | CI Status | Workflow |
|-----------|-------|-----------|----------|
| **Webapp** | 7 Vitest files | Full CI/CD | `.github/workflows/ci.yml` |
| **LaTeX** | 5 Python suites | Full CI/CD | `.github/workflows/latex-build.yml` |
| **Electron** | None | Type-check only | Missing |

## Proposed Test Strategy

### Priority Levels

Given this is an internal tool for thesis workflow management, testing should focus on **critical paths** rather than full coverage.

#### P0 - Must Have (for CI)
1. **Config Service tests** - Core business logic for reading/writing `document-scope.json`
2. **Type checking** - Already exists via `npm run typecheck`
3. **Build verification** - Ensure the app compiles

#### P1 - Should Have
4. **IPC Handler tests** - Validate the main/renderer contract
5. **Schema validation tests** - Zod schemas behave correctly

#### P2 - Nice to Have
6. **Component tests** - Critical Svelte components (DocumentCard, FilterPanel)
7. **E2E tests** - Full integration with Playwright/Electron

### Recommended Test Framework

```
vitest                    # Unit tests (consistent with webapp)
@testing-library/svelte   # Component tests
playwright-electron       # E2E (optional, P2)
```

## Implementation Plan

### Step 1: Add Test Dependencies

```bash
cd apps/research-config-manager
npm install -D vitest @vitest/coverage-v8 @testing-library/svelte jsdom
```

### Step 2: Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'node', // Use 'jsdom' for component tests
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      $lib: '/src/renderer/src/lib',
    },
  },
});
```

### Step 3: Add Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 4: Write Priority Tests

#### P0: Config Service Tests

`src/main/services/config-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { ConfigService } from './config-service';

vi.mock('fs/promises');

describe('ConfigService', () => {
  const mockConfigPath = '/mock/.claude/document-scope.json';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should return default config when file does not exist', async () => {
      vi.mocked(fs.readFile).mockRejectedValue({ code: 'ENOENT' });

      const config = await ConfigService.loadConfig(mockConfigPath);

      expect(config.enabled).toEqual([]);
      expect(config.disabled).toEqual([]);
    });

    it('should parse valid config file', async () => {
      const mockConfig = {
        version: '1.0',
        enabled: ['doc1.pdf'],
        disabled: ['doc2.pdf'],
        metadata: { totalDocuments: 2, enabledCount: 1, disabledCount: 1 }
      };
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig));

      const config = await ConfigService.loadConfig(mockConfigPath);

      expect(config.enabled).toContain('doc1.pdf');
      expect(config.disabled).toContain('doc2.pdf');
    });

    it('should handle malformed JSON gracefully', async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{ invalid json }');

      const config = await ConfigService.loadConfig(mockConfigPath);

      // Should return default config on parse error
      expect(config.enabled).toEqual([]);
    });
  });

  describe('saveConfig', () => {
    it('should write config to file', async () => {
      vi.mocked(fs.writeFile).mockResolvedValue();
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const config = {
        version: '1.0',
        enabled: ['doc1.pdf'],
        disabled: [],
        metadata: { totalDocuments: 1, enabledCount: 1, disabledCount: 0 }
      };

      await ConfigService.saveConfig(mockConfigPath, config);

      expect(fs.writeFile).toHaveBeenCalledWith(
        mockConfigPath,
        expect.stringContaining('"version": "1.0"')
      );
    });
  });
});
```

#### P0: Schema Validation Tests

`src/main/schemas/document-scope.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { DocumentScopeSchema } from './document-scope';

describe('DocumentScopeSchema', () => {
  it('should validate a correct config', () => {
    const valid = {
      version: '1.0',
      lastModified: '2026-01-26T12:00:00.000Z',
      enabled: ['doc.pdf'],
      disabled: [],
      metadata: {
        totalDocuments: 1,
        enabledCount: 1,
        disabledCount: 0
      }
    };

    expect(() => DocumentScopeSchema.parse(valid)).not.toThrow();
  });

  it('should reject config without version', () => {
    const invalid = {
      enabled: [],
      disabled: []
    };

    expect(() => DocumentScopeSchema.parse(invalid)).toThrow();
  });
});
```

## GitHub Actions Workflow

Create `.github/workflows/electron-ci.yml`:

```yaml
name: Electron App CI

on:
  push:
    branches: [main]
    paths:
      - 'apps/research-config-manager/**'
      - '.github/workflows/electron-ci.yml'
  pull_request:
    branches: [main]
    paths:
      - 'apps/research-config-manager/**'
      - '.github/workflows/electron-ci.yml'

jobs:
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
          cache-dependency-path: './apps/research-config-manager/package-lock.json'

      - name: Install dependencies
        working-directory: ./apps/research-config-manager
        run: npm ci

      - name: Type check (Node)
        working-directory: ./apps/research-config-manager
        run: npm run typecheck:node

      - name: Type check (Web)
        working-directory: ./apps/research-config-manager
        run: npm run typecheck:web

  test:
    name: Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
          cache-dependency-path: './apps/research-config-manager/package-lock.json'

      - name: Install dependencies
        working-directory: ./apps/research-config-manager
        run: npm ci

      - name: Run tests
        working-directory: ./apps/research-config-manager
        run: npm test

      - name: Run tests with coverage
        working-directory: ./apps/research-config-manager
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: success()
        with:
          files: ./apps/research-config-manager/coverage/coverage-final.json
          flags: electron-config-manager
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ${{ matrix.os }}
    needs: [typecheck, test]

    strategy:
      matrix:
        os: [macos-latest] # Add ubuntu-latest, windows-latest if needed

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
          cache: 'npm'
          cache-dependency-path: './apps/research-config-manager/package-lock.json'

      - name: Install dependencies
        working-directory: ./apps/research-config-manager
        run: npm ci

      - name: Build Electron app
        working-directory: ./apps/research-config-manager
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: electron-build-${{ matrix.os }}
          path: ./apps/research-config-manager/out
          retention-days: 7
```

## Streamlined Project CI/CD Overview

### Unified Workflow Triggers

| Workflow | Trigger Paths | Jobs |
|----------|---------------|------|
| `ci.yml` | `webapp/**` | test → build, lint |
| `latex-build.yml` | `content/**`, `scripts/**`, `tests/**` | lint, test_*, build |
| `electron-ci.yml` | `apps/research-config-manager/**` | typecheck, test → build |

### Shared Patterns

All workflows follow consistent patterns:
- Node 20.x
- `npm ci` for reproducible installs
- Codecov integration for coverage
- Artifact upload (7-day retention)
- Path-based triggers (only run when relevant files change)

### Makefile Integration

Add to root `Makefile`:

```makefile
# Electron app targets
.PHONY: electron-test electron-build electron-dev

electron-test:
    cd apps/research-config-manager && npm test

electron-build:
    cd apps/research-config-manager && npm run build

electron-dev:
    cd apps/research-config-manager && npm run dev

# Updated ci target
ci: lint test electron-test
```

## Recommended Rollout

### Phase 1: Foundation (Immediate)
- [ ] Add Vitest to Electron app
- [ ] Write config-service tests (P0)
- [ ] Create `electron-ci.yml` with typecheck + build only

### Phase 2: Core Tests (Next Sprint)
- [ ] Add schema validation tests
- [ ] Add IPC handler tests
- [ ] Enable test job in CI

### Phase 3: Component Tests (Optional)
- [ ] Add `@testing-library/svelte`
- [ ] Test critical components (DocumentCard, FilterPanel)
- [ ] Consider E2E with Playwright

## Trade-offs

### Why Not Full E2E?

| Approach | Pros | Cons |
|----------|------|------|
| Unit tests only | Fast, simple, reliable | Doesn't catch integration issues |
| E2E with Playwright | Full confidence | Slow, flaky, complex setup |
| **Hybrid (recommended)** | Good coverage, reasonable effort | Some gaps possible |

For an internal tool, unit tests for business logic + type checking + build verification provides sufficient confidence without excessive maintenance burden.

## Files to Create

```
apps/research-config-manager/
├── vitest.config.ts                    # Test configuration
├── src/
│   ├── main/
│   │   ├── services/
│   │   │   └── config-service.test.ts  # P0
│   │   └── schemas/
│   │       └── document-scope.test.ts  # P1
│   └── renderer/
│       └── src/
│           └── tests/
│               └── setup.ts            # Test setup (if needed)
└── .github/workflows/
    └── electron-ci.yml                 # CI workflow
```
