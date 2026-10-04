import { create } from 'zustand';
import { ApiClient } from '@campus/api-client';
import { z } from 'zod';

export type AccountStatus =
  | 'registered'
  | 'pending_approval'
  | 'active'
  | 'rejected'
  | 'frozen';

export interface UserProfile {
  id: string;
  userCode: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accountStatus: AccountStatus | null;
  activeRole: string | null;
  permissions: string[];
  user: UserProfile | null;
  isRestoringSession: boolean;

  setSession: (session: {
    user: UserProfile;
    accountStatus: AccountStatus;
    activeRole: string | null;
    permissions?: string[];
  }) => void;
  setPermissions: (permissions: string[]) => void;
  setActiveRole: (role: string) => void;
  setRestoringSession: (isRestoring: boolean) => void;
  clearSession: () => void;
  fetchPermissions: (client: ApiClient) => Promise<void>;
}

const PermissionsResponseSchema = z.object({
  permissions: z.array(z.string()),
});

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  accountStatus: null,
  activeRole: null,
  permissions: [],
  user: null,
  isRestoringSession: true,

  setSession: (session) =>
    set({
      isAuthenticated: true,
      accountStatus: session.accountStatus,
      activeRole: session.activeRole,
      permissions: session.permissions || get().permissions,
      user: session.user,
      isRestoringSession: false,
    }),

  setPermissions: (permissions) => set({ permissions }),

  setActiveRole: (role) => set({ activeRole: role }),

  setRestoringSession: (isRestoring) => set({ isRestoringSession: isRestoring }),

  clearSession: () =>
    set({
      isAuthenticated: false,
      accountStatus: null,
      activeRole: null,
      permissions: [],
      user: null,
      isRestoringSession: false,
    }),

  fetchPermissions: async (client: ApiClient) => {
    try {
      const data = await client.get('/me/permissions', PermissionsResponseSchema);
      set({ permissions: data.permissions || [] });
    } catch {
      set({ permissions: [] });
    }
  },
}));
