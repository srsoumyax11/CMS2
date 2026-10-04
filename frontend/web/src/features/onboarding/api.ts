import { apiClient, createIdempotencyKey } from '@/lib/apiClient';
import { env } from '@/config/env';

export interface RoleApplication {
  id: string;
  role: string;
  status: 'PENDING' | 'NEEDS_INFO' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedAt: string;
  rejectionReason?: string;
  infoRequestNote?: string;
  details?: Record<string, unknown>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

export const onboardingApi = {
  getRequestableRoles: async (): Promise<string[]> => {
    return apiClient<string[]>('/api/v1/roles/requestable');
  },

  requestStudentRole: async (data: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/auth/role-request', {
      method: 'POST',
      body: JSON.stringify({ role: 'STUDENT', ...data }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  requestFacultyRole: async (data: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/auth/role-request', {
      method: 'POST',
      body: JSON.stringify({ role: 'FACULTY', ...data }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  requestWardenRole: async (data: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/auth/role-request', {
      method: 'POST',
      body: JSON.stringify({ role: 'WARDEN', ...data }),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  linkParentAccount: async (data: Record<string, unknown>): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>('/api/v1/parent/link/request', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  getPresignedUploadUrl: async (filename: string, contentType: string): Promise<PresignedUrlResponse> => {
    if (env.VITE_USE_MOCKS) {
      return {
        uploadUrl: 'http://localhost:3000/api/v1/uploads/mock-upload',
        fileKey: `uploads/${Date.now()}_${filename}`,
        publicUrl: `http://localhost:3000/uploads/mock_${filename}`,
      };
    }
    return apiClient<PresignedUrlResponse>('/api/v1/files/upload-url', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    });
  },

  getMyApplications: async (): Promise<RoleApplication[]> => {
    return apiClient<RoleApplication[]>('/api/v1/role-requests');
  },

  cancelApplication: async (id: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/role-requests/${id}/cancel`, {
      method: 'POST',
    });
  },

  reapplyApplication: async (id: string, data: Record<string, unknown>): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/role-requests/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  getNotifications: async (): Promise<AppNotification[]> => {
    return apiClient<AppNotification[]>('/api/v1/notifications');
  },

  markNotificationRead: async (id: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};
