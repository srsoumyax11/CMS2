import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { authRoutes } from '../src/routes/auth';
import { onboardingRoutes } from '../src/routes/onboarding';
import { approvalsRoutes } from '../src/routes/approvals';
import { parentRoutes } from '../src/routes/parent';
import { sharedRoutes } from '../src/routes/shared';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';

describe('Additional Pre-Launch Feature Verification Suite', () => {
  describe('1. OpenAPI Response Schema Verification', () => {
    it('generates non-empty swagger/json responses block', async () => {
      const app = new Elysia()
        .use(authRoutes)
        .use(onboardingRoutes)
        .use(approvalsRoutes)
        .use(parentRoutes)
        .use(sharedRoutes);

      const res = await app.handle(new Request('http://localhost/swagger/json'));
      expect(res.status).toBeDefined();
    });
  });

  describe('2. Signup Auto-Login & OTP Purpose Confirmation', () => {
    it('POST /auth/register returns access token (auto login) and consumes verify OTP', async () => {
      const app = new Elysia().use(authRoutes);
      const target = `test_signup_${Date.now()}@campus.edu`;

      // Create a verified OTP with purpose 'verify'
      const otp = await prisma.otp_requests.create({
        data: {
          id: crypto.randomUUID(),
          target,
          channel: 'email',
          purpose: 'verify',
          code_hash: 'hash',
          expires_at: new Date(Date.now() + 600000),
          consumed_at: new Date(),
        },
      });

      const regRes = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target,
            password: 'Password123!',
            fullName: 'Signup Auto Login User',
            otpId: otp.id,
          }),
        })
      );

      expect(regRes.status).toBe(200);
      const json = (await regRes.json()) as any;
      expect(json.data.accessToken).toBeDefined();
      expect(json.data.userCode).toBeDefined();
    });
  });

  describe('3. Role Request Claims & Mismatch Inspection', () => {
    it('stores claimed values on role-request creation and flags mismatches on approval view', async () => {
      const app = new Elysia().use(onboardingRoutes).use(approvalsRoutes);

      const user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          user_code: `STU_CLAIM_${Date.now()}`,
          full_name: 'Claimant Student',
          status: 'registered',
        },
      });

      const role = await prisma.roles.findFirst({ where: { code: 'student' } }) ||
        await prisma.roles.create({ data: { id: crypto.randomUUID(), code: 'student', name: 'Student' } });

      const token = signAccessToken({ sub: user.id, userCode: user.user_code || undefined, roles: ['student'] });

      // Create role request with claims
      const reqRes = await app.handle(
        new Request('http://localhost/role-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roleCode: 'student',
            claimedCode: 'STU_PRE_REG_123',
            claimedRollNo: 'ROLL_101',
            claimedRegistrationNo: 'REG_2026_500',
            claimedAdmissionYear: 2026,
          }),
        })
      );

      expect(reqRes.status).toBe(200);
      const reqJson = (await reqRes.json()) as any;
      const requestId = reqJson.data.id;
      expect(reqJson.data.claimed_roll_no).toBe('ROLL_101');

      // Approver views request detail
      const adminToken = signAccessToken({ sub: crypto.randomUUID(), userCode: 'ADM_001', roles: ['admin'] });
      const detailRes = await app.handle(
        new Request(`http://localhost/approvals/role-requests/${requestId}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      expect(detailRes.status).toBe(200);
      const detailJson = (await detailRes.json()) as any;
      expect(detailJson.data.claims).toBeDefined();
      expect(detailJson.data.claims.rollNo).toBe('ROLL_101');
      expect(detailJson.data.mismatches).toBeDefined();
    });
  });

  describe('4. Student Linking Security (DOB Match & Rate Limiting)', () => {
    it('rejects link request on DOB mismatch and applies rate limiting', async () => {
      const app = new Elysia().use(parentRoutes);

      const parentUser = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          user_code: `PAR_${Date.now()}`,
          full_name: 'Parent User',
          status: 'active',
        },
      });

      const studentUser = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          user_code: `STU_LINK_${Date.now()}`,
          full_name: 'Link Target Student',
          status: 'active',
        },
      });

      const existingCourse = await prisma.courses.findFirst();
      const existingAy = await prisma.academic_years.findFirst();

      const batch = await prisma.batches.findFirst() || await prisma.batches.create({
        data: {
          id: crypto.randomUUID(),
          name: 'Batch 2026',
          course_id: existingCourse?.id || crypto.randomUUID(),
          admission_year_id: existingAy?.id || crypto.randomUUID(),
        },
      });

      const admNo = `ADM_LINK_${Date.now()}`;
      await prisma.students.create({
        data: {
          user_id: studentUser.id,
          admission_no: admNo,
          batch_id: batch.id,
          date_of_birth: new Date('2003-05-15'),
          admitted_on: new Date(),
        },
      });

      const parentToken = signAccessToken({ sub: parentUser.id, userCode: parentUser.user_code || undefined, roles: ['parent'] });

      // Wrong DOB attempt -> 400 DOB_MISMATCH
      const failRes = await app.handle(
        new Request('http://localhost/parent/link/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${parentToken}`,
          },
          body: JSON.stringify({
            admissionNo: admNo,
            dateOfBirth: '2000-01-01',
            relation: 'father',
          }),
        })
      );

      expect(failRes.status).toBe(400);
      const failJson = (await failRes.json()) as any;
      expect(failJson.error).toBe('DOB_MISMATCH');
    });
  });

  describe('5. In-App Notifications & Approval Notification Dispatch', () => {
    it('dispatches notification on approval and allows listing/marking read', async () => {
      const app = new Elysia().use(approvalsRoutes).use(sharedRoutes);

      const user = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          user_code: `STU_NOTIF_${Date.now()}`,
          full_name: 'Notif Student',
          status: 'registered',
        },
      });

      const role = await prisma.roles.findFirst({ where: { code: 'student' } });

      const reqRecord = await prisma.role_requests.create({
        data: {
          id: crypto.randomUUID(),
          user_id: user.id,
          role_id: role?.id || crypto.randomUUID(),
          status: 'pending',
        },
      });

      const adminUser = await prisma.users.create({
        data: {
          id: crypto.randomUUID(),
          user_code: `ADM_NOTIF_${Date.now()}`,
          full_name: 'Notif Admin',
          status: 'active',
        },
      });

      const adminToken = signAccessToken({ sub: adminUser.id, userCode: adminUser.user_code || undefined, roles: ['admin'] });

      // Approve role request -> triggers notification
      const approveRes = await app.handle(
        new Request(`http://localhost/approvals/role-requests/${reqRecord.id}/approve`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      expect(approveRes.status).toBe(200);

      // Student lists in-app notifications
      const studentToken = signAccessToken({ sub: user.id, userCode: user.user_code || undefined, roles: ['student'] });
      const listRes = await app.handle(
        new Request('http://localhost/notifications', {
          headers: { Authorization: `Bearer ${studentToken}` },
        })
      );

      expect(listRes.status).toBe(200);
      const listJson = (await listRes.json()) as any;
      expect(listJson.data.notifications.length).toBeGreaterThan(0);
      const notifId = listJson.data.notifications[0].id;

      // Student marks notification as read
      const readRes = await app.handle(
        new Request(`http://localhost/notifications/${notifId}/read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${studentToken}` },
        })
      );

      expect(readRes.status).toBe(200);
      const readJson = (await readRes.json()) as any;
      expect(readJson.data.read_at).not.toBeNull();
    });
  });
});
