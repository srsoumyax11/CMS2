import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authStore, UserProfile, AccountStatus } from '@/lib/auth';
import { apiClient } from '@/lib/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  accountStatus: AccountStatus;
  permissions: string[];
  isLoadingSession: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);

  const accountStatus: AccountStatus = user?.status || 'not_logged_in';
  const permissions: string[] = user?.permissions || [];

  const fetchCurrentUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const res = await apiClient<{ user: UserProfile; permissions?: string[] }>('/api/v1/auth/me');
      const profile = res.user;
      if (res.permissions) {
        profile.permissions = res.permissions;
      }
      return profile;
    } catch {
      return null;
    }
  }, []);

  const refetchProfile = useCallback(async (): Promise<void> => {
    const profile = await fetchCurrentUser();
    if (profile) {
      setUser(profile);
    } else {
      setUser(null);
      authStore.clearToken();
    }
  }, [fetchCurrentUser]);

  // Silent session restore on initial page mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        // Try refreshing token via httpOnly cookie first
        const refreshRes = await fetch('/api/v1/auth/token/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
          credentials: 'include',
        }).catch(() => null);

        if (refreshRes && refreshRes.ok) {
          const data = (await refreshRes.json()) as { accessToken?: string; data?: { accessToken?: string } };
          const token = data.accessToken || data.data?.accessToken;
          if (token) {
            authStore.setToken(token);
            const profile = await fetchCurrentUser();
            if (isMounted && profile) {
              setUser(profile);
            }
          }
        }
      } catch {
        // Session restore failed, user remains unauthenticated
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    }

    restoreSession();

    const unsubscribe = authStore.onAuthLost(() => {
      if (isMounted) {
        setUser(null);
        authStore.clearToken();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchCurrentUser]);

  const login = useCallback((token: string, userProfile: UserProfile) => {
    authStore.setToken(token);
    setUser(userProfile);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient('/api/v1/auth/logout', { method: 'POST' }).catch(() => null);
    } finally {
      authStore.clearToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accountStatus,
        permissions,
        isLoadingSession,
        login,
        logout,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
