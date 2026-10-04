import { z } from 'zod';

export const complaintSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Please describe your complaint in detail'),
  photoUrl: z.string().optional(),
});

export type ComplaintFormData = z.infer<typeof complaintSchema>;
