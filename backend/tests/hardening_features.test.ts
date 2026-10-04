import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { createRateLimiter } from '../src/middleware/rate-limit';
import { getClientIp } from '../src/utils/session';
import { financeHealthRoutes } from '../src/routes/finance_health';
import { studentRoutes } from '../src/routes/student';
import { sharedRoutes } from '../src/routes/shared';
import { parentRoutes } from '../src/routes/parent';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { createHmac } from 'node:crypto';
import { env } from '../src/config/env';

describe('Pre-Launch Production Hardening Features & Tests', () => {
  describe('1. Client IP Extraction & Separate Buckets (Requirement 1)', () => {
    it('uses socket IP (x-socket-ip in test) when TRUSTED_PROXY=false', () => {
      process.env.TRUSTED_PROXY = 'false';
      const req1 = new Request('http://localhost/test', {
        headers: { 'x-socket-ip': '10.0.0.1', 'x-forwarded-for': '8.8.8.8' },
      });
      const ip1 = getClientIp(req1);
      expect(ip1).toBe('10.0.0.1'); // Attacker header 8.8.8.8 IGNORED!
    });

    it('isolates rate limit buckets for two separate socket IPs', async () => {
      process.env.SKIP_RATE_LIMIT = 'false';
      process.env.ENABLE_TEST_RATE_LIMIT = 'true';
      const prefix = `test_ip_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const app = new Elysia().get(
        '/limited',
        () => ({ ok: true }),
        { beforeHandle: createRateLimiter(60000, 2, prefix) }
      );

      // IP 1: hits limit after 2 requests
      const res1_1 = await app.handle(new Request('http://localhost/limited', { headers: { 'x-socket-ip': '192.168.1.100' } }));
      const res1_2 = await app.handle(new Request('http://localhost/limited', { headers: { 'x-socket-ip': '192.168.1.100' } }));
      const res1_3 = await app.handle(new Request('http://localhost/limited', { headers: { 'x-socket-ip': '192.168.1.100' } }));

      expect(res1_1.status).toBe(200);
      expect(res1_2.status).toBe(200);
      expect(res1_3.status).toBe(429); // IP 1 blocked!

      // IP 2: still has full capacity in separate bucket!
      const res2_1 = await app.handle(new Request('http://localhost/limited', { headers: { 'x-socket-ip': '192.168.1.101' } }));
      expect(res2_1.status).toBe(200);

      process.env.ENABLE_TEST_RATE_LIMIT = 'false';
    });
  });

  describe('4. Anonymous Report & User Linkage Test (Requirement 4)', () => {
    const app = new Elysia().use(financeHealthRoutes);

    it('submits anonymous report with tracking token and asserts NO user table linkage', async () => {
      const res = await app.handle(
        new Request('http://localhost/safety/reports/anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Unfair Treatment Incident',
            category: 'harassment',
            incidentDetails: 'Detailed report of incident without revealing reporter identity',
            location: 'Main Library Room 204',
          }),
        })
      );

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.trackingToken).toBeDefined();
      expect(json.data.trackingToken.startsWith('anon_tok_')).toBe(true);

      const trackingToken = json.data.trackingToken;

      // Status check by tracking token
      const statusRes = await app.handle(
        new Request(`http://localhost/safety/reports/anonymous/${trackingToken}`)
      );
      expect(statusRes.status).toBe(200);
      const statusJson = (await statusRes.json()) as any;
      expect(statusJson.data.status).toBeDefined();

      // Assert NO user linkage in DB
      const reportDb = await prisma.anonymous_reports.findFirst({
        where: { body: { contains: 'Unfair Treatment Incident' } },
        include: { safety_cases: true },
      });

      expect(reportDb).toBeDefined();
      expect(reportDb?.assigned_to).toBeNull(); // No assigned reporter
      expect(reportDb?.safety_cases[0]?.complainant_id).toBeNull(); // Complainant ID IS NULL
    });
  });

  describe('6. Payments Webhook Signature & Idempotency (Requirement 6)', () => {
    const app = new Elysia().use(sharedRoutes);

    it('rejects payment webhook with invalid HMAC signature', async () => {
      const res = await app.handle(
        new Request('http://localhost/webhooks/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-signature': 'invalid_hmac_hex',
          },
          body: JSON.stringify({
            paymentId: crypto.randomUUID(),
            transactionNo: 'TXN-999',
            status: 'SUCCESS',
            amount: 5000,
          }),
        })
      );

      expect(res.status).toBe(400);
      const json = (await res.json()) as any;
      expect(json.error).toBe('INVALID_SIGNATURE');
    });

    it('processes valid webhook and ignores duplicate webhook replay', async () => {
      // Find or create test student
      let student = await prisma.students.findFirst();
      if (!student) {
        const user = await prisma.users.create({
          data: {
            id: crypto.randomUUID(),
            user_code: `STU_PAY_${Date.now()}`,
            full_name: 'Payer Student',
            status: 'active',
          },
        });
        const batch = await prisma.batches.findFirst() || await prisma.batches.create({
          data: {
            id: crypto.randomUUID(),
            name: 'Batch 2026',
            course_id: (await prisma.courses.findFirst())?.id || crypto.randomUUID(),
            admission_year_id: (await prisma.academic_years.findFirst())?.id || crypto.randomUUID(),
          },
        });
        student = await prisma.students.create({
          data: {
            user_id: user.id,
            admission_no: `ADM_PAY_${Date.now()}`,
            batch_id: batch.id,
            date_of_birth: new Date('2002-01-01'),
            admitted_on: new Date(),
          },
        });
      }

      const payment = await prisma.payments.create({
        data: {
          id: crypto.randomUUID(),
          student_id: student.user_id,
          payer_user_id: student.user_id,
          amount: 2500,
          method: 'upi',
          status: 'initiated',
          idempotency_key: `pay_test_${Date.now()}`,
        },
      });

      const txnNo = `TXN_${Date.now()}`;
      const validSig = createHmac('sha256', env.WEBHOOK_SECRET)
        .update(`${payment.id}:${txnNo}:2500`)
        .digest('hex');

      // First webhook: success
      const res1 = await app.handle(
        new Request('http://localhost/webhooks/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-signature': validSig,
          },
          body: JSON.stringify({
            paymentId: payment.id,
            transactionNo: txnNo,
            status: 'SUCCESS',
            amount: 2500,
          }),
        })
      );

      expect(res1.status).toBe(200);
      const json1 = (await res1.json()) as any;
      expect(json1.data.status).toBe('success');

      // Second duplicate webhook: ignored!
      const res2 = await app.handle(
        new Request('http://localhost/webhooks/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-signature': validSig,
          },
          body: JSON.stringify({
            paymentId: payment.id,
            transactionNo: txnNo,
            status: 'SUCCESS',
            amount: 2500,
          }),
        })
      );

      expect(res2.status).toBe(200);
      const json2 = (await res2.json()) as any;
      expect(json2.data.ignored).toBe(true);
    });
  });

  describe('7. SOS Idempotency, Roommate Trigger & Escalation Order (Requirement 7)', () => {
    const app = new Elysia().use(studentRoutes);

    it('triggers SOS idempotently and handles roommate trigger with escalation sequence', async () => {
      // Find or create test student
      let student = await prisma.students.findFirst();
      if (!student) {
        const user = await prisma.users.create({
          data: {
            id: crypto.randomUUID(),
            user_code: `STU_SOS_${Date.now()}`,
            full_name: 'SOS Student',
            status: 'active',
          },
        });
        const batch = await prisma.batches.findFirst() || await prisma.batches.create({
          data: {
            id: crypto.randomUUID(),
            name: 'Batch 2026',
            course_id: (await prisma.courses.findFirst())?.id || crypto.randomUUID(),
            admission_year_id: (await prisma.academic_years.findFirst())?.id || crypto.randomUUID(),
          },
        });
        student = await prisma.students.create({
          data: {
            user_id: user.id,
            admission_no: `ADM_SOS_${Date.now()}`,
            batch_id: batch.id,
            date_of_birth: new Date('2002-01-01'),
            admitted_on: new Date(),
          },
        });
      }

      const victimId = student.user_id;
      const studentId = student.user_id;

      const token = signAccessToken({ sub: studentId, userCode: `STU_TEST_${Date.now()}` });
      const idempotencyKey = `sos_key_${Date.now()}`;

      // First SOS call (Roommate trigger on behalf of victim)
      const res1 = await app.handle(
        new Request('http://localhost/student/sos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            source: 'roommate',
            victimStudentId: victimId,
            idempotencyKey,
            latitude: 20.2961,
            longitude: 85.8245,
          }),
        })
      );

      expect(res1.status).toBe(200);
      const json1 = (await res1.json()) as any;
      expect(json1.data.incidentId).toBeDefined();
      expect(json1.data.studentId).toBe(victimId);
      expect(json1.data.triggeredBy).toBe(studentId);
      expect(json1.data.escalationSequence).toBeDefined();

      // Second duplicate call with same idempotencyKey: returns idempotent replay
      const res2 = await app.handle(
        new Request('http://localhost/student/sos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            source: 'roommate',
            victimStudentId: victimId,
            idempotencyKey,
          }),
        })
      );

      expect(res2.status).toBe(200);
      const json2 = (await res2.json()) as any;
      expect(json2.data.isIdempotentReplay).toBe(true);
    });
  });
});
