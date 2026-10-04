import { logger } from '@campus/logger';
import { AppError } from './errors';
import { ApiResponseSchema } from './schemas';
import { InMemoryTokenStore, TokenStore } from './tokenStore';
import { z } from 'zod';

export interface RequestOptions<T = unknown> extends Omit<RequestInit, 'body'> {
  body?: unknown;
  idempotencyKey?: string;
  timeoutMs?: number;
  maxRetries?: number;
  schema: z.ZodType<T>; // REQUIRED Zod Schema
  isWebClient?: boolean;
}

export type AuthLostListener = () => void;

export class ApiClient {
  private baseUrl: string;
  private tokenStore: TokenStore;
  private refreshPromise: Promise<string | null> | null = null;
  private authLostListeners: AuthLostListener[] = [];
  private isWeb: boolean;

  constructor(
    baseUrl: string,
    tokenStore: TokenStore = new InMemoryTokenStore(),
    isWebClient: boolean = typeof window !== 'undefined'
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.tokenStore = tokenStore;
    this.isWeb = isWebClient;
  }

  public getTokenStore(): TokenStore {
    return this.tokenStore;
  }

  public onAuthLost(listener: AuthLostListener): () => void {
    this.authLostListeners.push(listener);
    return () => {
      this.authLostListeners = this.authLostListeners.filter((l) => l !== listener);
    };
  }

  private notifyAuthLost(): void {
    for (const listener of this.authLostListeners) {
      try {
        listener();
      } catch (err) {
        logger.error('[ApiClient] Error in onAuthLost listener', { error: err });
      }
    }
  }

  public generateIdempotencyKey(): string {
    return (
      globalThis.crypto?.randomUUID() ||
      'idempotency-' + Math.random().toString(36).substring(2) + Date.now().toString(36)
    );
  }

  // High-level API methods requiring Zod schema parameter
  public async get<T>(
    path: string,
    schema: z.ZodType<T>,
    options?: Omit<RequestOptions<T>, 'schema' | 'method'>
  ): Promise<T> {
    return this.internalRequest<T>(path, { ...options, schema, method: 'GET' });
  }

  public async post<T>(
    path: string,
    schema: z.ZodType<T>,
    body?: unknown,
    options?: Omit<RequestOptions<T>, 'schema' | 'method' | 'body'>
  ): Promise<T> {
    return this.internalRequest<T>(path, { ...options, schema, method: 'POST', body });
  }

  public async put<T>(
    path: string,
    schema: z.ZodType<T>,
    body?: unknown,
    options?: Omit<RequestOptions<T>, 'schema' | 'method' | 'body'>
  ): Promise<T> {
    return this.internalRequest<T>(path, { ...options, schema, method: 'PUT', body });
  }

  public async delete<T>(
    path: string,
    schema: z.ZodType<T>,
    options?: Omit<RequestOptions<T>, 'schema' | 'method'>
  ): Promise<T> {
    return this.internalRequest<T>(path, { ...options, schema, method: 'DELETE' });
  }

  // Web silent session restoration on app load
  public async silentRestoreSession(): Promise<string | null> {
    if (!this.isWeb) {
      return this.tokenStore.getAccessToken();
    }
    return this.refreshTokenSingleFlight();
  }

  // Logout method (clears token store + calls backend logout endpoint with web cookie handling)
  public async logout(): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.isWeb) {
        headers['x-client'] = 'web';
      }
      const token = await this.tokenStore.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers,
        credentials: this.isWeb ? 'include' : 'same-origin',
      });
    } catch (err) {
      logger.warn('[ApiClient] Logout request failed on server', { error: err });
    } finally {
      await this.tokenStore.clearTokens();
      this.notifyAuthLost();
    }
  }

  // Internal request execution method requiring Zod schema
  protected async internalRequest<T>(path: string, options: RequestOptions<T>): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    const maxRetries = method === 'GET' ? options.maxRetries ?? 3 : 0;
    const timeoutMs = options.timeoutMs ?? 15000;
    const isAuthRoute = path.includes('/auth/') || path.includes('/login') || path.includes('/otp/');

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await this.executeSingleRequest<T>(path, method, options, timeoutMs, isAuthRoute);
      } catch (err: unknown) {
        if (err instanceof AppError && err.status === 401 && !isAuthRoute) {
          // Single-flight refresh token
          const refreshedToken = await this.refreshTokenSingleFlight();
          if (refreshedToken) {
            return await this.executeSingleRequest<T>(path, method, options, timeoutMs, isAuthRoute);
          } else {
            await this.tokenStore.clearTokens();
            this.notifyAuthLost();
            throw err;
          }
        }

        if (err instanceof AppError && err.status === 429 && method === 'GET' && attempt < maxRetries) {
          attempt++;
          const waitTimeMs = (err.retryAfter ?? 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTimeMs));
          continue;
        }

        if (attempt < maxRetries && method === 'GET' && this.isRetryableError(err)) {
          attempt++;
          const jitter = Math.floor(Math.random() * 100);
          const delayMs = Math.pow(2, attempt) * 200 + jitter;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        throw err;
      }
    }

    throw new AppError({
      code: 'REQUEST_FAILED',
      message: 'Request failed after maximum retries',
      status: 500,
    });
  }

  private async executeSingleRequest<T>(
    path: string,
    method: string,
    options: RequestOptions<T>,
    timeoutMs: number,
    _isAuthRoute: boolean
  ): Promise<T> {
    const requestId =
      globalThis.crypto?.randomUUID() || 'req-' + Math.random().toString(36).substring(2);
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
      ...(options.headers as Record<string, string>),
    };

    if (this.isWeb || options.isWebClient) {
      headers['x-client'] = 'web';
    }

    const token = await this.tokenStore.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.idempotencyKey) {
      headers['x-idempotency-key'] = options.idempotencyKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    logger.debug(`[API Request] ${method} ${url}`, { requestId, method, url });

    let bodyPayload: BodyInit | undefined = undefined;
    if (options.body !== undefined) {
      bodyPayload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    const restOptions = { ...options } as Record<string, unknown>;
    delete restOptions.schema;
    delete restOptions.isWebClient;
    delete restOptions.idempotencyKey;
    delete restOptions.timeoutMs;
    delete restOptions.maxRetries;
    delete restOptions.body;

    const fetchOptions: RequestInit = {
      ...(restOptions as RequestInit),
      method,
      headers,
      signal: controller.signal,
      credentials: (this.isWeb || options.isWebClient) ? 'include' : 'same-origin',
      body: bodyPayload,
    };

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const resRequestId = response.headers.get('x-request-id') || requestId;
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        let errorData: Record<string, unknown> = {};
        if (contentType.includes('application/json')) {
          errorData = (await response.json()) as Record<string, unknown>;
        }

        const retryAfterStr = response.headers.get('retry-after');
        const retryAfter = retryAfterStr ? parseInt(retryAfterStr, 10) : undefined;

        logger.warn(`[API Error] ${response.status} ${url}`, {
          requestId: resRequestId,
          status: response.status,
          error: errorData,
        });

        const errorMsg =
          typeof errorData.message === 'string'
            ? errorData.message
            : typeof errorData.error === 'string'
              ? errorData.error
              : response.statusText || 'API Error';

        const errorCode = typeof errorData.error === 'string' ? errorData.error : `HTTP_${response.status}`;

        throw new AppError({
          code: errorCode,
          message: errorMsg,
          status: response.status,
          requestId: resRequestId,
          retryAfter,
        });
      }

      const json = await response.json();
      logger.debug(`[API Response] ${response.status} ${url}`, { requestId: resRequestId });

      // Enforce Zod schema validation
      const schemaWrapper = ApiResponseSchema(options.schema);
      const parsed = schemaWrapper.safeParse(json);

      if (!parsed.success) {
        logger.error(`[API Schema Mismatch] ${url}`, { requestId: resRequestId, issues: parsed.error.issues });
        throw new AppError({
          code: 'SCHEMA_MISMATCH',
          message: 'API response did not match expected Zod schema',
          status: response.status,
          requestId: resRequestId,
        });
      }

      return (parsed.data.data !== undefined ? parsed.data.data : parsed.data) as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof AppError) {
        throw err;
      }
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (isAbort) {
        throw new AppError({
          code: 'TIMEOUT',
          message: `Request timed out after ${timeoutMs}ms`,
          status: 408,
          requestId,
        });
      }
      const message = err instanceof Error ? err.message : 'Network error occurred';
      throw new AppError({
        code: 'NETWORK_ERROR',
        message,
        status: 0,
        requestId,
      });
    }
  }

  private async refreshTokenSingleFlight(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const performRefresh = async (): Promise<string | null> => {
      if (this.refreshPromise) {
        return this.refreshPromise;
      }
      this.refreshPromise = (async () => {
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          if (this.isWeb) {
            headers['x-client'] = 'web';
          }

          const body: Record<string, string> = {};
          if (!this.isWeb) {
            const refreshToken = await this.tokenStore.getRefreshToken();
            if (!refreshToken) {
              await this.tokenStore.clearTokens();
              return null;
            }
            body.refreshToken = refreshToken;
          }

          const response = await fetch(`${this.baseUrl}/auth/token/refresh`, {
            method: 'POST',
            headers,
            credentials: this.isWeb ? 'include' : 'same-origin',
            body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
          });

          if (!response.ok) {
            await this.tokenStore.clearTokens();
            return null;
          }

          const json = (await response.json()) as Record<string, unknown>;
          const dataObj = (json.data || json) as Record<string, unknown>;
          const newAccessToken = (dataObj.accessToken || json.accessToken) as string | undefined;
          const newRefreshToken = (dataObj.refreshToken || json.refreshToken) as string | undefined;

          if (newAccessToken) {
            await this.tokenStore.setAccessToken(newAccessToken);
            if (newRefreshToken && !this.isWeb) {
              await this.tokenStore.setRefreshToken(newRefreshToken);
            }
            return newAccessToken;
          }

          await this.tokenStore.clearTokens();
          return null;
        } catch {
          await this.tokenStore.clearTokens();
          return null;
        } finally {
          this.refreshPromise = null;
        }
      })();

      return this.refreshPromise;
    };

    if (
      this.isWeb &&
      typeof navigator !== 'undefined' &&
      'locks' in navigator &&
      typeof (navigator as { locks?: { request?: unknown } }).locks?.request === 'function'
    ) {
      const locks = (navigator as unknown as { locks: { request: (name: string, cb: () => Promise<string | null>) => Promise<string | null> } }).locks;
      return locks.request('campus_token_refresh', () => performRefresh());
    }

    return performRefresh();
  }

  private isRetryableError(err: unknown): boolean {
    if (err instanceof AppError) {
      return err.status === 0 || err.status >= 500;
    }
    return true;
  }
}
