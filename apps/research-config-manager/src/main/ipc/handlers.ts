import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/channels';
import { ConfigService } from '../services/config-service';
import { parseCatalog } from '../services/catalog-parser';
import { getRefreshService } from '../services/refresh-service';
import { join } from 'path';
import type { DocumentScope } from '../../shared/types';

// Project path - hardcoded for now, will be configurable later
export const PROJECT_PATH = '/Users/mrryf/develop/python/data-analysis/projects/bachelor-thesis';

let configService: ConfigService;

export function registerIpcHandlers(): void {
  configService = new ConfigService(PROJECT_PATH);

  // Config operations
  ipcMain.handle(IPC_CHANNELS.CONFIG_READ, async () => {
    return configService.readScope();
  });

  ipcMain.handle(IPC_CHANNELS.CONFIG_WRITE, async (_event, scope: DocumentScope) => {
    await configService.writeScope(scope);
    // Notify all windows of the update
    broadcastConfigUpdate(scope);
  });

  // Document operations
  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_LIST, async () => {
    return configService.listDocuments();
  });

  ipcMain.handle(
    IPC_CHANNELS.DOCUMENTS_TOGGLE,
    async (_event, docName: string, enabled: boolean) => {
      await configService.toggleDocument(docName, enabled);
      const scope = await configService.readScope();
      if (scope) {
        broadcastConfigUpdate(scope);
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_ENABLE_ALL, async () => {
    await configService.enableAll();
    const scope = await configService.readScope();
    if (scope) {
      broadcastConfigUpdate(scope);
    }
  });

  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_DISABLE_ALL, async () => {
    await configService.disableAll();
    const scope = await configService.readScope();
    if (scope) {
      broadcastConfigUpdate(scope);
    }
  });

  // Get catalog
  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_GET_CATALOG, async () => {
    const catalogPath = join(PROJECT_PATH, '.claude', 'document-catalog.md');
    return parseCatalog(catalogPath);
  });

  // Refresh documents from PageIndex
  ipcMain.handle(IPC_CHANNELS.DOCUMENTS_REFRESH, async () => {
    const refreshService = getRefreshService(configService);
    return refreshService.refresh();
  });

  // Bulk toggle by category
  ipcMain.handle(
    IPC_CHANNELS.DOCUMENTS_BULK_TOGGLE,
    async (_event, category: string, enabled: boolean) => {
      const documents = await configService.listDocuments();

      let docsToToggle: string[];
      if (category === '__all__') {
        docsToToggle = documents.map((d) => d.name);
      } else {
        docsToToggle = documents
          .filter((d) => d.categories.includes(category))
          .map((d) => d.name);
      }

      // Toggle each document
      for (const docName of docsToToggle) {
        await configService.toggleDocument(docName, enabled);
      }

      const scope = await configService.readScope();
      if (scope) {
        broadcastConfigUpdate(scope);
      }
    }
  );

  // App operations
  ipcMain.handle(IPC_CHANNELS.APP_GET_PROJECT_PATH, () => {
    return PROJECT_PATH;
  });
}

function broadcastConfigUpdate(scope: DocumentScope): void {
  const windows = BrowserWindow.getAllWindows();
  for (const window of windows) {
    window.webContents.send(IPC_CHANNELS.CONFIG_WATCH, scope);
  }
}
