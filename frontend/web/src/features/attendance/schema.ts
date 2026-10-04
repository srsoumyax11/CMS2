import { z } from 'zod';

export const attendanceCodeSchema = z.object({
  code: z.string().length(6, 'Session attendance code must be exactly 6 digits'),
});

export const attendanceDisputeSchema = z.object({
  subjectId: z.string().min(1, 'Please select a subject'),
  date: z.string().min(1, 'Date is required'),
  reason: z.string().min(10, 'Please state the reason clearly (min 10 chars)'),
  evidenceUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

export const leaveApplicationSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(10, 'Please explain your leave reason (min 10 chars)'),
  leaveType: z.enum(['MEDICAL', 'DUTY_LEAVE', 'CASUAL']),
});

export type AttendanceCodeFormValues = z.infer<typeof attendanceCodeSchema>;
export type AttendanceDisputeFormValues = z.infer<typeof attendanceDisputeSchema>;
export type LeaveApplicationFormValues = z.infer<typeof leaveApplicationSchema>;
