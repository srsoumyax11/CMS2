import { describe, expect, it, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { campusOpsRoutes } from '../../src/routes/campus_ops';
import { adminRoutes } from '../../src/routes/admin';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';
import { signAccessToken } from '../../src/utils/jwt';

const app = new Elysia().group('/api/v1', (app) => app.use(adminRoutes).use(campusOpsRoutes));

describe('Integration Test Suite: Campus Operations & Academic Admin', () => {
  let authToken: string;
  let userId: string;
  let academicYearId: string;
  let termId: string;
  let deptId: string;
  let courseId: string;
  let batchId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('CampusOpsPass123!');
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `INT_OPS_${Date.now()}`,
        email: `int_ops_${Date.now()}@example.com`,
        full_name: 'Integration Campus Ops User',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    userId = user.id;
    authToken = `Bearer ${signAccessToken({ sub: user.id })}`;
  });

  describe('Academic Admin Flow', () => {
    it('POST /api/v1/admin/academic-years - should create new academic year', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/academic-years', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            label: `AY ${Date.now()}-${Date.now() + 1}`,
            startDate: '2026-08-01',
            endDate: '2027-05-31',
            isCurrent: false,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBeDefined();
      academicYearId = json.data.id;
    });

    it('GET /api/v1/admin/academic-years - should list academic years', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/academic-years', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('POST /api/v1/admin/terms - should create academic term', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/terms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            academicYearId: academicYearId,
            code: `TERM_FALL_${Date.now()}`,
            name: 'Fall Term Integration',
            startDate: '2026-08-01',
            endDate: '2026-12-20',
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBeDefined();
      termId = json.data.id;
    });

    it('GET /api/v1/admin/terms - should list academic terms', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/terms', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('POST /api/v1/admin/departments - should create a department', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/departments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            code: `DEPT_INT_${Date.now()}`,
            name: 'Integration Test Department',
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      deptId = json.data.id;
    });

    it('POST /api/v1/admin/courses - should create a course', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            departmentId: deptId,
            code: `CSE_INT_${Date.now()}`,
            name: 'B.Tech Integration Science',
            degreeLevel: 'ug',
            durationSemesters: 8,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      courseId = json.data.id;
    });

    it('POST /api/v1/admin/batches - should create a student batch', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/batches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            courseId: courseId,
            admissionYearId: academicYearId,
            name: `Batch Int ${Date.now()}`,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
      batchId = json.data.id;
    });
  });

  describe('Location & Infrastructure Operations', () => {
    it('GET /api/v1/admin/locations - should fetch location hierarchy', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/locations', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/admin/locations - should create location node', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/admin/locations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            name: `Academic Block INT_${Date.now()}`,
            kind: 'building',
            code: `BLK_INT_${Date.now()}`,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe('Library Operations', () => {
    it('GET /api/v1/library/books - should list library catalogue books', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/library/books', {
          headers: { Authorization: authToken },
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });

    it('POST /api/v1/library/books - should add book to library catalog', async () => {
      const res = await app.handle(
        new Request('http://localhost/api/v1/library/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authToken,
          },
          body: JSON.stringify({
            title: `Clean Code Architecture ${Date.now()}`,
            isbn: `978-013235${Math.floor(Math.random() * 8999 + 1000)}`,
          }),
        })
      );
      expect(res.status).toBe(200);
      const json: any = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
