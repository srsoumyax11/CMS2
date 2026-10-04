import { apiClient, createIdempotencyKey } from '@/lib/apiClient';
import { env } from '@/config/env';

export interface SubjectAttendance {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  thresholdWarning: boolean;
}

export interface AttendanceSummary {
  overallPercentage: number;
  totalClasses: number;
  totalAttended: number;
  thresholdWarning: boolean;
  minimumThreshold?: number;
  subjects: SubjectAttendance[];
}

export interface AttendanceDisputeRecord {
  id: string;
  subjectCode: string;
  date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
}

export const attendanceApi = {
  getAttendanceSummary: async (): Promise<AttendanceSummary> => {
    if (env.VITE_USE_MOCKS) {
      return {
        overallPercentage: 78.5,
        totalClasses: 120,
        totalAttended: 94,
        thresholdWarning: false,
        subjects: [
          {
            subjectId: 'cs101',
            subjectCode: 'CS101',
            subjectName: 'Data Structures & Algorithms',
            totalClasses: 30,
            attendedClasses: 26,
            percentage: 86.6,
            thresholdWarning: false,
          },
          {
            subjectId: 'cs102',
            subjectCode: 'CS102',
            subjectName: 'Operating Systems',
            totalClasses: 28,
            attendedClasses: 20,
            percentage: 71.4,
            thresholdWarning: true,
          },
          {
            subjectId: 'cs103',
            subjectCode: 'CS103',
            subjectName: 'Database Management Systems',
            totalClasses: 32,
            attendedClasses: 25,
            percentage: 78.1,
            thresholdWarning: false,
          },
          {
            subjectId: 'cs104',
            subjectCode: 'CS104',
            subjectName: 'Computer Networks',
            totalClasses: 30,
            attendedClasses: 23,
            percentage: 76.6,
            thresholdWarning: false,
          },
        ],
      };
    }
    return apiClient<AttendanceSummary>('/api/v1/student/attendance/summary');
  },

  submitAttendanceCode: async (code: string): Promise<{ success: boolean; message: string }> => {
    if (env.VITE_USE_MOCKS) {
      return { success: true, message: 'Attendance marked successfully for current session!' };
    }
    return apiClient<{ success: boolean; message: string }>('/api/v1/student/attendance/summary', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  getDisputes: async (): Promise<AttendanceDisputeRecord[]> => {
    if (env.VITE_USE_MOCKS) {
      return [
        {
          id: 'disp_1',
          subjectCode: 'CS102',
          date: '2026-10-01',
          reason: 'Medical appointment at Campus Clinic',
          status: 'PENDING',
          appliedAt: '2026-10-02',
        },
      ];
    }
    return apiClient<AttendanceDisputeRecord[]>('/api/v1/student/attendance/disputes');
  },

  createDispute: async (data: Record<string, unknown>): Promise<{ success: boolean }> => {
    return apiClient<{ success: boolean }>('/api/v1/student/attendance/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
      idempotencyKey: createIdempotencyKey(),
    });
  },
};
