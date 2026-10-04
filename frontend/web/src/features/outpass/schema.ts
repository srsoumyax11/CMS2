import { z } from 'zod';

export const outpassRequestSchema = z.object({
  destination: z.string().min(2, 'Destination is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  leaveTime: z.string().min(1, 'Departure time is required'),
  expectedReturnTime: z.string().min(1, 'Expected return time is required'),
  contactPhone: z.string().min(10, 'Valid emergency contact number is required'),
});

export type OutpassRequestFormData = z.infer<typeof outpassRequestSchema>;
