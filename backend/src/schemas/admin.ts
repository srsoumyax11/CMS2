import { z } from 'zod';

export const freezeUserSchema = z.object({
  reason: z.string().min(3, 'Freeze reason is required'),
});

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  code: z.string().min(2, 'Department code must be at least 2 characters'),
});

export const createCourseSchema = z.object({
  name: z.string().min(2, 'Course name must be at least 2 characters'),
  code: z.string().min(2, 'Course code must be at least 2 characters'),
  departmentId: z.string().uuid('Invalid Department UUID'),
});

export const createBatchSchema = z.object({
  name: z.string().min(2, 'Batch name must be at least 2 characters'),
  courseId: z.string().uuid('Invalid Course UUID'),
  academicYearId: z.string().uuid('Invalid Academic Year UUID'),
});

export const emergencyBroadcastSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  message: z.string().min(5, 'Message is required'),
  severity: z.enum(['info', 'high', 'critical']).default('high'),
  targetRole: z.string().optional(),
});

export const decideNameCorrectionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  remarks: z.string().optional(),
});
