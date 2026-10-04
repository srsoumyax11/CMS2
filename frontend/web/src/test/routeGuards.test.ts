import { describe, it, expect } from 'vitest';
import { AccountStatus } from '@/lib/auth';

describe('Account Status Route Guard Rules', () => {
  function getRedirectPath(status: AccountStatus, requestedPath: string): string | null {
    if (status === 'frozen') {
      return '/blocked';
    }

    const publicOnlyRoutes = ['/', '/login', '/register', '/forgot-password'];
    const isPublicOnly = publicOnlyRoutes.includes(requestedPath);

    if (isPublicOnly) {
      if (status !== 'not_logged_in') {
        return '/dashboard';
      }
      return null;
    }

    // Protected routes
    if (status === 'not_logged_in') {
      return '/login';
    }

    return null;
  }

  it('redirects unauthenticated users to /login when attempting to access /dashboard', () => {
    expect(getRedirectPath('not_logged_in', '/dashboard')).toBe('/login');
  });

  it('redirects authenticated users away from /login to /dashboard', () => {
    expect(getRedirectPath('registered', '/login')).toBe('/dashboard');
    expect(getRedirectPath('active', '/register')).toBe('/dashboard');
  });

  it('redirects frozen accounts to /blocked for all paths', () => {
    expect(getRedirectPath('frozen', '/dashboard')).toBe('/blocked');
    expect(getRedirectPath('frozen', '/login')).toBe('/blocked');
    expect(getRedirectPath('frozen', '/profile')).toBe('/blocked');
  });

  it('allows access to common dashboard for registered, pending_approval, and active statuses', () => {
    expect(getRedirectPath('registered', '/dashboard')).toBeNull();
    expect(getRedirectPath('pending_approval', '/dashboard')).toBeNull();
    expect(getRedirectPath('active', '/dashboard')).toBeNull();
  });
});
