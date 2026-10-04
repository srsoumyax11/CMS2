import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, AppError } from '@/lib/apiClient';
import { authStore } from '@/lib/auth';

describe('Auth Client & apiClient Tests', () => {
  beforeEach(() => {
    authStore.clearToken();
    vi.restoreAllMocks();
  });

  it('attaches Bearer access token from in-memory store', async () => {
    authStore.setToken('mock_access_token_123');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await apiClient('/api/v1/user/profile');

    expect(fetchSpy).toHaveBeenCalled();
    const callArgs = fetchSpy.mock.calls[0];
    const headers = callArgs[1]?.headers as Record<string, string>;

    expect(headers['Authorization']).toBe('Bearer mock_access_token_123');
    expect(headers['x-client']).toBe('web');
  });

  it('maps HTTP errors to AppError instance with status and message', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'x-request-id': 'req_err_991' },
      }),
    );

    try {
      await apiClient('/api/v1/auth/login', { method: 'POST' });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      const appErr = err as AppError;
      expect(appErr.status).toBe(400);
      expect(appErr.message).toBe('Invalid credentials');
      expect(appErr.requestId).toBe('req_err_991');
    }
  });

  it('does NOT attempt token refresh on login or refresh endpoints during 401', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    try {
      await apiClient('/api/v1/auth/login', { method: 'POST' });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
    }

    // Should only call login once, NO refresh call
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toContain('/api/v1/auth/login');

    fetchSpy.mockClear();

    try {
      await apiClient('/api/v1/auth/token/refresh', { method: 'POST' });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
    }

    // Should only call refresh once, NO recursive refresh loop
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0][0]).toContain('/api/v1/auth/token/refresh');
  });

  it('executes single-flight token refresh once on 401 for protected routes', async () => {
    authStore.setToken('old_expired_token');

    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/api/v1/auth/token/refresh')) {
        return new Response(JSON.stringify({ accessToken: 'new_fresh_token_456' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({ message: 'Token expired' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ data: 'protected_content' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const res = await apiClient<{ data: string }>('/api/v1/protected/resource');
    expect(res.data).toBe('protected_content');
    expect(authStore.getToken()).toBe('new_fresh_token_456');
  });
});
