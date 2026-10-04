import { useAuthStore } from '../src/store/authStore';

describe('AuthSessionStore (Zustand)', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('initializes with default unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accountStatus).toBeNull();
    expect(state.user).toBeNull();
    expect(state.permissions).toEqual([]);
  });

  it('updates session data correctly when setSession is called', () => {
    useAuthStore.getState().setSession({
      user: { id: 'u-1', userCode: 'STU001', fullName: 'Alice Test' },
      accountStatus: 'active',
      activeRole: 'student',
      permissions: ['read:profile', 'write:outpass'],
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accountStatus).toBe('active');
    expect(state.activeRole).toBe('student');
    expect(state.user?.userCode).toBe('STU001');
    expect(state.permissions).toContain('write:outpass');
  });

  it('clears session state on logout', () => {
    useAuthStore.getState().setSession({
      user: { id: 'u-1', userCode: 'STU001', fullName: 'Alice Test' },
      accountStatus: 'active',
      activeRole: 'student',
    });

    useAuthStore.getState().clearSession();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accountStatus).toBeNull();
    expect(state.user).toBeNull();
  });
});
