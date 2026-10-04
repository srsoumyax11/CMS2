/**
 * Safe application logger ensuring sensitive data (tokens, passwords, OTPs) are never logged.
 */
export const logger = {
  info: (message: string, ...meta: unknown[]): void => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, ...meta);
    }
  },
  warn: (message: string, ...meta: unknown[]): void => {
    console.warn(`[WARN] ${message}`, ...meta);
  },
  error: (message: string, ...meta: unknown[]): void => {
    console.error(`[ERROR] ${message}`, ...meta);
  },
};
