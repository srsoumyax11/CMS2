import { describe, expect, it, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { onboardingRoutes } from '../src/routes/onboarding';
import { approvalsRoutes, adminGovernanceRoutes } from '../src/routes/approvals';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';

const app = new Elysia()
  .group('/api/v1', (app) =>
    app
      .use(onboardingRoutes)
      .use(approvalsRoutes)
      .use(adminGovernanceRoutes)
  );

describe('Phase 8: Signup, Onboarding & Role Approval Flow API Tests', () => {
  let testUserId: string;
  let testUserToken: string;
  let studentUserId: string;
  let roleId: string;
  let requestId: string;

  beforeAll(async () => {
    // 1. Create a test user
    const passwordHash = await hashPassword('Password123!');
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `P8_USER_${Date.now()}`,
        email: `p8_user_${Date.now()}@example.com`,
        full_name: 'Phase 8 Test User',
        password_hash: passwordHash,
        status: 'registered',
      },
    });
    testUserId = user.id;
    testUserToken = `Bearer mock_jwt_token_${user.id}`;

    // Seed prerequisite Academic Year, Department, Course, Batch
    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_P8_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
      },
    });

    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_P8_${Date.now()}`,
        name: 'Phase 8 Computer Science',
      },
    });

    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: dept.id,
        code: `CSE_P8_${Date.now()}`,
        name: 'B.Tech CSE',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });

    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: course.id,
        admission_year_id: acadYear.id,
        name: `Batch_P8_${Date.now()}`,
      },
    });

    // 2. Create student user for parent link tests
    const studentUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `STU_${Date.now()}`,
        email: `student_p8_${Date.now()}@example.com`,
        full_name: 'Student P8',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    studentUserId = studentUser.id;

    await prisma.students.create({
      data: {
        user_id: studentUser.id,
        batch_id: batch.id,
        admission_no: studentUser.user_code!,
        admitted_on: new Date(),
        date_of_birth: new Date('2004-05-15'),
        status: 'active',
      },
    });

    // 3. Get or create a role
    let role = await prisma.roles.findFirst({ where: { code: 'student' } });
    if (!role) {
      role = await prisma.roles.create({
        data: {
          id: crypto.randomUUID(),
          code: 'student',
          name: 'Student',
        },
      });
    }
    roleId = role.id;

    // Seed role_approval_rules
    await prisma.role_approval_rules.upsert({
      where: { role_id: roleId },
      create: {
        role_id: roleId,
        is_self_requestable: true,
        approval_mode: 'auto',
        needs_evidence: true,
      },
      update: { is_self_requestable: true, approval_mode: 'auto' },
    });
  });

  describe('1. Signup & Onboarding Endpoints', () => {
    it('GET /api/v1/me/onboarding - should return onboarding status', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/me/onboarding', {
          headers: { Authorization: testUserToken },
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('registered');
      expect(json.data.nextStep).toBe('request_role');
    });

    it('GET /api/v1/roles/requestable - should list requestable roles', async () => {
      const res = await app.handle(new Request('http://localhost/api/v1/roles/requestable'));
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('GET /api/v1/lookup/pin-codes/110001 - should return PIN details', async () => {
      const res = await app.handle(new Request('http://localhost/api/v1/lookup/pin-codes/110001'));
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/me/addresses - should add address', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/me/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: testUserToken,
          },
          body: JSON.stringify({
            kind: 'permanent',
            line1: '123 Main Street',
            pinCode: '110001',
          }),
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.line1).toBe('123 Main Street');
    });

    it('GET & POST /api/v1/me/emergency-contacts - should manage emergency contacts', async () => {
      const createRes = await app.handle(
        new Request('http://localhost/api/v1/me/emergency-contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: testUserToken,
          },
          body: JSON.stringify({
            name: 'Jane Doe',
            relation: 'Mother',
            phone: '9876543210',
          }),
        })
      );
      expect(createRes.status).toBe(200);
      const createJson = (await createRes.json()) as any;
      expect(createJson.success).toBe(true);

      const getRes = await app.handle(
        new Request('http://localhost/api/v1/me/emergency-contacts', {
          headers: { Authorization: testUserToken },
        })
      );
      expect(getRes.status).toBe(200);
      const getJson = (await getRes.json()) as any;
      expect(getJson.data.length).toBeGreaterThan(0);
    });
  });

  describe('2. Role Request & Approval Flow', () => {
    it('POST /api/v1/role-requests - should create role request', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/role-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: testUserToken,
          },
          body: JSON.stringify({
            roleCode: 'student',
            claimedCode: `STU_CLAIM_${Date.now()}`,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      requestId = json.data.id;
    });

    it('GET /api/v1/approvals/role-requests - should list role request in queue', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/approvals/role-requests?status=pending', {
          headers: { Authorization: testUserToken },
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.some((r: any) => r.id === requestId)).toBe(true);
    });

    it('POST /api/v1/approvals/role-requests/:id/approve - should approve request & activate account', async () => {
      const res = await app.handle(
        new Request(`http://localhost/api/v1/approvals/role-requests/${requestId}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: testUserToken,
          },
          body: JSON.stringify({}),
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);

      // Verify user is now active
      const user = await prisma.users.findUnique({ where: { id: testUserId } });
      expect(user?.status).toBe('active');
    });

    it('GET /api/v1/approvals/stats - should return queue stats', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/approvals/stats', {
          headers: { Authorization: testUserToken },
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data.approvedCount).toBeGreaterThan(0);
    });
  });

  describe('3. Parent Link & Guardian Consent Flow', () => {
    let linkId: string;
    const studentToken = `Bearer mock_jwt_token_${studentUserId}`;

    it('POST /api/v1/guardian-links - should request parent link', async () => {
      const studentUser = await prisma.users.findUnique({ where: { id: studentUserId } });
      const res = await app.handle(
        new Request('http://localhost/api/v1/guardian-links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: testUserToken,
          },
          body: JSON.stringify({
            studentAdmissionNo: studentUser?.user_code,
            studentDob: '2004-05-15',
            relation: 'father',
          }),
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      linkId = json.data.id;
    });

    it('GET /api/v1/me/guardian-requests - student should see link request', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/me/guardian-requests', {
          headers: { Authorization: `Bearer mock_jwt_token_${studentUserId}` },
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data.some((l: any) => l.id === linkId)).toBe(true);
    });

    it('POST /api/v1/me/guardian-requests/:id/confirm - student confirms link', async () => {
      const res = await app.handle(
        new Request(`http://localhost/api/v1/me/guardian-requests/${linkId}/confirm`, {
          method: 'POST',
          headers: { Authorization: `Bearer mock_jwt_token_${studentUserId}` },
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
    });

    it('GET /api/v1/me/guardians/:id/consents - student views and updates consents', async () => {
      const res = await app.handle(
        new Request(`http://localhost/api/v1/me/guardians/${testUserId}/consents`, {
          headers: { Authorization: `Bearer mock_jwt_token_${studentUserId}` },
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data.length).toBe(4);
    });
  });

  describe('4. Admin Pre-registered Identity Import', () => {
    it('POST /api/v1/admin/identities/import - should import pre-registered identities', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/identities/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: testUserToken,
          },
          body: JSON.stringify({
            identities: [
              {
                userCode: `PRE_STU_${Date.now()}`,
                expectedRoleCode: 'student',
                fullName: 'Pre-registered Student',
                email: 'prereg@college.edu',
              },
            ],
          }),
        })
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.data.count).toBe(1);
    });
  });
});
