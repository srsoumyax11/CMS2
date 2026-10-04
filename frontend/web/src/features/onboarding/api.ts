import { apiClient, createIdempotencyKey } from '@/lib/apiClient';

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
    return apiClient<string[]>('/api/v1/roles/requestable').catch(() => ['STUDENT', 'FACULTY', 'WARDEN']);
  },

  requestStudentRole: async (data: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/roles/request/student', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  requestFacultyRole: async (data: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/roles/request/faculty', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  requestWardenRole: async (data: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/roles/request/warden', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  linkParentAccount: async (data: Record<string, unknown>): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>('/api/v1/roles/link/parent', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  getPresignedUploadUrl: async (filename: string, contentType: string): Promise<PresignedUrlResponse> => {
    return apiClient<PresignedUrlResponse>('/api/v1/uploads/presigned-url', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    }).catch(() => ({
      uploadUrl: 'http://localhost:3000/api/v1/uploads/mock-upload',
      fileKey: `uploads/${Date.now()}_${filename}`,
      publicUrl: `http://localhost:3000/uploads/mock_${filename}`,
    }));
  },

  getMyApplications: async (): Promise<RoleApplication[]> => {
    return apiClient<RoleApplication[]>('/api/v1/roles/my-applications').catch(() => []);
  },

  cancelApplication: async (id: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/roles/applications/${id}/cancel`, {
      method: 'POST',
    });
  },

  reapplyApplication: async (id: string, data: Record<string, unknown>): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/roles/applications/${id}/reapply`, {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  getNotifications: async (): Promise<AppNotification[]> => {
    return apiClient<AppNotification[]>('/api/v1/notifications').catch(() => []);
  },

  markNotificationRead: async (id: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};
