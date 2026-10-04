import { apiClient, createIdempotencyKey } from '@/lib/apiClient';
import { env } from '@/config/env';

export interface OutpassRecord {
  id: string;
  destination: string;
  reason: string;
  leaveTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
  appliedAt: string;
  rejectionReason?: string;
  studentName?: string;
  studentRoll?: string;
}

export const outpassApi = {
  getStudentOutpasses: async (): Promise<OutpassRecord[]> => {
    if (env.VITE_USE_MOCKS) {
      return [
        {
          id: 'out_mock_101',
          destination: 'Metro Station Mall',
          reason: 'Weekend medical supplies purchase',
          leaveTime: '2026-10-05 10:00 AM',
          expectedReturnTime: '2026-10-05 06:00 PM',
          status: 'PENDING',
          appliedAt: '2026-10-04 08:30 PM',
        },
      ];
    }
    return apiClient<OutpassRecord[]>('/api/v1/student/outpasses');
  },

  createOutpass: async (data: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/student/outpasses', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  cancelOutpass: async (_id: string): Promise<{ success: boolean }> => {
    if (env.VITE_USE_MOCKS) {
      return { success: true };
    }
    return apiClient<{ success: boolean }>('/api/v1/student/outpasses', {
      method: 'POST',
      body: JSON.stringify({ action: 'CANCEL', outpassId: _id }),
    });
  },

  checkInReturn: async (_id: string): Promise<{ success: boolean }> => {
    if (env.VITE_USE_MOCKS) {
      return { success: true };
    }
    return apiClient<{ success: boolean }>('/api/v1/student/outpasses', {
      method: 'POST',
      body: JSON.stringify({ action: 'CHECK_IN', outpassId: _id }),
    });
  },

  // Warden outpass inbox
  getWardenOutpasses: async (): Promise<OutpassRecord[]> => {
    if (env.VITE_USE_MOCKS) {
      return [
        {
          id: 'out_mock_201',
          destination: 'Railway Station',
          reason: 'Home visit',
          leaveTime: '2026-10-05 04:00 PM',
          expectedReturnTime: '2026-10-08 08:00 AM',
          status: 'PENDING',
          appliedAt: '2026-10-04 07:00 PM',
          studentName: 'Rahul Sharma',
          studentRoll: '21CS042',
        },
      ];
    }
    return apiClient<OutpassRecord[]>('/api/v1/warden/outpasses');
  },

  getWardenOverdueOutpasses: async (): Promise<OutpassRecord[]> => {
    if (env.VITE_USE_MOCKS) {
      return [];
    }
    return apiClient<OutpassRecord[]>('/api/v1/warden/outpasses/overdue');
  },

  approveOutpass: async (id: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/warden/outpasses/${id}/approve`, {
      method: 'POST',
    });
  },

  rejectOutpass: async (id: string, reason: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/warden/outpasses/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
