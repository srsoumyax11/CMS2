import { authStore } from './auth';
import { APP_CONSTANTS } from '@/config/constants';
import { env } from '@/config/env';

export interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { idempotencyKey, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [APP_CONSTANTS.CLIENT_TYPE_HEADER_KEY]: APP_CONSTANTS.CLIENT_TYPE_VALUE,
    ...(customHeaders as Record<string, string>),
  };

  const token = authStore.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (idempotencyKey) {
    headers[APP_CONSTANTS.IDEMPOTENCY_HEADER_KEY] = idempotencyKey;
  }

  const url = `${env.VITE_API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers,
    credentials: 'include', // Ensures httpOnly cookies (refresh_token) are sent
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({ message: 'Network response was not ok' }))) as {
      message?: string;
    };
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
