export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogPayload {
  message: string;
  requestId?: string;
  action?: string;
  userId?: string;
  durationMs?: number;
  meta?: Record<string, any>;
}

class Logger {
  private formatLog(level: LogLevel, payload: LogPayload) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message: payload.message,
      requestId: payload.requestId || undefined,
      action: payload.action || undefined,
      userId: payload.userId || undefined,
      durationMs: payload.durationMs || undefined,
      ...(payload.meta ? { meta: payload.meta } : {}),
    });
  }

  info(payload: LogPayload) {
    console.log(this.formatLog('info', payload));
  }

  warn(payload: LogPayload) {
    console.warn(this.formatLog('warn', payload));
  }

  error(payload: LogPayload) {
    console.error(this.formatLog('error', payload));
  }

  debug(payload: LogPayload) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('debug', payload));
    }
  }
}

export const logger = new Logger();
