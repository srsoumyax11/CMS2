import { env } from './env';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogPayload {
  message: string;
  requestId?: string;
  action?: string;
  userId?: string;
  durationMs?: number;
  meta?: Record<string, any>;
}

// ANSI Escape Colors for pretty console logging
const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
};

const LOG_LEVEL_DECORATORS: Record<LogLevel, { emoji: string; badge: string }> = {
  info: { emoji: 'ℹ️ ', badge: `${COLORS.cyan}[INFO]${COLORS.reset}` },
  warn: { emoji: '⚠️ ', badge: `${COLORS.yellow}[WARN]${COLORS.reset}` },
  error: { emoji: '🚨', badge: `${COLORS.red}[ERROR]${COLORS.reset}` },
  debug: { emoji: '🔍', badge: `${COLORS.magenta}[DEBUG]${COLORS.reset}` },
};

class Logger {
  /**
   * Determines active log format mode:
   * 1. Explicit LOG_FORMAT env var ('pretty' | 'json')
   * 2. Default: 'json' in production, 'pretty' in development & test
   */
  public getLogFormat(): 'pretty' | 'json' {
    if (process.env.LOG_FORMAT) {
      return process.env.LOG_FORMAT === 'pretty' ? 'pretty' : 'json';
    }
    if (env?.LOG_FORMAT) {
      return env.LOG_FORMAT;
    }
    return (env?.NODE_ENV || process.env.NODE_ENV) === 'production' ? 'json' : 'pretty';
  }

  public formatLog(level: LogLevel, payload: LogPayload): string {
    const format = this.getLogFormat();

    if (format === 'json') {
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

    // Pretty color-coded log format with emojis for development
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const { emoji, badge } = LOG_LEVEL_DECORATORS[level];
    const timestampStr = `${COLORS.gray}${now}${COLORS.reset}`;
    const reqStr = payload.requestId ? `${COLORS.blue}(${payload.requestId.substring(0, 8)})${COLORS.reset} ` : '';
    const actionStr = payload.action ? `${COLORS.green}[${payload.action}]${COLORS.reset} ` : '';
    const durationStr = payload.durationMs !== undefined ? ` ${COLORS.yellow}+${payload.durationMs}ms${COLORS.reset}` : '';
    const msgStr = `${COLORS.bold}${payload.message}${COLORS.reset}`;

    let metaStr = '';
    if (payload.meta && Object.keys(payload.meta).length > 0) {
      try {
        metaStr = `\n  ${COLORS.dim}${JSON.stringify(payload.meta)}${COLORS.reset}`;
      } catch {
        // Fallback for unserializable meta
      }
    }

    return `${timestampStr} ${emoji} ${badge} ${reqStr}${actionStr}${msgStr}${durationStr}${metaStr}`;
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
    if ((env?.NODE_ENV || process.env.NODE_ENV) !== 'production') {
      console.debug(this.formatLog('debug', payload));
    }
  }
}

export const logger = new Logger();
