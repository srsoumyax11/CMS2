import { redactSensitiveData } from './redact';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  data?: unknown;
}

export type LogTransport = (entry: LogEntry) => void;

class Logger {
  private transports: LogTransport[] = [];

  public addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  public removeTransport(transport: LogTransport): void {
    this.transports = this.transports.filter((t) => t !== transport);
  }

  private output(entry: LogEntry): void {
    const sanitizedEntry: LogEntry = {
      ...entry,
      data: entry.data ? redactSensitiveData(entry.data) : undefined,
    };

    const formatted = JSON.stringify(sanitizedEntry);

    switch (entry.level) {
      case 'debug':
        /* eslint-disable-next-line no-console */
        console.debug(`[DEBUG] ${formatted}`);
        break;
      case 'info':
        /* eslint-disable-next-line no-console */
        console.info(`[INFO] ${formatted}`);
        break;
      case 'warn':
        /* eslint-disable-next-line no-console */
        console.warn(`[WARN] ${formatted}`);
        break;
      case 'error':
        /* eslint-disable-next-line no-console */
        console.error(`[ERROR] ${formatted}`);
        break;
    }

    // Dispatch to registered external transports (e.g. Sentry, DataDog, analytics)
    for (const transport of this.transports) {
      try {
        transport(sanitizedEntry);
      } catch (err) {
        /* eslint-disable-next-line no-console */
        console.error('[Logger Transport Error]', err);
      }
    }
  }

  public debug(message: string, data?: unknown, requestId?: string): void {
    this.output({ level: 'debug', message, timestamp: new Date().toISOString(), data, requestId });
  }

  public info(message: string, data?: unknown, requestId?: string): void {
    this.output({ level: 'info', message, timestamp: new Date().toISOString(), data, requestId });
  }

  public warn(message: string, data?: unknown, requestId?: string): void {
    this.output({ level: 'warn', message, timestamp: new Date().toISOString(), data, requestId });
  }

  public error(message: string, data?: unknown, requestId?: string): void {
    this.output({ level: 'error', message, timestamp: new Date().toISOString(), data, requestId });
  }
}

export const logger = new Logger();
export { redactSensitiveData };
