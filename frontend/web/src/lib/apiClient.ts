import { authStore } from './auth';
import { APP_CONSTANTS } from '@/config/constants';
import { env } from '@/config/env';

export class AppError extends Error {
  public status: number;
  public requestId?: string;
  public retryAfter?: number;
  public data?: unknown;

  constructor(message: string, status: number, requestId?: string, retryAfter?: number, data?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
  skipRefreshOn401?: boolean;
  timeoutMs?: number;
}

export function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Single-flight refresh token queue state
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

const NO_REFRESH_ENDPOINTS = [
  '/api/v1/auth/otp/send',
  '/api/v1/auth/otp/verify',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/token/refresh',
  '/api/v1/auth/logout',
  '/api/v1/auth/2fa/verify',
  '/api/v1/auth/backup-code/verify',
];

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    idempotencyKey,
    skipRefreshOn401 = false,
    timeoutMs = APP_CONSTANTS.HTTP_TIMEOUT_MS,
    headers: customHeaders,
    signal: userSignal,
    ...restOptions
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (userSignal) {
    userSignal.addEventListener('abort', () => controller.abort());
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [APP_CONSTANTS.CLIENT_TYPE_HEADER_KEY]: APP_CONSTANTS.CLIENT_TYPE_VALUE,
    ...(customHeaders as Record<string, string>),
  };

  const token = authStore.getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (idempotencyKey) {
    headers[APP_CONSTANTS.IDEMPOTENCY_HEADER_KEY] = idempotencyKey;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${env.VITE_API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers,
      signal: controller.signal,
      credentials: 'include', // Sends httpOnly refresh token cookie
    });

    clearTimeout(timeoutId);

    const requestId = response.headers.get(APP_CONSTANTS.REQUEST_ID_HEADER_KEY) || undefined;
    const retryAfterHeader = response.headers.get(APP_CONSTANTS.RETRY_AFTER_HEADER_KEY);
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;

    // Handle 401 Unauthorized with single-flight refresh queue
    const isNoRefreshUrl = NO_REFRESH_ENDPOINTS.some((urlPath) => endpoint.includes(urlPath));

    if (response.status === 401 && !skipRefreshOn401 && !isNoRefreshUrl) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshRes = await fetch(`${env.VITE_API_BASE_URL}/api/v1/auth/token/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              [APP_CONSTANTS.CLIENT_TYPE_HEADER_KEY]: APP_CONSTANTS.CLIENT_TYPE_VALUE,
            },
            credentials: 'include',
          });

          if (refreshRes.ok) {
            const refreshData = (await refreshRes.json()) as { accessToken?: string; data?: { accessToken?: string } };
            const newToken = refreshData.accessToken || refreshData.data?.accessToken || null;
            if (newToken) {
              authStore.setToken(newToken);
              onRefreshed(newToken);
              isRefreshing = false;
              // Retry original request with new token
              return apiClient<T>(endpoint, { ...options, skipRefreshOn401: true });
            }
          }
          authStore.clearToken();
          onRefreshed(null);
          isRefreshing = false;
          authStore.notifyAuthLost();
        } catch {
          authStore.clearToken();
          onRefreshed(null);
          isRefreshing = false;
          authStore.notifyAuthLost();
        }
      } else {
        // Wait for queued refresh
        return new Promise<T>((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              resolve(apiClient<T>(endpoint, { ...options, skipRefreshOn401: true }));
            } else {
              reject(new AppError('Session expired. Please log in again.', 401, requestId));
            }
          });
        });
      }
    }

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
      const errorMessage =
        errorBody.message || errorBody.error || `HTTP ${response.status}: ${response.statusText}`;

      throw new AppError(errorMessage, response.status, requestId, retryAfter, errorBody);
    }

    return (await response.json()) as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof AppError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AppError('Request timed out. Please try again.', 408);
    }
    throw new AppError(err instanceof Error ? err.message : 'Network error occurred.', 500);
  }
}
