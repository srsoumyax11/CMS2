import { describe, expect, it, beforeAll } from 'bun:test';
import { adminRoutes } from '../src/routes/admin';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';

const app = new Elysia().use(adminRoutes);

describe('Admin API Routes (/api/v1/admin)', () => {
  let adminUserId: string;
  let adminToken: string;
  let targetUserId: string;
  let acadYearId: string;
  let createdDeptId: string;
  let createdCourseId: string;
  let testNameCorrId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('AdminPass123!');

    // 1. Create Admin User
    const adminUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `ADM_${Date.now()}`,
        email: `admin_${Date.now()}@campus.edu`,
        full_name: 'Super Admin',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    adminUserId = adminUser.id;
    adminToken = `mock_jwt_token_${adminUserId}`;

    // 2. Create Target User (to freeze)
    const targetUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `TARGET_${Date.now()}`,
        email: `target_${Date.now()}@campus.edu`,
        full_name: 'Target User',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    targetUserId = targetUser.id;

    // 3. Create Academic Year
    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_ADM_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
        is_current: false,
      },
    });
    acadYearId = acadYear.id;

    // 4. Create Student User & Name Correction Request
    const studentUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `STU_ADM_${Date.now()}`,
        email: `student_adm_${Date.now()}@campus.edu`,
        full_name: 'Jonathon Doe',
        password_hash: passwordHash,
        status: 'active',
      },
    });

    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_ADM_${Date.now()}`,
        name: 'Admin Pre-test Dept',
      },
    });

    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: dept.id,
        code: `CSE_ADM_${Date.now()}`,
        name: 'Admin Pre-test Course',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });

    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: course.id,
        admission_year_id: acadYearId,
        name: 'Admin Pre-test Batch',
      },
    });

    await prisma.students.create({
      data: {
        user_id: studentUser.id,
        admission_no: `ADM_CORR_${Date.now()}`,
        batch_id: batch.id,
        date_of_birth: new Date('2003-01-01'),
        admitted_on: new Date('2022-08-01'),
        status: 'active',
      },
    });

    const nameReq = await prisma.name_correction_requests.create({
      data: {
        id: crypto.randomUUID(),
        student_id: studentUser.id,
        old_name: 'Jonathon Doe',
        new_name: 'Jonathan Doe',
        status: 'pending',
      },
    });
    testNameCorrId = nameReq.id;
  });

  describe('User Management & Governance', () => {
    it('should list users with pagination', async () => {
      const response = await app.handle(
        new Request('http://localhost/admin/users?limit=10&offset=0', {
          method: 'GET',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should freeze/suspend a user account', async () => {
      const response = await app.handle(
        new Request(`http://localhost/admin/users/${targetUserId}/freeze`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: 'Security compliance check',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('frozen');
    });
  });

  describe('Academic Hierarchy Management', () => {
    it('should create a department', async () => {
      const deptCode = `MECH_${Date.now()}`;
      const response = await app.handle(
        new Request('http://localhost/admin/departments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: deptCode,
            name: 'Mechanical Engineering',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.code).toBe(deptCode);
      createdDeptId = json.data.id;
    });

    it('should list departments', async () => {
      const response = await app.handle(
        new Request('http://localhost/admin/departments', {
          method: 'GET',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should create a degree course', async () => {
      const courseCode = `BMECH_${Date.now()}`;
      const response = await app.handle(
        new Request('http://localhost/admin/courses', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            departmentId: createdDeptId,
            code: courseCode,
            name: 'B.Tech Mechanical Engineering',
            degreeLevel: 'ug',
            durationSemesters: 8,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.code).toBe(courseCode);
      createdCourseId = json.data.id;
    });

    it('should list degree courses', async () => {
      const response = await app.handle(
        new Request('http://localhost/admin/courses', {
          method: 'GET',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should create an academic batch', async () => {
      const batchName = `Batch_${Date.now()}`;
      const response = await app.handle(
        new Request('http://localhost/admin/batches', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: createdCourseId,
            admissionYearId: acadYearId,
            name: batchName,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.name).toBe(batchName);
    });

    it('should list academic batches', async () => {
      const response = await app.handle(
        new Request('http://localhost/admin/batches', {
          method: 'GET',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });
  });

  describe('Name Corrections & System Operations', () => {
    it('should list name correction requests', async () => {
      const response = await app.handle(
        new Request('http://localhost/admin/name-corrections', {
          method: 'GET',
          headers: { Authorization: `Bearer ${adminToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should approve a student name correction request', async () => {
      const response = await app.handle(
        new Request(`http://localhost/admin/name-corrections/${testNameCorrId}/decide`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'approved',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('approved');
    });

    it('should trigger system emergency broadcast', async () => {
      const response = await app.handle(
        new Request('http://localhost/admin/broadcast/emergency', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Campus Alert',
            message: 'Severe weather alert. All evening classes postponed.',
            severity: 'critical',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.deliveredChannels).toContain('push');
    });
  });
});
