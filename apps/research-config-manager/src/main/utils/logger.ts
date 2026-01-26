import { app } from 'electron';
import { join } from 'path';
import { existsSync, mkdirSync, appendFileSync } from 'fs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  [key: string]: unknown;
}

class Logger {
  private logPath: string;
  private isDev: boolean;

  constructor() {
    this.isDev = !app.isPackaged;
    const logsDir = join(app.getPath('userData'), 'logs');

    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }

    this.logPath = join(logsDir, 'app.log');
  }

  private formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  private log(level: LogLevel, message: string, meta?: LogMeta): void {
    const formatted = this.formatMessage(level, message, meta);

    // Always log to console in dev
    if (this.isDev) {
      const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
      consoleFn(formatted);
    }

    // Write to file in production
    if (!this.isDev) {
      try {
        appendFileSync(this.logPath, formatted + '\n');
      } catch {
        // Silently fail if unable to write to log file
      }
    }
  }

  debug(message: string, meta?: LogMeta): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: LogMeta): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: LogMeta): void {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: LogMeta): void {
    const errorMeta = error
      ? { ...meta, error: error.message, stack: error.stack }
      : meta;
    this.log('error', message, errorMeta);
  }
}

export const logger = new Logger();
