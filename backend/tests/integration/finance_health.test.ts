import { describe, expect, it, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { financeHealthRoutes } from '../../src/routes/finance_health';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';
import { signAccessToken } from '../../src/utils/jwt';

const app = new Elysia().group('/api/v1', (app) => app.use(financeHealthRoutes));

describe('Integration Test Suite: Finance & Health Operations', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('FinanceHealthPass123!');
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `FIN_USER_${Date.now()}`,
        email: `fin_user_${Date.now()}@example.com`,
        full_name: 'Integration Finance User',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    userId = user.id;
    authToken = `Bearer ${signAccessToken({ sub: user.id })}`;

    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_FIN_${Date.now()}`,
        start_date: new Date('2026-08-01'),
        end_date: new Date('2027-05-31'),
      },
    });

    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_FIN_${Date.now()}`,
        name: 'Finance Health Dept',
      },
    });

    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: dept.id,
        code: `CSE_FIN_${Date.now()}`,
        name: 'B.Tech Finance',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });

    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: course.id,
        admission_year_id: acadYear.id,
        name: `Batch_Fin_${Date.now()}`,
      },
    });

    await prisma.students.create({
      data: {
        user_id: user.id,
        batch_id: batch.id,
        admission_no: `ADM_FIN_${Date.now()}`,
        status: 'active',
        date_of_birth: new Date('2003-01-01'),
        admitted_on: new Date('2023-08-01'),
      },
    });
  });

  describe('Financial Operations API', () => {
    it('POST /api/v1/admin/fee-heads - should create fee head', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/fee-heads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            code: `TUITION_${Date.now()}`,
            name: 'Tuition Fee Integration',
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBeDefined();
    });

    it('GET /api/v1/admin/fee-heads - should list fee heads', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/fee-heads', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('GET /api/v1/admin/waiver-requests - should list fee waiver requests', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/waiver-requests', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/admin/fines/run - should trigger scheduled fine assessment run', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/fines/run', {
          method: 'POST',
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.finesAppliedCount).toBeDefined();
    });
  });

  describe('Hostel Mess Catalog', () => {
    it('GET /api/v1/admin/dishes - should list mess dish catalog', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/dishes', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('POST /api/v1/admin/dishes - should add dish to mess catalog', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/dishes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            name: `Paneer Butter Masala_${Date.now()}`,
            category: 'veg',
            calories: 350,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe('Campus Health & Medical Records', () => {
    it('GET /api/v1/medical/visits - should fetch student medical history', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/medical/visits', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/medical/visits - should record nurse clinic visit', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/medical/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            userId: userId,
            diagnosis: 'Mild Fever & Fatigue',
            prescription: 'Paracetamol 500mg',
            visitKind: 'clinic',
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
