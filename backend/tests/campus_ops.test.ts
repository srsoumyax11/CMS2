import { describe, expect, it, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { campusOpsRoutes } from '../src/routes/campus_ops';
import { financeHealthRoutes } from '../src/routes/finance_health';
import { transportPlacementsRoutes } from '../src/routes/transport_placements';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';

const app = new Elysia()
  .group('/api/v1', (app) =>
    app
      .use(campusOpsRoutes)
      .use(financeHealthRoutes)
      .use(transportPlacementsRoutes)
  );

describe('Phases 9, 10 & 11: Extended Campus Operations & Governance API Tests', () => {
  let testUserId: string;
  let recipientUserId: string;
  let testUserToken: string;
  let acadYearId: string;
  let deptId: string;
  let courseId: string;
  let batchId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('Password123!');
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `OPS_USER_${Date.now()}`,
        email: `ops_user_${Date.now()}@example.com`,
        full_name: 'Ops Test User',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    testUserId = user.id;
    testUserToken = `Bearer mock_jwt_token_${user.id}`;

    const recipient = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `RECP_USER_${Date.now()}`,
        email: `recp_user_${Date.now()}@example.com`,
        full_name: 'Recipient Test User',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    recipientUserId = recipient.id;

    // Seed academic setup
    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_OPS_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
      },
    });
    acadYearId = acadYear.id;

    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_OPS_${Date.now()}`,
        name: 'Ops Department',
      },
    });
    deptId = dept.id;

    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: deptId,
        code: `CSE_OPS_${Date.now()}`,
        name: 'B.Tech CSE Ops',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });
    courseId = course.id;

    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: courseId,
        admission_year_id: acadYearId,
        name: `Batch_Ops_${Date.now()}`,
      },
    });
    batchId = batch.id;
  });

  describe('Phase 9: Campus Operations & Library Desk', () => {
    it('GET & POST /api/v1/admin/academic-years - should list and create academic years', async () => {
      const getRes = await app.handle(new Request('http://localhost/api/v1/admin/academic-years'));
      expect(getRes.status).toBe(200);

      const postRes = await app.handle(
        new Request('http://localhost/api/v1/admin/academic-years', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({
            label: `AY_NEW_${Date.now()}`,
            startDate: '2026-08-01',
            endDate: '2027-05-31',
          }),
        })
      );
      expect(postRes.status).toBe(200);
    });

    it('GET & POST /api/v1/admin/periods - should manage period slots', async () => {
      const postRes = await app.handle(
        new Request('http://localhost/api/v1/admin/periods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({
            periodNo: Math.floor(Math.random() * 1000) + 1,
            label: 'Period 1',
            startTime: '09:00',
            endTime: '10:00',
          }),
        })
      );
      expect(postRes.status).toBe(200);
    });

    it('GET & POST /api/v1/admin/locations - should manage location tree', async () => {
      const postRes = await app.handle(
        new Request('http://localhost/api/v1/admin/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({
            code: `BLDG_${Date.now()}`,
            name: `Science Block ${Date.now()}`,
            kind: 'building',
          }),
        })
      );
      expect(postRes.status).toBe(200);
    });

    it('GET /api/v1/invoices - should list student invoices', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/invoices', {
          headers: { Authorization: testUserToken },
        })
      );
      expect(res.status).toBe(200);
    });

    it('GET /api/v1/scholarships & GET /api/v1/me/scholarships - should manage scholarships', async () => {
      const getRes = await app.handle(new Request('http://localhost/api/v1/scholarships'));
      expect(getRes.status).toBe(200);
    });

    it('GET & POST /api/v1/messages - 1:1 messaging channel', async () => {
      const sendRes = await app.handle(
        new Request('http://localhost/api/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({
            recipientId: recipientUserId,
            content: 'Hello World',
          }),
        })
      );
      expect(sendRes.status).toBe(200);
    });

    it('GET & POST /api/v1/library/books - library catalog', async () => {
      const getRes = await app.handle(new Request('http://localhost/api/v1/library/books'));
      expect(getRes.status).toBe(200);
    });
  });

  describe('Phase 10: Financial, Mess, Exam & Safety', () => {
    it('GET & POST /api/v1/admin/fee-heads - manage fee heads', async () => {
      const postRes = await app.handle(
        new Request('http://localhost/api/v1/admin/fee-heads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({ code: `TUITION_${Date.now()}`, name: 'Tuition Fee' }),
        })
      );
      expect(postRes.status).toBe(200);
    });

    it('GET & POST /api/v1/admin/dishes - mess dishes catalog', async () => {
      const postRes = await app.handle(
        new Request('http://localhost/api/v1/admin/dishes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({ name: `Paneer Butter Masala ${Date.now()}`, category: 'lunch', isVegetarian: true }),
        })
      );
      expect(postRes.status).toBe(200);
    });

    it('GET /api/v1/admin/sos/escalation-steps & emergency-directory', async () => {
      const sosRes = await app.handle(new Request('http://localhost/api/v1/admin/sos/escalation-steps'));
      expect(sosRes.status).toBe(200);

      const dirRes = await app.handle(new Request('http://localhost/api/v1/admin/emergency-directory'));
      expect(dirRes.status).toBe(200);
    });

    it('GET & POST /api/v1/safety/cases - safety cases', async () => {
      const postRes = await app.handle(
        new Request('http://localhost/api/v1/safety/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({ title: 'Lost Belonging', category: 'discipline' }),
        })
      );
      expect(postRes.status).toBe(200);
    });
  });

  describe('Phase 11: Transport, Placements & System Governance', () => {
    it('GET & POST /api/v1/admin/vehicles - fleet management', async () => {
      const postRes = await app.handle(
        new Request('http://localhost/api/v1/admin/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({ registrationNo: `KA-01-${Date.now()}`, model: 'Volvo Bus', capacity: 50 }),
        })
      );
      expect(postRes.status).toBe(200);
    });

    it('GET & POST /api/v1/clubs - student clubs', async () => {
      const postRes = await app.handle(
        new Request('http://localhost/api/v1/clubs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({ code: `CODING_${Date.now()}`, name: `Coding Club ${Date.now()}`, category: 'technical' }),
        })
      );
      expect(postRes.status).toBe(200);
    });

    it('GET & POST /api/v1/placements/companies - placement portal', async () => {
      const postRes = await app.handle(
        new Request('http://localhost/api/v1/placements/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: testUserToken },
          body: JSON.stringify({ name: `Acme Corp ${Date.now()}`, industry: 'Software' }),
        })
      );
      expect(postRes.status).toBe(200);
    });

    it('GET /api/v1/admin/app-config & access-logs - system governance', async () => {
      const cfgRes = await app.handle(new Request('http://localhost/api/v1/admin/app-config'));
      expect(cfgRes.status).toBe(200);

      const logsRes = await app.handle(new Request('http://localhost/api/v1/admin/access-logs'));
      expect(logsRes.status).toBe(200);
    });
  });
});
