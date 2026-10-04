import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '../src/client';
import { AppError } from '../src/errors';
import { InMemoryTokenStore } from '../src/tokenStore';
import { z } from 'zod';

const TestDataSchema = z.object({
  status: z.string().optional(),
  paymentId: z.string().optional(),
});

describe('ApiClient', () => {
  let tokenStore: InMemoryTokenStore;
  let client: ApiClient;

  beforeEach(() => {
    tokenStore = new InMemoryTokenStore();
    client = new ApiClient('http://localhost:3000/api/v1', tokenStore, false);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps API response error into AppError correctly', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({
        'content-type': 'application/json',
        'x-request-id': 'req-test-123',
      }),
      json: async () => ({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Field email is required',
        requestId: 'req-test-123',
      }),
    } as Response);

    try {
      await client.get('/auth/login', z.any());
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.code).toBe('INVALID_INPUT');
      expect(appErr.message).toBe('Field email is required');
      expect(appErr.status).toBe(400);
      expect(appErr.requestId).toBe('req-test-123');
    }
  });

  it('parses Retry-After header for 429 status code', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: new Headers({
        'content-type': 'application/json',
        'retry-after': '60',
        'x-request-id': 'req-rate-429',
      }),
      json: async () => ({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts',
      }),
    } as Response);

    try {
      await client.post('/auth/login', z.any(), { email: 'test@example.com' });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.status).toBe(429);
      expect(appErr.retryAfter).toBe(60);
      expect(appErr.code).toBe('RATE_LIMIT_EXCEEDED');
    }
  });

  it('5 parallel 401 calls trigger EXACTLY 1 refresh request', async () => {
    await tokenStore.setAccessToken('old_expired_access_token');
    await tokenStore.setRefreshToken('valid_refresh_token');

    let refreshCallCount = 0;
    let initialRouteCalls = 0;

    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/auth/token/refresh')) {
        refreshCallCount++;
        await new Promise((resolve) => setTimeout(resolve, 20));
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            success: true,
            data: { accessToken: 'new_fresh_access_token', refreshToken: 'new_refresh_token' },
          }),
        } as Response;
      }

      initialRouteCalls++;
      if (initialRouteCalls <= 5) {
        return {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: false, error: 'UNAUTHORIZED', message: 'Token expired' }),
        } as Response;
      }

      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { status: 'ok' } }),
      } as Response;
    });

    const results = await Promise.all([
      client.get('/student/profile', TestDataSchema),
      client.get('/student/timetable', TestDataSchema),
      client.get('/student/attendance', TestDataSchema),
      client.get('/student/outpasses', TestDataSchema),
      client.get('/student/fees', TestDataSchema),
    ]);

    expect(results).toHaveLength(5);
    expect(refreshCallCount).toBe(1);
    expect(await tokenStore.getAccessToken()).toBe('new_fresh_access_token');
  });

  it('refresh failure clears tokens and fires onAuthLost event', async () => {
    await tokenStore.setAccessToken('expired_access_token');
    await tokenStore.setRefreshToken('invalid_refresh_token');

    let authLostFired = false;
    client.onAuthLost(() => {
      authLostFired = true;
    });

    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/auth/token/refresh')) {
        return {
          ok: false,
          status: 401,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: false, error: 'INVALID_REFRESH_TOKEN' }),
        } as Response;
      }
      return {
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: false, error: 'UNAUTHORIZED' }),
      } as Response;
    });

    await expect(client.get('/student/profile', TestDataSchema)).rejects.toThrow(AppError);
    expect(await tokenStore.getAccessToken()).toBeNull();
    expect(await tokenStore.getRefreshToken()).toBeNull();
    expect(authLostFired).toBe(true);
  });

  it('POST requests are NEVER retried on 500 error', async () => {
    let postCallCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      postCallCount++;
      return {
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: false, error: 'INTERNAL_SERVER_ERROR' }),
      } as Response;
    });

    await expect(client.post('/payments/pay', TestDataSchema, { amount: 100 })).rejects.toThrow(AppError);
    expect(postCallCount).toBe(1);
  });

  it('4xx errors (e.g. 400, 403, 404) are NEVER retried', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: false, error: 'NOT_FOUND' }),
      } as Response;
    });

    await expect(client.get('/non-existent-route', TestDataSchema, { maxRetries: 3 })).rejects.toThrow(AppError);
    expect(callCount).toBe(1);
  });

  it('times out and throws AppError with code TIMEOUT', async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (_url, options?: RequestInit) => {
      return new Promise((_, reject) => {
        const signal: AbortSignal | undefined = options?.signal ?? undefined;
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    });

    try {
      await client.get('/slow-endpoint', TestDataSchema, { timeoutMs: 50 });
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.code).toBe('TIMEOUT');
      expect(appErr.status).toBe(408);
    }
  });

  it('sends x-idempotency-key header when option is provided', async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let capturedHeaders: any = null;
    globalThis.fetch = vi.fn().mockImplementation(async (_url, options?: RequestInit) => {
      capturedHeaders = new Headers(options?.headers);
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, data: { paymentId: 'pay-123' } }),
      } as Response;
    });

    const key = client.generateIdempotencyKey();
    await client.post('/payments/initiate', TestDataSchema, { amount: 500 }, { idempotencyKey: key });

    expect(capturedHeaders?.get('x-idempotency-key')).toBe(key);
  });

  it('throws AppError with code SCHEMA_MISMATCH when Zod schema parsing fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        invalidKey: 'unexpected structure without success field',
      }),
    } as Response);

    const schema = z.object({ id: z.string() });

    try {
      await client.get('/data', schema);
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.code).toBe('SCHEMA_MISMATCH');
    }
  });

  it('web client sends x-client: web and credentials: include for refresh & silent restore', async () => {
    const webClient = new ApiClient('http://localhost:3000/api/v1', tokenStore, true);
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let capturedOptions: any = null;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let capturedHeaders: any = null;

    globalThis.fetch = vi.fn().mockImplementation(async (_url, options?: RequestInit) => {
      capturedOptions = options || null;
      capturedHeaders = new Headers(options?.headers);
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          success: true,
          data: { accessToken: 'web_restored_access_token' },
        }),
      } as Response;
    });

    const token = await webClient.silentRestoreSession();

    expect(token).toBe('web_restored_access_token');
    expect(capturedOptions?.credentials).toBe('include');
    expect(capturedHeaders?.get('x-client')).toBe('web');
    // On web, refresh token is stored in HttpOnly cookie, not in JS TokenStore
    expect(await tokenStore.getRefreshToken()).toBeNull();
  });

  it('logout on web clears token store and sends x-client: web with credentials: include', async () => {
    const webClient = new ApiClient('http://localhost:3000/api/v1', tokenStore, true);
    await tokenStore.setAccessToken('web_access_token');

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let capturedOptions: any = null;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let capturedHeaders: any = null;

    globalThis.fetch = vi.fn().mockImplementation(async (_url, options?: RequestInit) => {
      capturedOptions = options || null;
      capturedHeaders = new Headers(options?.headers);
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, message: 'Logged out' }),
      } as Response;
    });

    await webClient.logout();

    expect(await tokenStore.getAccessToken()).toBeNull();
    expect(capturedOptions?.credentials).toBe('include');
    expect(capturedHeaders?.get('x-client')).toBe('web');
  });

  it('uses Web Locks API navigator.locks when available on web for cross-tab safety', async () => {
    let lockRequested = false;
    let lockName = '';

    vi.stubGlobal('navigator', {
      locks: {
        request: vi.fn().mockImplementation(async (name: string, callback: () => Promise<unknown>) => {
          lockRequested = true;
          lockName = name;
          return await callback();
        }),
      },
    });

    const webClient = new ApiClient('http://localhost:3000/api/v1', tokenStore, true);

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        success: true,
        data: { accessToken: 'locked_restored_token' },
      }),
    } as Response);

    const token = await webClient.silentRestoreSession();

    expect(lockRequested).toBe(true);
    expect(lockName).toBe('campus_token_refresh');
    expect(token).toBe('locked_restored_token');

    vi.unstubAllGlobals();
  });
});
