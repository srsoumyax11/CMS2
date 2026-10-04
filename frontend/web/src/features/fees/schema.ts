import { z } from 'zod';

export const payFeeSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['UPI', 'NET_BANKING', 'CARD']),
  confirmStudentName: z.string().min(2, 'Please confirm student name'),
});

export const refundRequestSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  reason: z.string().min(10, 'Please state your refund reason (min 10 chars)'),
  bankAccountNumber: z.string().min(8, 'Bank account number required'),
  ifscCode: z.string().min(4, 'IFSC code required'),
});

export type PayFeeFormValues = z.infer<typeof payFeeSchema>;
export type RefundRequestFormValues = z.infer<typeof refundRequestSchema>;
