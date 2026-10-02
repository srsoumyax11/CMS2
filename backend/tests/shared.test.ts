import { describe, expect, it, beforeAll } from 'bun:test';
import { sharedRoutes } from '../src/routes/shared';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';

const app = new Elysia().use(sharedRoutes);

describe('Shared Platform Services API Routes', () => {
  let userId: string;
  let userToken: string;
  let paymentId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `SHARED_USER_${Date.now()}`,
        full_name: 'Shared Tester',
        email: `shared_${Date.now()}@campus.edu`,
        status: 'active',
      },
    });
    userId = user.id;
    userToken = `mock_jwt_token_${userId}`;

    // Create student setup for payments
    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_SHR_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
      },
    });

    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_SHR_${Date.now()}`,
        name: 'Shared Test Dept',
      },
    });

    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: dept.id,
        code: `CSE_SHR_${Date.now()}`,
        name: 'Shared Test Course',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });

    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: course.id,
        admission_year_id: acadYear.id,
        name: 'Shared Test Batch',
      },
    });

    const studentUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `STU_SHR_${Date.now()}`,
        email: `student_shr_${Date.now()}@campus.edu`,
        full_name: 'Student Shared',
        status: 'active',
      },
    });

    await prisma.students.create({
      data: {
        user_id: studentUser.id,
        admission_no: `ADM_SHR_${Date.now()}`,
        batch_id: batch.id,
        date_of_birth: new Date('2003-01-01'),
        admitted_on: new Date('2022-08-01'),
        status: 'active',
      },
    });

    // Create test payment record for webhook testing
    const payment = await prisma.payments.create({
      data: {
        id: crypto.randomUUID(),
        student_id: studentUser.id,
        payer_user_id: userId,
        amount: 12000,
        method: 'upi',
        status: 'initiated',
        idempotency_key: `pay_shared_${Date.now()}`,
      },
    });
    paymentId = payment.id;
  });

  describe('File Storage & Uploads', () => {
    it('should generate signed file upload URL', async () => {
      const response = await app.handle(
        new Request('http://localhost/files/upload-url', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: 'passport_photo.png',
            mimeType: 'image/png',
            sizeBytes: 2048500,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.uploadUrl).toBeDefined();
      expect(json.data.storageKey).toContain('passport_photo.png');
    });
  });

  describe('Omnichannel Notifications', () => {
    it('should dispatch notification to recipient', async () => {
      const response = await app.handle(
        new Request('http://localhost/notify/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: userId,
            title: 'Outpass Approved',
            message: 'Your outpass request for home visit has been approved by Warden.',
            channelPreference: 'push',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('sent');
      expect(json.data.activeChannel).toBe('push');
    });
  });

  describe('Dynamic QR Code Engine', () => {
    it('should generate dynamic QR payload', async () => {
      const response = await app.handle(
        new Request('http://localhost/qr/generate', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payload: { studentId: userId, gateId: 'GATE_01' },
            ttlSeconds: 600,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.qrPayload).toContain('CAMPUS_QR');
    });
  });

  describe('Payment Gateway Webhooks', () => {
    it('should reconcile payment via webhook', async () => {
      const response = await app.handle(
        new Request('http://localhost/webhooks/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId,
            transactionNo: `TXN_GATEWAY_${Date.now()}`,
            status: 'SUCCESS',
            amount: 12000,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('success');
    });
  });
});
