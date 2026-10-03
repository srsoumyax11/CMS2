import { Elysia } from 'elysia';
import { env } from '../config/env';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

/**
 * Creates a rate limiting middleware for specified routes
 * @param windowMs Window duration in milliseconds (e.g. 15 * 60 * 1000 for 15m)
 * @param maxRequests Maximum requests allowed within window
 */
export function createRateLimiter(windowMs: number, maxRequests: number, prefix = 'rl') {
  return new Elysia({ name: `rateLimiter_${prefix}` })
    .onBeforeHandle({ as: 'global' }, ({ request }) => {
      const skipLimit = process.env.SKIP_RATE_LIMIT === 'true' || env.SKIP_RATE_LIMIT === 'true';
      const enableTestLimit = process.env.ENABLE_TEST_RATE_LIMIT === 'true' || env.ENABLE_TEST_RATE_LIMIT === 'true';

      // In test mode, skip routine rate limiting unless specifically testing rate limits
      if (skipLimit || (env.NODE_ENV === 'test' && !enableTestLimit)) {
        return;
      }

      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || '127.0.0.1';
      const key = `${prefix}:${clientIp}`;
      const now = Date.now();

      const record = store.get(key);

      if (!record || now > record.resetTime) {
        store.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
        return;
      }

      if (record.count >= maxRequests) {
        const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Too many requests. Please try again after ${retryAfterSeconds} seconds.`,
            retryAfter: retryAfterSeconds,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(retryAfterSeconds),
              'X-RateLimit-Limit': String(maxRequests),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }

      record.count += 1;
      store.set(key, record);
    });
}
