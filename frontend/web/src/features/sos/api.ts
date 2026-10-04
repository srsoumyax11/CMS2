import { apiClient, createIdempotencyKey } from '@/lib/apiClient';
import { env } from '@/config/env';

export interface SosRecord {
  id: string;
  emergencyType: 'MEDICAL' | 'SECURITY' | 'FIRE' | 'OTHER';
  location: string;
  latitude?: number;
  longitude?: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
  triggeredAt: string;
  acknowledgedBy?: string;
}

export interface EmergencyContactInfo {
  id: string;
  title: string;
  phone: string;
  category: string;
}

export const sosApi = {
  getStudentSosAlerts: async (): Promise<SosRecord[]> => {
    if (env.VITE_USE_MOCKS) {
      return [];
    }
    return apiClient<SosRecord[]>('/api/v1/student/sos');
  },

  triggerSos: async (data: {
    emergencyType: string;
    location: string;
    latitude?: number;
    longitude?: number;
    note?: string;
  }): Promise<{ success: boolean; id: string }> => {
    return apiClient<{ success: boolean; id: string }>('/api/v1/student/sos', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },

  cancelSos: async (id: string): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>(`/api/v1/student/sos/${id}/cancel`, {
      method: 'POST',
    });
  },

  getEmergencyDirectory: async (): Promise<EmergencyContactInfo[]> => {
    if (env.VITE_USE_MOCKS) {
      return [
        { id: 'dir_1', title: 'Campus Security Main Gate', phone: '+91 98765 43210', category: 'Security' },
        { id: 'dir_2', title: 'Campus Health Centre & Ambulance', phone: '+91 98765 43211', category: 'Medical' },
        { id: 'dir_3', title: 'Hostel Chief Warden Emergency', phone: '+91 98765 43212', category: 'Warden' },
        { id: 'dir_4', title: 'Women Safety & Anti-Ragging Helpline', phone: '+91 98765 43213', category: 'Helpline' },
      ];
    }
    return apiClient<EmergencyContactInfo[]>('/api/v1/admin/emergency-directory');
  },
};
