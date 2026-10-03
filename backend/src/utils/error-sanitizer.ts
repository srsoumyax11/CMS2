import { logger } from '../config/logger';
import { env } from '../config/env';

/**
 * Checks if a given error or message string represents a raw system/database internal error.
 * Raw system errors (Prisma invocations, stack traces, IP addresses, database connection failures)
 * should NEVER be leaked to frontend clients unless EXPOSE_RAW_ERRORS=true is set for developer debugging.
 */
export function isRawSystemError(err: unknown): boolean {
  if (!err) return false;

  const errStr = typeof err === 'string' ? err : err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : '';

  // Prisma Client Error names or System Exception types
  if (
    name.startsWith('PrismaClient') ||
    name === 'TypeError' ||
    name === 'ReferenceError' ||
    name === 'SyntaxError'
  ) {
    return true;
  }

  // Keywords indicating internal stack trace, DB connection issue, or file system paths
  const rawKeywords = [
    'prisma.',
    'Invalid `prisma',
    "Can't reach database server",
    'postgresql://',
    'postgres:',
    '127.0.0.1',
    ':54322',
    ':5432',
    'Foreign key constraint failed',
    'Unique constraint failed',
    'Table does not exist',
    'at Object.<anonymous>',
    'at async ',
    '\\\\src\\\\routes\\\\',
    '/src/routes/',
    'node_modules',
  ];

  return rawKeywords.some((kw) => errStr.includes(kw));
}

/**
 * Sanitizes error messages before returning them in API responses.
 * If EXPOSE_RAW_ERRORS=true, raw error strings are returned directly for developer debugging.
 * Otherwise, raw internal server/database details are sanitized and replaced with safe messages.
 */
export function sanitizeErrorMessage(err: unknown, fallbackMessage = 'An error occurred while processing your request'): string {
  const exposeRaw = process.env.EXPOSE_RAW_ERRORS === 'true' || env.EXPOSE_RAW_ERRORS === 'true';

  if (exposeRaw) {
    return typeof err === 'string' ? err : err instanceof Error ? err.message : String(err);
  }

  if (isRawSystemError(err)) {
    // Log the full raw internal error to server logs for debugging
    logger.error({
      message: `[Raw Error Intercepted & Sanitized] ${err instanceof Error ? err.message : String(err)}`,
      meta: {
        stack: err instanceof Error ? err.stack : undefined,
      },
    });

    // Specific user-friendly fallback for DB connection loss
    const errStr = typeof err === 'string' ? err : err instanceof Error ? err.message : String(err);
    if (errStr.includes("Can't reach database server")) {
      return 'Database service is temporarily unavailable. Please try again shortly.';
    }

    return fallbackMessage;
  }

  // If err is a normal string or safe business error, return it
  if (typeof err === 'string' && err.trim().length > 0) {
    return err;
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallbackMessage;
}
