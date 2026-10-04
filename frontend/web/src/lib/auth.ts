import { Role } from '@/config/roles';

export type AccountStatus = 'not_logged_in' | 'registered' | 'pending_approval' | 'active' | 'rejected' | 'frozen';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  status: AccountStatus;
  roles: Role[];
  activeRole?: Role;
  permissions: string[];
  roleRequestStatus?: 'PENDING' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejectionReason?: string;
}

let memoryAccessToken: string | null = null;
let authLostListeners: Array<() => void> = [];

export const authStore = {
  getToken: (): string | null => memoryAccessToken,
  setToken: (token: string | null): void => {
    memoryAccessToken = token;
  },
  clearToken: (): void => {
    memoryAccessToken = null;
  },
  onAuthLost: (listener: () => void): (() => void) => {
    authLostListeners.push(listener);
    return () => {
      authLostListeners = authLostListeners.filter((l) => l !== listener);
    };
  },
  notifyAuthLost: (): void => {
    authLostListeners.forEach((listener) => listener());
  },
};
