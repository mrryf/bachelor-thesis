import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/channels';
import type {
  DocumentScope,
  DocumentMetadata,
  ParsedCatalog,
  RefreshResult
} from '../shared/types';

export type API = {
  config: {
    read: () => Promise<DocumentScope | null>;
    write: (scope: DocumentScope) => Promise<void>;
    onUpdate: (callback: (scope: DocumentScope) => void) => () => void;
  };
  documents: {
    list: () => Promise<DocumentMetadata[]>;
    toggle: (docName: string, enabled: boolean) => Promise<void>;
    enableAll: () => Promise<void>;
    disableAll: () => Promise<void>;
    getCatalog: () => Promise<ParsedCatalog | null>;
    bulkToggle: (category: string, enabled: boolean) => Promise<void>;
    refresh: () => Promise<RefreshResult>;
  };
  app: {
    getProjectPath: () => Promise<string>;
  };
};

const api: API = {
  config: {
    read: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_READ),
    write: (scope) => ipcRenderer.invoke(IPC_CHANNELS.CONFIG_WRITE, scope),
    onUpdate: (callback) => {
      const handler = (_event: Electron.IpcRendererEvent, scope: DocumentScope) => callback(scope);
      ipcRenderer.on(IPC_CHANNELS.CONFIG_WATCH, handler);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.CONFIG_WATCH, handler);
      };
    }
  },
  documents: {
    list: () => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_LIST),
    toggle: (docName, enabled) =>
      ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_TOGGLE, docName, enabled),
    enableAll: () => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_ENABLE_ALL),
    disableAll: () => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_DISABLE_ALL),
    getCatalog: () => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_GET_CATALOG),
    bulkToggle: (category, enabled) =>
      ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_BULK_TOGGLE, category, enabled),
    refresh: () => ipcRenderer.invoke(IPC_CHANNELS.DOCUMENTS_REFRESH)
  },
  app: {
    getProjectPath: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PROJECT_PATH)
  }
};

contextBridge.exposeInMainWorld('api', api);
