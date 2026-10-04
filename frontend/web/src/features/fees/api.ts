import { apiClient, createIdempotencyKey } from '@/lib/apiClient';
import { env } from '@/config/env';

export interface FeeItem {
  id: string;
  headName: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE';
  dueDate: string;
  items: FeeItem[];
  paymentReceiptUrl?: string;
}

export const feesApi = {
  getStudentFees: async (): Promise<InvoiceRecord[]> => {
    if (env.VITE_USE_MOCKS) {
      return [
        {
          id: 'inv_2026_01',
          invoiceNumber: 'INV-2026-CS-0042',
          totalAmount: 65000,
          paidAmount: 65000,
          dueAmount: 0,
          status: 'PAID',
          dueDate: '2026-08-31',
          paymentReceiptUrl: 'https://example.com/receipt-0042.pdf',
          items: [
            { id: 'f1', headName: 'Semester Tuition Fee', amount: 45000, dueDate: '2026-08-31', status: 'PAID' },
            { id: 'f2', headName: 'Hostel Room Rent (Block A)', amount: 12000, dueDate: '2026-08-31', status: 'PAID' },
            { id: 'f3', headName: 'Mess Advance', amount: 8000, dueDate: '2026-08-31', status: 'PAID' },
          ],
        },
        {
          id: 'inv_2026_02',
          invoiceNumber: 'INV-2026-CS-0089',
          totalAmount: 18000,
          paidAmount: 0,
          dueAmount: 18000,
          status: 'PENDING',
          dueDate: '2026-10-31',
          items: [
            { id: 'f4', headName: 'Lab Exam & Library Fee', amount: 5000, dueDate: '2026-10-31', status: 'PENDING' },
            { id: 'f5', headName: 'Mess Charges Oct 2026', amount: 13000, dueDate: '2026-10-31', status: 'PENDING' },
          ],
        },
      ];
    }
    return apiClient<InvoiceRecord[]>('/api/v1/student/fees');
  },

  initiateStudentPayment: async (data: {
    invoiceId: string;
    paymentMethod: string;
  }): Promise<{ success: boolean; transactionId: string; amount: number; status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' }> => {
    if (env.VITE_USE_MOCKS) {
      return {
        success: true,
        transactionId: `tx_std_${Date.now()}`,
        amount: 18000,
        status: 'SUCCESS',
      };
    }
    return apiClient<{ success: boolean; transactionId: string; amount: number; status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' }>(
      '/api/v1/student/payments/initiate',
      {
        method: 'POST',
        body: JSON.stringify({ invoiceId: data.invoiceId, paymentMethod: data.paymentMethod }),
        idempotencyKey: createIdempotencyKey(),
      }
    );
  },

  initiateParentPayment: async (data: {
    invoiceId: string;
    paymentMethod: string;
    studentId: string;
  }): Promise<{ success: boolean; transactionId: string; amount: number; status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' }> => {
    if (env.VITE_USE_MOCKS) {
      return {
        success: true,
        transactionId: `tx_par_${Date.now()}`,
        amount: 18000,
        status: 'SUCCESS',
      };
    }
    return apiClient<{ success: boolean; transactionId: string; amount: number; status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' }>(
      '/api/v1/parent/payments/initiate',
      {
        method: 'POST',
        body: JSON.stringify(data),
        idempotencyKey: createIdempotencyKey(),
      }
    );
  },

  verifyPaymentStatus: async (transactionId: string): Promise<{ status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' }> => {
    if (env.VITE_USE_MOCKS) {
      return { status: 'SUCCESS' };
    }
    return apiClient<{ status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED' }>(
      `/api/v1/student/payments/status?tx=${transactionId}`
    );
  },

  requestRefund: async (data: Record<string, unknown>): Promise<{ success: boolean }> => {
    if (env.VITE_USE_MOCKS) {
      return { success: true };
    }
    return apiClient<{ success: boolean }>('/api/v1/invoices', {
      method: 'POST',
      body: JSON.stringify({ action: 'REFUND_REQUEST', ...data }),
      idempotencyKey: createIdempotencyKey(),
    });
  },
};
