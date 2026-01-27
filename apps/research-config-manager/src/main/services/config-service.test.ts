import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { ConfigService } from './config-service';
import type { DocumentScope, PageIndexState } from '../schemas/document-scope';

// Mock all external dependencies
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  access: vi.fn()
}));

vi.mock('../utils/atomic-write', () => ({
  atomicWriteJson: vi.fn()
}));

vi.mock('./file-watcher', () => ({
  getFileWatcher: vi.fn(() => ({
    markAsOurWrite: vi.fn()
  }))
}));

vi.mock('./catalog-parser', () => ({
  parseCatalog: vi.fn(() => Promise.resolve(null)),
  createCatalogLookup: vi.fn(() => new Map())
}));

vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

import { readFile, access } from 'fs/promises';
import { atomicWriteJson } from '../utils/atomic-write';

const mockReadFile = readFile as Mock;
const mockAccess = access as Mock;
const mockAtomicWriteJson = atomicWriteJson as Mock;

describe('ConfigService', () => {
  const projectPath = '/test/project';
  let service: ConfigService;

  const validScope: DocumentScope = {
    version: '1.0',
    lastModified: '2026-01-26T12:00:00.000Z',
    enabled: ['enabled-doc.pdf'],
    disabled: ['disabled-doc.pdf'],
    metadata: {
      totalDocuments: 2,
      totalPages: 50,
      estimatedTokens: 25000,
      enabledCount: 1,
      disabledCount: 1
    }
  };

  const validPageIndexState: PageIndexState = {
    version: '1.0',
    last_sync: '2026-01-26T12:00:00.000Z',
    indexed_papers: {
      davis1989: {
        pageindex_name: 'Davis - 1989 - Perceived Usefulness.pdf',
        indexed_at: '2026-01-20T10:00:00.000Z',
        pages: 15
      },
      venkatesh2003: {
        pageindex_name: 'Venkatesh - 2003 - UTAUT.pdf',
        indexed_at: '2026-01-21T10:00:00.000Z',
        pages: 25
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ConfigService(projectPath);
  });

  describe('readScope', () => {
    it('should return null when file does not exist', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockAccess.mockRejectedValue(error);

      const result = await service.readScope();

      expect(result).toBeNull();
    });

    it('should parse valid scope file', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validScope));

      const result = await service.readScope();

      expect(result).toEqual(validScope);
      expect(result?.enabled).toContain('enabled-doc.pdf');
      expect(result?.disabled).toContain('disabled-doc.pdf');
    });

    it('should throw ConfigParseError for malformed JSON', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('{ invalid json }');

      await expect(service.readScope()).rejects.toThrow('Failed to parse config');
    });

    it('should throw ConfigValidationError for invalid schema', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(
        JSON.stringify({
          version: 'invalid',
          enabled: [],
          disabled: []
        })
      );

      await expect(service.readScope()).rejects.toThrow('Config validation failed');
    });

    it('should rethrow non-ENOENT access errors', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;
      error.code = 'EACCES';
      mockAccess.mockRejectedValue(error);

      await expect(service.readScope()).rejects.toThrow('Permission denied');
    });
  });

  describe('writeScope', () => {
    it('should write validated scope to file', async () => {
      mockAtomicWriteJson.mockResolvedValue(undefined);

      await service.writeScope(validScope);

      expect(mockAtomicWriteJson).toHaveBeenCalledWith(
        expect.stringContaining('document-scope.json'),
        validScope
      );
    });

    it('should reject invalid scope before writing', async () => {
      const invalidScope = {
        version: 'invalid',
        lastModified: '2026-01-26T12:00:00.000Z',
        enabled: [],
        disabled: []
      } as unknown as DocumentScope;

      await expect(service.writeScope(invalidScope)).rejects.toThrow();
      expect(mockAtomicWriteJson).not.toHaveBeenCalled();
    });
  });

  describe('readPageIndexState', () => {
    it('should return null when file does not exist', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockAccess.mockRejectedValue(error);

      const result = await service.readPageIndexState();

      expect(result).toBeNull();
    });

    it('should parse valid pageindex state', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validPageIndexState));

      const result = await service.readPageIndexState();

      expect(result).toEqual(validPageIndexState);
      expect(Object.keys(result?.indexed_papers ?? {})).toHaveLength(2);
    });

    it('should return null for invalid JSON (graceful handling)', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue('not json');

      const result = await service.readPageIndexState();

      expect(result).toBeNull();
    });
  });

  describe('listDocuments', () => {
    it('should return empty array when no pageindex state', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockAccess.mockRejectedValue(error);

      const result = await service.listDocuments();

      expect(result).toEqual([]);
    });

    it('should merge pageindex state with scope', async () => {
      // Use path-aware mocks since Promise.all runs in parallel
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation((path: string) => {
        if (path.includes('document-scope.json')) {
          return Promise.resolve(JSON.stringify(validScope));
        }
        if (path.includes('pageindex-state.json')) {
          return Promise.resolve(JSON.stringify(validPageIndexState));
        }
        return Promise.reject(new Error('Unknown file'));
      });

      const result = await service.listDocuments();

      expect(result).toHaveLength(2);
      expect(result.find((d) => d.name.includes('Davis'))).toBeDefined();
      expect(result.find((d) => d.name.includes('Venkatesh'))).toBeDefined();
    });

    it('should mark disabled documents correctly', async () => {
      const scopeWithDisabled: DocumentScope = {
        ...validScope,
        disabled: ['Davis - 1989 - Perceived Usefulness.pdf']
      };

      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation((path: string) => {
        if (path.includes('document-scope.json')) {
          return Promise.resolve(JSON.stringify(scopeWithDisabled));
        }
        if (path.includes('pageindex-state.json')) {
          return Promise.resolve(JSON.stringify(validPageIndexState));
        }
        return Promise.reject(new Error('Unknown file'));
      });

      const result = await service.listDocuments();

      const davisDoc = result.find((d) => d.name.includes('Davis'));
      expect(davisDoc?.enabled).toBe(false);
    });

    it('should calculate token estimates correctly', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation((path: string) => {
        if (path.includes('document-scope.json')) {
          return Promise.resolve(JSON.stringify(validScope));
        }
        if (path.includes('pageindex-state.json')) {
          return Promise.resolve(JSON.stringify(validPageIndexState));
        }
        return Promise.reject(new Error('Unknown file'));
      });

      const result = await service.listDocuments();

      const davisDoc = result.find((d) => d.name.includes('Davis'));
      // 15 pages * 500 tokens per page
      expect(davisDoc?.tokenEstimate).toBe(7500);
    });

    it('should extract short citation from document name', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation((path: string) => {
        if (path.includes('document-scope.json')) {
          return Promise.resolve(JSON.stringify(validScope));
        }
        if (path.includes('pageindex-state.json')) {
          return Promise.resolve(JSON.stringify(validPageIndexState));
        }
        return Promise.reject(new Error('Unknown file'));
      });

      const result = await service.listDocuments();

      const davisDoc = result.find((d) => d.name.includes('Davis'));
      expect(davisDoc?.shortCitation).toBe('Davis 1989');
    });
  });

  describe('toggleDocument', () => {
    it('should enable a disabled document', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(
        JSON.stringify({
          ...validScope,
          enabled: [],
          disabled: ['test-doc.pdf']
        })
      );
      mockAtomicWriteJson.mockResolvedValue(undefined);

      await service.toggleDocument('test-doc.pdf', true);

      expect(mockAtomicWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          enabled: expect.arrayContaining(['test-doc.pdf']),
          disabled: expect.not.arrayContaining(['test-doc.pdf'])
        })
      );
    });

    it('should disable an enabled document', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(
        JSON.stringify({
          ...validScope,
          enabled: ['test-doc.pdf'],
          disabled: []
        })
      );
      mockAtomicWriteJson.mockResolvedValue(undefined);

      await service.toggleDocument('test-doc.pdf', false);

      expect(mockAtomicWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          enabled: expect.not.arrayContaining(['test-doc.pdf']),
          disabled: expect.arrayContaining(['test-doc.pdf'])
        })
      );
    });

    it('should create default scope if none exists', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockAccess.mockRejectedValue(error);
      mockAtomicWriteJson.mockResolvedValue(undefined);

      await service.toggleDocument('new-doc.pdf', true);

      expect(mockAtomicWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          version: '1.0',
          enabled: expect.arrayContaining(['new-doc.pdf'])
        })
      );
    });
  });

  describe('enableAll / disableAll', () => {
    beforeEach(() => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation((path: string) => {
        if (path.includes('document-scope.json')) {
          return Promise.resolve(JSON.stringify(validScope));
        }
        if (path.includes('pageindex-state.json')) {
          return Promise.resolve(JSON.stringify(validPageIndexState));
        }
        return Promise.reject(new Error('Unknown file'));
      });
      mockAtomicWriteJson.mockResolvedValue(undefined);
    });

    it('should enable all documents', async () => {
      await service.enableAll();

      expect(mockAtomicWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          disabled: []
        })
      );
    });

    it('should disable all documents', async () => {
      await service.disableAll();

      expect(mockAtomicWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          enabled: []
        })
      );
    });
  });

  describe('preferences', () => {
    it('should return default preferences when scope is null', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      mockAccess.mockRejectedValue(error);

      const prefs = await service.getPreferences();

      expect(prefs.defaultModel).toBe('sonnet');
      expect(prefs.showModelIndicator).toBe(true);
    });

    it('should return stored preferences', async () => {
      const scopeWithPrefs: DocumentScope = {
        ...validScope,
        preferences: {
          defaultModel: 'opus',
          showModelIndicator: false
        }
      };

      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(scopeWithPrefs));

      const prefs = await service.getPreferences();

      expect(prefs.defaultModel).toBe('opus');
      expect(prefs.showModelIndicator).toBe(false);
    });

    it('should update preferences', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify(validScope));
      mockAtomicWriteJson.mockResolvedValue(undefined);

      const result = await service.updatePreferences({ defaultModel: 'haiku' });

      expect(result.defaultModel).toBe('haiku');
      expect(mockAtomicWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          preferences: expect.objectContaining({
            defaultModel: 'haiku'
          })
        })
      );
    });
  });

  describe('batchToggle', () => {
    it('should toggle all documents when category is __all__', async () => {
      mockAccess.mockResolvedValue(undefined);
      mockReadFile.mockImplementation((path: string) => {
        if (path.includes('document-scope.json')) {
          return Promise.resolve(JSON.stringify(validScope));
        }
        if (path.includes('pageindex-state.json')) {
          return Promise.resolve(JSON.stringify(validPageIndexState));
        }
        return Promise.reject(new Error('Unknown file'));
      });
      mockAtomicWriteJson.mockResolvedValue(undefined);

      await service.batchToggle('__all__', false);

      expect(mockAtomicWriteJson).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          disabled: expect.arrayContaining([
            'Davis - 1989 - Perceived Usefulness.pdf',
            'Venkatesh - 2003 - UTAUT.pdf'
          ])
        })
      );
    });
  });
});
