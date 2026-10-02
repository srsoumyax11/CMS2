import { describe, expect, it, beforeAll } from 'bun:test';
import { studentRoutes } from '../src/routes/student';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';

const app = new Elysia().use(studentRoutes);

describe('Student API Routes (/api/v1/student)', () => {
  let studentUserId: string;
  let studentUserCode: string;
  let token: string;
  let createdOutpassId: string;
  let createdSosId: string;

  beforeAll(async () => {
    studentUserCode = `STU_${Date.now()}`;
    const passwordHash = await hashPassword('StudentPass123!');

    // 1. Create Academic Year
    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
        is_current: false,
      },
    });

    // 2. Create Department
    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_${Date.now()}`,
        name: 'Department of Computer Science',
      },
    });

    // 3. Create Course
    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: dept.id,
        code: `CSE_${Date.now()}`,
        name: 'Computer Science & Engineering',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });

    // 4. Create Batch
    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: course.id,
        admission_year_id: acadYear.id,
        name: 'Batch of 2026',
      },
    });

    // 5. Create User
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: studentUserCode,
        email: `student_${Date.now()}@campus.edu`,
        full_name: 'Alex Johnson',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    studentUserId = user.id;
    token = `mock_jwt_token_${studentUserId}`;

    // 6. Create Student record
    await prisma.students.create({
      data: {
        user_id: studentUserId,
        admission_no: `ADM_${Date.now()}`,
        batch_id: batch.id,
        date_of_birth: new Date('2003-05-15'),
        admitted_on: new Date('2022-08-01'),
        status: 'active',
      },
    });
  });

  describe('GET /student/me', () => {
    it('should fetch student profile successfully with valid token', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/me', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.fullName).toBe('Alex Johnson');
      expect(json.data.course).toBe('Computer Science & Engineering');
    });

    it('should reject request without authorization header', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/me', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /student/me', () => {
    it('should update phone and preferred language', async () => {
      const testPhone = `+19${Date.now().toString().slice(-9)}`;
      const response = await app.handle(
        new Request('http://localhost/student/me', {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: testPhone,
            preferredLanguage: 'hi',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.phone).toBe(testPhone);
      expect(json.data.preferredLanguage).toBe('hi');
    });
  });

  describe('POST /student/me/name-correction', () => {
    it('should submit a name correction request', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/me/name-correction', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newName: 'Alexander Johnson',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.new_name).toBe('Alexander Johnson');
      expect(json.data.status).toBe('pending');
    });

    it('should fail validation for too short name', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/me/name-correction', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newName: 'A',
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe('GET /student/me/id-card', () => {
    it('should generate digital ID card and QR payload', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/me/id-card', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.fullName).toBe('Alex Johnson');
      expect(json.data.qrPayload).toBeDefined();
    });
  });

  describe('Outpass Management', () => {
    it('should create a digital outpass request', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/outpasses', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: 'Medical checkup in downtown clinic',
            destination: 'City Hospital',
            outAt: new Date(Date.now() + 3600000).toISOString(),
            expectedReturnAt: new Date(Date.now() + 86400000).toISOString(),
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.destination).toBe('City Hospital');
      expect(json.data.status).toBe('pending');
      createdOutpassId = json.data.id;
    });

    it('should fetch outpass list for student', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/outpasses', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });
  });

  describe('Emergency SOS Management', () => {
    it('should trigger emergency SOS alert', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/sos', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: 12.9716,
            longitude: 77.5946,
            source: 'button',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.incidentId).toBeDefined();
      expect(json.data.status).toBe('open');
      createdSosId = json.data.incidentId;
    });

    it('should cancel active SOS alert', async () => {
      const response = await app.handle(
        new Request(`http://localhost/student/sos/${createdSosId}/cancel`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: 'Accidental button press',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('false_alarm');
    });

    it('should return 404 when cancelling non-existent SOS ID', async () => {
      const nonExistentId = crypto.randomUUID();
      const response = await app.handle(
        new Request(`http://localhost/student/sos/${nonExistentId}/cancel`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: 'Test' }),
        })
      );

      expect(response.status).toBe(404);
      const json = (await response.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('SOS_NOT_FOUND');
    });
  });

  describe('Academic & Campus Info', () => {
    it('should fetch enrolled subjects list', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/subjects', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('should fetch course assignments', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/assignments', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('should fetch campus notice feed', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/notices', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('should fetch student fee invoices', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/fees', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('should fetch student joining checklist', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/me/joining-checklist', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should fetch student admission status', async () => {
      const response = await app.handle(
        new Request('http://localhost/student/admission/status', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.admissionStatus).toBe('active');
    });
  });
});
