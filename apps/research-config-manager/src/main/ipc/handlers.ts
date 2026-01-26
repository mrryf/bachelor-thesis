import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/channels';
import { ConfigService } from '../services/config-service';
import { parseCatalog } from '../services/catalog-parser';
import { getRefreshService } from '../services/refresh-service';
import { join } from 'path';
import { statSync } from 'fs';
import type { DocumentScope } from '../../shared/types';
import { logger } from '../utils/logger';

function resolveProjectPath(): string {
  // 1. Environment variable (explicit)
  if (process.env.RESEARCH_PROJECT_PATH) {
    return process.env.RESEARCH_PROJECT_PATH;
  }

  // 2. Check if cwd has .claude directory
  const cwd = process.cwd();
  try {
    if (statSync(join(cwd, '.claude')).isDirectory()) {
      return cwd;
    }
  } catch {
    /* not found */
  }

  // 3. Fallback to default
  return '/Users/mrryf/develop/python/data-analysis/projects/bachelor-thesis';
}

export const PROJECT_PATH = resolveProjectPath();

let configService: ConfigService;

export function registerIpcHandlers(): void {
  configService = new ConfigService(PROJECT_PATH);

  // Config operations
  ipcMain.handle(IPC_CHANNELS.CONFIG_READ, async () => {
    try {
      return configService.readScope();
    } catch (error) {
      logger.error('CONFIG_READ failed', error as Error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_WRITE, async (_event, scope: DocumentScope) => {
    try {
      await configService.writeScope(scope);
      broadcastConfigUpdate(scope);
    } catch (error) {
      logger.error('CONFIG_WRITE failed', error as Error);
      throw error;
    }
  });

  // Document operations
  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_LIST, async () => {
    try {
      return configService.listDocuments();
    } catch (error) {
      logger.error('DOCUMENTS_LIST failed', error as Error);
      throw error;
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.DOCUMENTS_TOGGLE,
    async (_event, docName: string, enabled: boolean) => {
      try {
        await configService.toggleDocument(docName, enabled);
        const scope = await configService.readScope();
        if (scope) {
          broadcastConfigUpdate(scope);
        }
      } catch (error) {
        logger.error('DOCUMENTS_TOGGLE failed', error as Error);
        throw error;
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_ENABLE_ALL, async () => {
    try {
      await configService.enableAll();
      const scope = await configService.readScope();
      if (scope) {
        broadcastConfigUpdate(scope);
      }
    } catch (error) {
      logger.error('DOCUMENTS_ENABLE_ALL failed', error as Error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_DISABLE_ALL, async () => {
    try {
      await configService.disableAll();
      const scope = await configService.readScope();
      if (scope) {
        broadcastConfigUpdate(scope);
      }
    } catch (error) {
      logger.error('DOCUMENTS_DISABLE_ALL failed', error as Error);
      throw error;
    }
  });

  // Get catalog
  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_GET_CATALOG, async () => {
    try {
      const catalogPath = join(PROJECT_PATH, '.claude', 'document-catalog.md');
      return parseCatalog(catalogPath);
    } catch (error) {
      logger.error('DOCUMENTS_GET_CATALOG failed', error as Error);
      throw error;
    }
  });

  // Refresh documents from PageIndex
  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_REFRESH, async () => {
    try {
      const refreshService = getRefreshService(configService);
      return refreshService.refresh();
    } catch (error) {
      logger.error('DOCUMENTS_REFRESH failed', error as Error);
      throw error;
    }
  });

  // Bulk toggle by category
  ipcMain.handle(
    IPC_CHANNELS.DOCUMENTS_BULK_TOGGLE,
    async (_event, category: string, enabled: boolean) => {
      try {
        await configService.batchToggle(category, enabled);
        const scope = await configService.readScope();
        if (scope) {
          broadcastConfigUpdate(scope);
        }
      } catch (error) {
        logger.error('DOCUMENTS_BULK_TOGGLE failed', error as Error);
        throw error;
      }
    }
  );

  // App operations
  ipcMain.handle(IPC_CHANNELS.APP_GET_PROJECT_PATH, () => {
    try {
      return PROJECT_PATH;
    } catch (error) {
      logger.error('APP_GET_PROJECT_PATH failed', error as Error);
      throw error;
    }
  });
}

function broadcastConfigUpdate(scope: DocumentScope): void {
  const windows = BrowserWindow.getAllWindows();
  for (const window of windows) {
    window.webContents.send(IPC_CHANNELS.CONFIG_WATCH, scope);
  }
}
