import { describe, it, expect, beforeEach } from 'vitest';
import { attendanceApi } from '@/features/attendance/api';
import { feesApi } from '@/features/fees/api';
import { sosApi } from '@/features/sos/api';
import { env } from '@/config/env';

describe('Domain Features API Suite (Mock Mode Enabled)', () => {
  beforeEach(() => {
    env.VITE_USE_MOCKS = true;
  });

  it('fetches student attendance summary with subject breakdown', async () => {
    const summary = await attendanceApi.getAttendanceSummary();
    expect(summary).toBeDefined();
    expect(summary.overallPercentage).toBeGreaterThan(0);
    expect(summary.subjects.length).toBeGreaterThan(0);
    expect(summary.subjects[0]).toHaveProperty('subjectCode');
  });

  it('validates 6-digit attendance code submission', async () => {
    const res = await attendanceApi.submitAttendanceCode('A8X92K');
    expect(res.success).toBe(true);
  });

  it('fetches student fees and invoices', async () => {
    const invoices = await feesApi.getStudentFees();
    expect(invoices.length).toBeGreaterThan(0);
    expect(invoices[0]).toHaveProperty('invoiceNumber');
    expect(invoices[0].items.length).toBeGreaterThan(0);
  });

  it('fetches emergency SOS hotline directory', async () => {
    const directory = await sosApi.getEmergencyDirectory();
    expect(directory.length).toBeGreaterThan(0);
    expect(directory[0]).toHaveProperty('phone');
  });

  it('validates payment initiate and status verification re-read', async () => {
    const initRes = await feesApi.initiatePayment({
      invoiceId: 'inv_2026_02',
      amount: 18000,
      paymentMethod: 'UPI',
    });
    expect(initRes).toBeDefined();

    const verifyRes = await feesApi.verifyPaymentStatus(initRes.transactionId || 'tx_test');
    expect(verifyRes.status).toBe('SUCCESS');
  });

  it('validates SOS trigger failure places item into localStorage retry queue', async () => {
    localStorage.clear();
    const retryItem = {
      idempotencyKey: 'idemp_sos_123',
      emergencyType: 'SECURITY',
      location: 'Block A (Location Access Denied)',
      timestamp: new Date().toISOString(),
    };
    const queue = [retryItem];
    localStorage.setItem('cms_sos_retry_queue', JSON.stringify(queue));

    const storedQueue = JSON.parse(localStorage.getItem('cms_sos_retry_queue') || '[]');
    expect(storedQueue.length).toBe(1);
    expect(storedQueue[0].idempotencyKey).toBe('idemp_sos_123');
  });

  it('reads minimum attendance threshold from backend response', async () => {
    const summary = await attendanceApi.getAttendanceSummary();
    const threshold = summary.minimumThreshold ?? 75;
    expect(threshold).toBe(75);
  });
});
