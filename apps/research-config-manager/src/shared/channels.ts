export const IPC_CHANNELS = {
  // Config operations
  CONFIG_READ: 'config:read',
  CONFIG_WRITE: 'config:write',
  CONFIG_WATCH: 'config:watch',
  CONFIG_EXTERNAL_CHANGE: 'config:external-change',

  // Document operations
  DOCUMENTS_LIST: 'documents:list',
  DOCUMENTS_TOGGLE: 'documents:toggle',
  DOCUMENTS_ENABLE_ALL: 'documents:enable-all',
  DOCUMENTS_DISABLE_ALL: 'documents:disable-all',
  DOCUMENTS_GET_CATALOG: 'documents:get-catalog',
  DOCUMENTS_BULK_TOGGLE: 'documents:bulk-toggle',
  DOCUMENTS_REFRESH: 'documents:refresh',

  // App operations
  APP_GET_PROJECT_PATH: 'app:get-project-path'
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
