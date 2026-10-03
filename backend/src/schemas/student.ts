import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
  phone: z.string().min(10).max(15).optional(),
  preferredLanguage: z.string().min(2).max(10).optional(),
});

export const nameCorrectionSchema = z.object({
  newName: z.string().min(2, 'New name must be at least 2 characters long').max(100),
  evidenceFileId: z.string().uuid().optional(),
});

export const createOutpassSchema = z.object({
  reason: z.string().min(3, 'Reason must be at least 3 characters long'),
  destination: z.string().min(2, 'Destination must be at least 2 characters long'),
  outAt: z.string().datetime({ message: 'Invalid ISO date time string for outAt' }),
  expectedReturnAt: z.string().datetime({ message: 'Invalid ISO date time string for expectedReturnAt' }),
});

export const triggerSosSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  source: z.enum(['button', 'shake', 'roommate', 'faculty', 'guard']).optional(),
});

export const attendanceDisputeSchema = z.object({
  sessionId: z.string().uuid('Session ID must be a valid UUID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
});

export const submitAssignmentSchema = z.object({
  fileId: z.string().uuid('File ID must be a valid UUID'),
});
