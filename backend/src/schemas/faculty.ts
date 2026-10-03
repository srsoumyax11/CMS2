import { z } from 'zod';

export const startAttendanceSessionSchema = z.object({
  offeringId: z.string().uuid('Invalid Subject Offering UUID'),
  validForMinutes: z.number().min(1).max(120).default(15),
});

export const manualAttendanceSchema = z.object({
  sessionId: z.string().uuid('Invalid Session UUID'),
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(['present', 'absent', 'late']),
    })
  ).min(1, 'At least one attendance record is required'),
});

export const resolveDisputeSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  resolutionNotes: z.string().min(2).optional(),
});

export const createAssignmentSchema = z.object({
  subjectOfferingId: z.string().uuid('Invalid Subject Offering UUID'),
  title: z.string().min(2, 'Title must be at least 2 characters long'),
  description: z.string().min(5, 'Description must be at least 5 characters long'),
  dueAt: z.string().datetime({ message: 'Invalid ISO date string' }),
  totalPoints: z.number().min(1).default(100),
});

export const gradeSubmissionSchema = z.object({
  marksObtained: z.number().min(0),
  feedback: z.string().optional(),
});
