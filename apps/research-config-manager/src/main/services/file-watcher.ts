import { watch, type FSWatcher } from 'fs';
import { BrowserWindow } from 'electron';
import { join, basename } from 'path';
import { IPC_CHANNELS } from '../../shared/channels';
import { logger } from '../utils/logger';

export interface ExternalChangeEvent {
  file: string;
  path: string;
  timestamp: number;
}

export class FileWatcherService {
  private watchers: Map<string, FSWatcher> = new Map();
  private projectPath: string;

  // Track our own writes to avoid echo
  private recentWrites = new Set<string>();
  private writeTimeout = 1000; // ms to ignore after our own write

  // Debounce tracking
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private debounceMs = 500;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  start(): void {
    const watchPaths = [
      join(this.projectPath, '.claude', 'document-scope.json'),
      join(this.projectPath, '.claude', 'pageindex-state.json')
    ];

    for (const watchPath of watchPaths) {
      if (this.watchers.has(watchPath)) {
        continue;
      }

      try {
        const watcher = watch(watchPath, (eventType) => {
          if (eventType === 'change') {
            this.handleChange(watchPath);
          }
        });

        watcher.on('error', (error) => {
          logger.error(`File watcher error for ${watchPath}`, error as Error);
        });

        this.watchers.set(watchPath, watcher);
        logger.info(`Watching for changes: ${watchPath}`);
      } catch (error) {
        // File might not exist yet, that's okay
        logger.warn(`Could not watch ${watchPath}`, { error });
      }
    }
  }

  private handleChange(path: string): void {
    // Ignore our own writes
    if (this.recentWrites.has(path)) {
      return;
    }

    // Debounce rapid changes
    const existingTimer = this.debounceTimers.get(path);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(path);
      this.notifyChange(path);
    }, this.debounceMs);

    this.debounceTimers.set(path, timer);
  }

  private notifyChange(path: string): void {
    const filename = basename(path);

    const event: ExternalChangeEvent = {
      file: filename,
      path,
      timestamp: Date.now()
    };

    logger.info(`External change detected: ${filename}`);

    // Notify all windows
    const windows = BrowserWindow.getAllWindows();
    for (const window of windows) {
      window.webContents.send(IPC_CHANNELS.CONFIG_EXTERNAL_CHANGE, event);
    }
  }

  /**
   * Call this before writing to a watched file to prevent echo notifications
   */
  markAsOurWrite(path: string): void {
    this.recentWrites.add(path);
    setTimeout(() => {
      this.recentWrites.delete(path);
    }, this.writeTimeout);
  }

  stop(): void {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      logger.info(`Stopped watching: ${path}`);
    }
    this.watchers.clear();

    // Clear debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
}

// Singleton instance
let fileWatcherInstance: FileWatcherService | null = null;

export function getFileWatcher(projectPath: string): FileWatcherService {
  if (!fileWatcherInstance) {
    fileWatcherInstance = new FileWatcherService(projectPath);
  }
  return fileWatcherInstance;
}
