import { z } from 'zod';

export const outpassDecisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewRemarks: z.string().min(2, 'Review remarks are required').optional(),
});

export const allocateBedSchema = z.object({
  studentId: z.string().uuid('Invalid Student UUID'),
  bedId: z.string().uuid('Invalid Bed UUID'),
  fromDate: z.string().datetime({ message: 'Invalid ISO date string' }).optional(),
});

export const hygieneCheckSchema = z.object({
  messId: z.string().uuid('Invalid Mess UUID'),
  score: z.number().min(1).max(100),
  remarks: z.string().min(3),
  inspectionDate: z.string().datetime().optional(),
});

export const visitorPassSchema = z.object({
  visitorName: z.string().min(2),
  phone: z.string().min(10).max(15),
  studentId: z.string().uuid(),
  purpose: z.string().min(3),
  entryTime: z.string().datetime().optional(),
});

export const closeSosSchema = z.object({
  closureReport: z.string().min(5, 'Closure report must be at least 5 characters long'),
});
