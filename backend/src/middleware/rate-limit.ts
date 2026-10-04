import { env } from '../config/env';
import { getClientIp } from '../utils/session';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

/**
 * Single-instance in-memory rate limit store.
 * NOTE (Multi-Instance Scaling):
 * In a multi-instance cluster deployment (multiple backend instances behind a load balancer),
 * in-memory maps are process-local. For multi-node deployments, configure a shared Redis store
 * (`REDIS_URL`) where counters use atomic `redis.incr(key)` and `redis.expire(key, windowSeconds)`.
 */
const store = new Map<string, RateLimitStore>();

/**
 * Creates a rate limiting middleware handler function for specified routes
 * @param windowMs Window duration in milliseconds (e.g. 15 * 60 * 1000 for 15m)
 * @param maxRequests Maximum requests allowed within window
 */
export function createRateLimiter(
  windowMs: number,
  maxRequests: number,
  prefix = 'rl',
  keyGenerator?: (request: Request, server?: any) => string
) {
  const handler = ({ request, server, set }: { request: Request; server?: any; set?: any }) => {
    const skipLimit = process.env.SKIP_RATE_LIMIT ? process.env.SKIP_RATE_LIMIT === 'true' : env.SKIP_RATE_LIMIT === 'true';
    const enableTestLimit = process.env.ENABLE_TEST_RATE_LIMIT ? process.env.ENABLE_TEST_RATE_LIMIT === 'true' : env.ENABLE_TEST_RATE_LIMIT === 'true';
    const isTestEnv = process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test';

    // In test mode, skip routine rate limiting unless specifically testing rate limits
    if (skipLimit || (isTestEnv && !enableTestLimit)) {
      return;
    }

    const clientIp = getClientIp(request, server);
    const identifier = keyGenerator ? keyGenerator(request, server) : clientIp;
    const key = `${prefix}:${identifier}`;
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
      if (set) {
        set.status = 429;
      }
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
  };

  const fn = (arg: any) => {
    if (arg && typeof arg === 'object' && typeof arg.onBeforeHandle === 'function' && 'routes' in arg) {
      return arg.onBeforeHandle({ as: 'global' }, handler);
    }
    return handler(arg);
  };

  return fn as any;
}
