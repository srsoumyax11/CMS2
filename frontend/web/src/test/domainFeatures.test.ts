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
});
