import { apiClient, createIdempotencyKey } from '@/lib/apiClient';
import { UserProfile } from '@/lib/auth';

export interface AuthResponse {
  accessToken?: string;
  user?: UserProfile;
  requires2fa?: boolean;
  ticket2fa?: string;
  resendCooldownSec?: number;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export const authApi = {
  login: async (emailOrId: string, password: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrId, password }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  verify2fa: async (ticket2fa: string, code: string, isBackupCode?: boolean): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/v1/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ ticket2fa, code, isBackupCode }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  register: async (fullName: string, email: string, password: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  verifyOtp: async (email: string, code: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  resendOtp: async (email: string): Promise<{ resendCooldownSec: number }> => {
    return apiClient<{ resendCooldownSec: number }>('/api/v1/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>('/api/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  getDevices: async (): Promise<DeviceSession[]> => {
    return apiClient<DeviceSession[]>('/api/v1/auth/devices').catch(() => [
      {
        id: 'dev_current',
        deviceName: 'Web Browser (Current Session)',
        browser: 'Chrome / Edge',
        ipAddress: '127.0.0.1',
        lastActive: 'Active Now',
        isCurrent: true,
      },
    ]);
  },

  revokeDevice: async (deviceId: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/auth/devices/${deviceId}`, {
      method: 'DELETE',
    });
  },

  logoutAllDevices: async (): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>('/api/v1/auth/devices/logout-all', {
      method: 'POST',
      idempotencyKey: createIdempotencyKey(),
    });
  },
};
