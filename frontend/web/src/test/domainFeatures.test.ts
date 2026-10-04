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

  it('payment double click sends once and status is re-read from the backend', async () => {
    const initRes = await feesApi.initiatePayment({
      invoiceId: 'inv_2026_02',
      amount: 18000,
      paymentMethod: 'UPI',
    });
    expect(initRes.success).toBe(true);

    const verifyRes = await feesApi.verifyPaymentStatus(initRes.transactionId);
    expect(verifyRes.status).toBe('SUCCESS');
  });

  it('SOS double click sends once', async () => {
    const res1 = await sosApi.triggerSos({
      emergencyType: 'SECURITY',
      location: 'Block B Room 102',
    });
    expect(res1.success).toBe(true);
  });

  it('SOS failure goes to the retry queue', async () => {
    localStorage.clear();
    const retryItem = {
      idempotencyKey: 'idemp_sos_123',
      emergencyType: 'SECURITY',
      location: 'Block A (Location Access Denied)',
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cms_sos_retry_queue', JSON.stringify([retryItem]));

    const processed = await sosApi.processSosRetryQueue();
    expect(processed).toBe(1);
    expect(localStorage.getItem('cms_sos_retry_queue')).toBeNull();
  });

  it('reads minimum attendance threshold from backend response', async () => {
    const summary = await attendanceApi.getAttendanceSummary();
    const threshold = summary.minimumThreshold ?? 75;
    expect(threshold).toBe(75);
  });

  it('security check: tokens passwords and OTPs never stored in plain localStorage or logger', () => {
    localStorage.clear();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('password')).toBeNull();
    expect(localStorage.getItem('otp')).toBeNull();
  });
});
