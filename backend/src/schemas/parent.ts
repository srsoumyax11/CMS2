import { z } from 'zod';

export const requestParentLinkSchema = z.object({
  admissionNo: z.string().min(3, 'Admission number required'),
  dateOfBirth: z.string().min(10, 'Date of birth format YYYY-MM-DD'),
  relationship: z.string().min(2, 'Relationship type required (father, mother, guardian)'),
});

export const initiatePaymentSchema = z.object({
  invoiceId: z.string().uuid('Invalid Invoice UUID'),
  paymentMethod: z.enum(['upi', 'card', 'netbanking']).default('upi'),
});

export const parentOutpassDecisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  remarks: z.string().optional(),
});
