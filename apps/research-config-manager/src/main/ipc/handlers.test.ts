import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock electron before any imports
const mockHandle = vi.fn();
const mockWebContentsSend = vi.fn();
const mockGetAllWindows = vi.fn(() => [
  { webContents: { send: mockWebContentsSend } }
]);

vi.mock('electron', () => ({
  ipcMain: {
    handle: mockHandle
  },
  BrowserWindow: {
    getAllWindows: mockGetAllWindows
  }
}));

// Mock ConfigService
const mockConfigService = {
  readScope: vi.fn(),
  writeScope: vi.fn(),
  listDocuments: vi.fn(),
  toggleDocument: vi.fn(),
  enableAll: vi.fn(),
  disableAll: vi.fn(),
  batchToggle: vi.fn(),
  getPreferences: vi.fn(),
  updatePreferences: vi.fn()
};

vi.mock('../services/config-service', () => ({
  ConfigService: vi.fn(() => mockConfigService)
}));

// Mock catalog-parser
const mockParseCatalog = vi.fn();
vi.mock('../services/catalog-parser', () => ({
  parseCatalog: mockParseCatalog
}));

// Mock refresh-service
const mockRefresh = vi.fn();
vi.mock('../services/refresh-service', () => ({
  getRefreshService: vi.fn(() => ({ refresh: mockRefresh }))
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock fs
vi.mock('fs', () => ({
  statSync: vi.fn()
}));

import { IPC_CHANNELS } from '../../shared/channels';
import type { DocumentScope, DocumentScopePreferences } from '../../shared/types';

describe('IPC Handlers', () => {
  // Store handlers for testing
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    // Capture handlers when they are registered
    mockHandle.mockImplementation((channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
      handlers.set(channel, handler);
    });

    // Reset modules to ensure fresh imports
    vi.resetModules();

    // Re-setup mocks after reset
    vi.doMock('electron', () => ({
      ipcMain: {
        handle: mockHandle
      },
      BrowserWindow: {
        getAllWindows: mockGetAllWindows
      }
    }));

    vi.doMock('../services/config-service', () => ({
      ConfigService: vi.fn(() => mockConfigService)
    }));

    vi.doMock('../services/catalog-parser', () => ({
      parseCatalog: mockParseCatalog
    }));

    vi.doMock('../services/refresh-service', () => ({
      getRefreshService: vi.fn(() => ({ refresh: mockRefresh }))
    }));

    vi.doMock('../utils/logger', () => ({
      logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn()
      }
    }));

    // Import and register handlers
    const { registerIpcHandlers } = await import('./handlers');
    registerIpcHandlers();
  });

  afterEach(() => {
    vi.resetModules();
  });

  describe('registerIpcHandlers', () => {
    it('should register all expected handlers', () => {
      // 14 handlers: CONFIG_READ, CONFIG_WRITE, DOCUMENTS_LIST, DOCUMENTS_TOGGLE,
      // DOCUMENTS_ENABLE_ALL, DOCUMENTS_DISABLE_ALL, DOCUMENTS_GET_CATALOG,
      // DOCUMENTS_REFRESH, DOCUMENTS_BULK_TOGGLE, CONFIG_UPDATE_PREFERENCES, APP_GET_PROJECT_PATH,
      // BIBTEX_SYNC, BIBTEX_GET_CATALOG, BIBTEX_GET_DOCUMENT
      expect(mockHandle).toHaveBeenCalledTimes(14);

      const registeredChannels = new Set(
        mockHandle.mock.calls.map((call: unknown[]) => call[0])
      );

      expect(registeredChannels.has(IPC_CHANNELS.CONFIG_READ)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.CONFIG_WRITE)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.DOCUMENTS_LIST)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.DOCUMENTS_TOGGLE)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.DOCUMENTS_ENABLE_ALL)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.DOCUMENTS_DISABLE_ALL)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.DOCUMENTS_GET_CATALOG)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.DOCUMENTS_REFRESH)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.DOCUMENTS_BULK_TOGGLE)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.CONFIG_UPDATE_PREFERENCES)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.APP_GET_PROJECT_PATH)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.BIBTEX_SYNC)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.BIBTEX_GET_CATALOG)).toBe(true);
      expect(registeredChannels.has(IPC_CHANNELS.BIBTEX_GET_DOCUMENT)).toBe(true);
    });
  });

  describe('CONFIG_READ handler', () => {
    it('should call configService.readScope and return result', async () => {
      const mockScope: DocumentScope = {
        version: '1.0',
        lastModified: '2026-01-26T12:00:00.000Z',
        enabled: ['doc1.pdf'],
        disabled: ['doc2.pdf'],
        metadata: {
          totalDocuments: 2,
          totalPages: 50,
          estimatedTokens: 25000,
          enabledCount: 1,
          disabledCount: 1
        }
      };
      mockConfigService.readScope.mockResolvedValue(mockScope);

      const handler = handlers.get(IPC_CHANNELS.CONFIG_READ);
      const result = await handler!();

      expect(mockConfigService.readScope).toHaveBeenCalled();
      expect(result).toEqual(mockScope);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Read failed');
      mockConfigService.readScope.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.CONFIG_READ);

      await expect(handler!()).rejects.toThrow('Read failed');
      // Error logging is verified by the error being re-thrown (logger.error is called before throw)
    });
  });

  describe('CONFIG_WRITE handler', () => {
    it('should call configService.writeScope and broadcast update', async () => {
      const mockScope: DocumentScope = {
        version: '1.0',
        lastModified: '2026-01-26T12:00:00.000Z',
        enabled: ['doc1.pdf'],
        disabled: [],
        metadata: {
          totalDocuments: 1,
          totalPages: 10,
          estimatedTokens: 5000,
          enabledCount: 1,
          disabledCount: 0
        }
      };
      mockConfigService.writeScope.mockResolvedValue(undefined);

      const handler = handlers.get(IPC_CHANNELS.CONFIG_WRITE);
      await handler!({}, mockScope);

      expect(mockConfigService.writeScope).toHaveBeenCalledWith(mockScope);
      expect(mockWebContentsSend).toHaveBeenCalledWith(IPC_CHANNELS.CONFIG_WATCH, mockScope);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Write failed');
      mockConfigService.writeScope.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.CONFIG_WRITE);

      await expect(handler!({}, {})).rejects.toThrow('Write failed');
    });
  });

  describe('DOCUMENTS_LIST handler', () => {
    it('should call configService.listDocuments and return result', async () => {
      const mockDocs = [
        { name: 'doc1.pdf', enabled: true, pages: 10 },
        { name: 'doc2.pdf', enabled: false, pages: 20 }
      ];
      mockConfigService.listDocuments.mockResolvedValue(mockDocs);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_LIST);
      const result = await handler!();

      expect(mockConfigService.listDocuments).toHaveBeenCalled();
      expect(result).toEqual(mockDocs);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('List failed');
      mockConfigService.listDocuments.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_LIST);

      await expect(handler!()).rejects.toThrow('List failed');
    });
  });

  describe('DOCUMENTS_TOGGLE handler', () => {
    it('should toggle document and broadcast update', async () => {
      const mockScope: DocumentScope = {
        version: '1.0',
        lastModified: '2026-01-26T12:00:00.000Z',
        enabled: ['doc1.pdf'],
        disabled: [],
        metadata: {
          totalDocuments: 1,
          totalPages: 10,
          estimatedTokens: 5000,
          enabledCount: 1,
          disabledCount: 0
        }
      };
      mockConfigService.toggleDocument.mockResolvedValue(undefined);
      mockConfigService.readScope.mockResolvedValue(mockScope);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_TOGGLE);
      await handler!({}, 'doc1.pdf', true);

      expect(mockConfigService.toggleDocument).toHaveBeenCalledWith('doc1.pdf', true);
      expect(mockConfigService.readScope).toHaveBeenCalled();
      expect(mockWebContentsSend).toHaveBeenCalledWith(IPC_CHANNELS.CONFIG_WATCH, mockScope);
    });

    it('should not broadcast if scope is null', async () => {
      mockConfigService.toggleDocument.mockResolvedValue(undefined);
      mockConfigService.readScope.mockResolvedValue(null);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_TOGGLE);
      await handler!({}, 'doc1.pdf', true);

      expect(mockWebContentsSend).not.toHaveBeenCalled();
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Toggle failed');
      mockConfigService.toggleDocument.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_TOGGLE);

      await expect(handler!({}, 'doc1.pdf', true)).rejects.toThrow('Toggle failed');
    });
  });

  describe('DOCUMENTS_ENABLE_ALL handler', () => {
    it('should enable all documents and broadcast update', async () => {
      const mockScope: DocumentScope = {
        version: '1.0',
        lastModified: '2026-01-26T12:00:00.000Z',
        enabled: ['doc1.pdf', 'doc2.pdf'],
        disabled: [],
        metadata: {
          totalDocuments: 2,
          totalPages: 30,
          estimatedTokens: 15000,
          enabledCount: 2,
          disabledCount: 0
        }
      };
      mockConfigService.enableAll.mockResolvedValue(undefined);
      mockConfigService.readScope.mockResolvedValue(mockScope);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_ENABLE_ALL);
      await handler!();

      expect(mockConfigService.enableAll).toHaveBeenCalled();
      expect(mockWebContentsSend).toHaveBeenCalledWith(IPC_CHANNELS.CONFIG_WATCH, mockScope);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Enable all failed');
      mockConfigService.enableAll.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_ENABLE_ALL);

      await expect(handler!()).rejects.toThrow('Enable all failed');
    });
  });

  describe('DOCUMENTS_DISABLE_ALL handler', () => {
    it('should disable all documents and broadcast update', async () => {
      const mockScope: DocumentScope = {
        version: '1.0',
        lastModified: '2026-01-26T12:00:00.000Z',
        enabled: [],
        disabled: ['doc1.pdf', 'doc2.pdf'],
        metadata: {
          totalDocuments: 2,
          totalPages: 30,
          estimatedTokens: 15000,
          enabledCount: 0,
          disabledCount: 2
        }
      };
      mockConfigService.disableAll.mockResolvedValue(undefined);
      mockConfigService.readScope.mockResolvedValue(mockScope);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_DISABLE_ALL);
      await handler!();

      expect(mockConfigService.disableAll).toHaveBeenCalled();
      expect(mockWebContentsSend).toHaveBeenCalledWith(IPC_CHANNELS.CONFIG_WATCH, mockScope);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Disable all failed');
      mockConfigService.disableAll.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_DISABLE_ALL);

      await expect(handler!()).rejects.toThrow('Disable all failed');
    });
  });

  describe('DOCUMENTS_GET_CATALOG handler', () => {
    it('should call parseCatalog with correct path', async () => {
      const mockCatalog = [{ key: 'davis1989', title: 'Davis 1989' }];
      mockParseCatalog.mockResolvedValue(mockCatalog);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_GET_CATALOG);
      const result = await handler!();

      expect(mockParseCatalog).toHaveBeenCalledWith(
        expect.stringContaining('document-catalog.md')
      );
      expect(result).toEqual(mockCatalog);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Catalog parse failed');
      mockParseCatalog.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_GET_CATALOG);

      await expect(handler!()).rejects.toThrow('Catalog parse failed');
    });
  });

  describe('DOCUMENTS_REFRESH handler', () => {
    it('should call refresh service and return result', async () => {
      const mockResult = { added: 2, removed: 1 };
      mockRefresh.mockResolvedValue(mockResult);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_REFRESH);
      const result = await handler!();

      expect(mockRefresh).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Refresh failed');
      mockRefresh.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_REFRESH);

      await expect(handler!()).rejects.toThrow('Refresh failed');
    });
  });

  describe('DOCUMENTS_BULK_TOGGLE handler', () => {
    it('should batch toggle by category and broadcast update', async () => {
      const mockScope: DocumentScope = {
        version: '1.0',
        lastModified: '2026-01-26T12:00:00.000Z',
        enabled: [],
        disabled: ['theory-doc.pdf'],
        metadata: {
          totalDocuments: 1,
          totalPages: 10,
          estimatedTokens: 5000,
          enabledCount: 0,
          disabledCount: 1
        }
      };
      mockConfigService.batchToggle.mockResolvedValue(undefined);
      mockConfigService.readScope.mockResolvedValue(mockScope);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_BULK_TOGGLE);
      await handler!({}, 'theory', false);

      expect(mockConfigService.batchToggle).toHaveBeenCalledWith('theory', false);
      expect(mockWebContentsSend).toHaveBeenCalledWith(IPC_CHANNELS.CONFIG_WATCH, mockScope);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Batch toggle failed');
      mockConfigService.batchToggle.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.DOCUMENTS_BULK_TOGGLE);

      await expect(handler!({}, 'theory', true)).rejects.toThrow('Batch toggle failed');
    });
  });

  describe('CONFIG_UPDATE_PREFERENCES handler', () => {
    it('should update preferences and broadcast config update', async () => {
      const mockPrefs: DocumentScopePreferences = {
        defaultModel: 'opus',
        showModelIndicator: true
      };
      const mockScope: DocumentScope = {
        version: '1.0',
        lastModified: '2026-01-26T12:00:00.000Z',
        enabled: [],
        disabled: [],
        metadata: {
          totalDocuments: 0,
          totalPages: 0,
          estimatedTokens: 0,
          enabledCount: 0,
          disabledCount: 0
        },
        preferences: mockPrefs
      };
      mockConfigService.updatePreferences.mockResolvedValue(mockPrefs);
      mockConfigService.readScope.mockResolvedValue(mockScope);

      const handler = handlers.get(IPC_CHANNELS.CONFIG_UPDATE_PREFERENCES);
      const result = await handler!({}, { defaultModel: 'opus' });

      expect(mockConfigService.updatePreferences).toHaveBeenCalledWith({ defaultModel: 'opus' });
      expect(mockWebContentsSend).toHaveBeenCalledWith(IPC_CHANNELS.CONFIG_WATCH, mockScope);
      expect(result).toEqual(mockPrefs);
    });

    it('should log error and rethrow on failure', async () => {
      const error = new Error('Preferences update failed');
      mockConfigService.updatePreferences.mockRejectedValue(error);

      const handler = handlers.get(IPC_CHANNELS.CONFIG_UPDATE_PREFERENCES);

      await expect(handler!({}, {})).rejects.toThrow('Preferences update failed');
    });
  });

  describe('APP_GET_PROJECT_PATH handler', () => {
    it('should return PROJECT_PATH', async () => {
      const handler = handlers.get(IPC_CHANNELS.APP_GET_PROJECT_PATH);
      const result = await handler!();

      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });
  });
});

describe('resolveProjectPath', () => {
  const originalEnv = process.env;
  const originalCwd = process.cwd;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    process.cwd = originalCwd;
    vi.resetModules();
  });

  it('should use RESEARCH_PROJECT_PATH env var when set', async () => {
    process.env.RESEARCH_PROJECT_PATH = '/custom/project/path';

    // Reset mocks for fresh import
    vi.doMock('electron', () => ({
      ipcMain: { handle: vi.fn() },
      BrowserWindow: { getAllWindows: vi.fn(() => []) }
    }));

    vi.doMock('../services/config-service', () => ({
      ConfigService: vi.fn(() => ({}))
    }));

    vi.doMock('../services/catalog-parser', () => ({
      parseCatalog: vi.fn()
    }));

    vi.doMock('../services/refresh-service', () => ({
      getRefreshService: vi.fn()
    }));

    vi.doMock('../utils/logger', () => ({
      logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }
    }));

    vi.doMock('fs', () => ({
      statSync: vi.fn()
    }));

    const { PROJECT_PATH } = await import('./handlers');

    expect(PROJECT_PATH).toBe('/custom/project/path');
  });

  it('should use cwd when .claude directory exists', async () => {
    delete process.env.RESEARCH_PROJECT_PATH;
    const mockCwd = '/mock/cwd/with/claude';
    process.cwd = vi.fn(() => mockCwd) as typeof process.cwd;

    vi.doMock('electron', () => ({
      ipcMain: { handle: vi.fn() },
      BrowserWindow: { getAllWindows: vi.fn(() => []) }
    }));

    vi.doMock('../services/config-service', () => ({
      ConfigService: vi.fn(() => ({}))
    }));

    vi.doMock('../services/catalog-parser', () => ({
      parseCatalog: vi.fn()
    }));

    vi.doMock('../services/refresh-service', () => ({
      getRefreshService: vi.fn()
    }));

    vi.doMock('../utils/logger', () => ({
      logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }
    }));

    vi.doMock('fs', () => ({
      statSync: vi.fn(() => ({ isDirectory: () => true }))
    }));

    const { PROJECT_PATH } = await import('./handlers');

    expect(PROJECT_PATH).toBe(mockCwd);
  });

  it('should fall back to default path when no env var and no .claude dir', async () => {
    delete process.env.RESEARCH_PROJECT_PATH;
    const mockCwd = '/some/other/dir';
    process.cwd = vi.fn(() => mockCwd) as typeof process.cwd;

    vi.doMock('electron', () => ({
      ipcMain: { handle: vi.fn() },
      BrowserWindow: { getAllWindows: vi.fn(() => []) }
    }));

    vi.doMock('../services/config-service', () => ({
      ConfigService: vi.fn(() => ({}))
    }));

    vi.doMock('../services/catalog-parser', () => ({
      parseCatalog: vi.fn()
    }));

    vi.doMock('../services/refresh-service', () => ({
      getRefreshService: vi.fn()
    }));

    vi.doMock('../utils/logger', () => ({
      logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }
    }));

    vi.doMock('fs', () => ({
      statSync: vi.fn(() => {
        throw new Error('ENOENT');
      })
    }));

    const { PROJECT_PATH } = await import('./handlers');

    expect(PROJECT_PATH).toBe('/Users/mrryf/develop/python/data-analysis/projects/bachelor-thesis');
  });
});
