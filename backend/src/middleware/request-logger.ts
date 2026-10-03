import { Elysia } from 'elysia';

export interface RequestContext {
  requestId: string;
  startTime: number;
}

/**
 * Middleware that assigns a unique Correlation ID (x-request-id) to every request
 * and tracks request duration for observability (Fixes REL-001)
 */
export const requestLogger = new Elysia({ name: 'requestLogger' })
  .derive({ as: 'global' }, ({ request, set }) => {
    const existingRequestId = request.headers.get('x-request-id');
    const requestId = existingRequestId || crypto.randomUUID();
    const startTime = Date.now();

    // Set response header for client correlation
    set.headers['x-request-id'] = requestId;

    return {
      requestId,
      startTime,
    };
  });
