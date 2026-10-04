import { apiClient, createIdempotencyKey } from '@/lib/apiClient';
import { UserProfile } from '@/lib/auth';
import { env } from '@/config/env';

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
    const endpoint = isBackupCode ? '/api/v1/auth/backup-code/verify' : '/api/v1/auth/2fa/verify';
    return apiClient<AuthResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ ticket2fa, code }),
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
    return apiClient<AuthResponse>('/api/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  resendOtp: async (email: string): Promise<{ resendCooldownSec: number }> => {
    return apiClient<{ resendCooldownSec: number }>('/api/v1/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>('/api/v1/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  getDevices: async (): Promise<DeviceSession[]> => {
    if (env.VITE_USE_MOCKS) {
      return [
        {
          id: 'dev_mock_1',
          deviceName: 'Web Browser (Mock Mode)',
          browser: 'Chrome / Edge',
          ipAddress: '127.0.0.1',
          lastActive: 'Active Now',
          isCurrent: true,
        },
      ];
    }
    return apiClient<DeviceSession[]>('/api/v1/auth/devices');
  },

  revokeDevice: async (deviceId: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/auth/devices/${deviceId}`, {
      method: 'DELETE',
    });
  },

  logoutAllDevices: async (): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>('/api/v1/auth/logout-all', {
      method: 'POST',
      idempotencyKey: createIdempotencyKey(),
    });
  },
};
