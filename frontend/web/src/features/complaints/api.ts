import { apiClient, createIdempotencyKey } from '@/lib/apiClient';
import { env } from '@/config/env';

export interface ComplaintComment {
  id: string;
  authorName: string;
  authorRole: string;
  comment: string;
  createdAt: string;
}

export interface ComplaintRecord {
  id: string;
  title: string;
  category: string;
  description: string;
  photoUrl?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt?: string;
  comments?: ComplaintComment[];
  assignedStaff?: string;
}

export const complaintsApi = {
  getStudentComplaints: async (): Promise<ComplaintRecord[]> => {
    if (env.VITE_USE_MOCKS) {
      return [
        {
          id: 'cmp_mock_1',
          title: 'Hostel Room Water Leakage',
          category: 'Plumbing / Maintenance',
          description: 'Bathroom pipe leakage in Room 302',
          status: 'IN_PROGRESS',
          createdAt: '2026-10-03',
          assignedStaff: 'Warden Ramesh Kumar',
        },
      ];
    }
    return apiClient<ComplaintRecord[]>('/api/v1/safety/cases');
  },

  createComplaint: async (data: Record<string, unknown>): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/safety/cases', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  reopenComplaint: async (id: string, reason: string): Promise<{ success: boolean }> => {
    if (env.VITE_USE_MOCKS) {
      return { success: true };
    }
    return apiClient<{ success: boolean }>('/api/v1/safety/cases', {
      method: 'POST',
      body: JSON.stringify({ action: 'REOPEN', caseId: id, reason }),
    });
  },

  addComment: async (id: string, comment: string): Promise<{ success: boolean }> => {
    if (env.VITE_USE_MOCKS) {
      return { success: true };
    }
    return apiClient<{ success: boolean }>('/api/v1/safety/cases', {
      method: 'POST',
      body: JSON.stringify({ action: 'COMMENT', caseId: id, comment }),
    });
  },
};
