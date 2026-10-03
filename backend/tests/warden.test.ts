import { describe, expect, it, beforeAll } from 'bun:test';
import { wardenRoutes } from '../src/routes/warden';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';
import { signAccessToken } from '../src/utils/jwt';

const app = new Elysia().use(wardenRoutes);

describe('Warden API Routes (/api/v1/warden)', () => {
  let wardenUserId: string;
  let wardenToken: string;
  let studentUserId: string;
  let hostelId: string;
  let bedId: string;
  let testOutpassId: string;
  let testSosId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('WardenPass123!');

    // 1. Create Warden User
    const warden = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `WRD_${Date.now()}`,
        email: `warden_${Date.now()}@campus.edu`,
        full_name: 'Warden John Doe',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    wardenUserId = warden.id;
    wardenToken = signAccessToken({ sub: wardenUserId });

    // 2. Create Student User & Record
    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_WRD_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
        is_current: false,
      },
    });

    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_WRD_${Date.now()}`,
        name: 'Warden Test Department',
      },
    });

    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: dept.id,
        code: `CSE_WRD_${Date.now()}`,
        name: 'Warden Test Course',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });

    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: course.id,
        admission_year_id: acadYear.id,
        name: 'Warden Test Batch',
      },
    });

    const studentUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `STU_WRD_${Date.now()}`,
        email: `student_wrd_${Date.now()}@campus.edu`,
        full_name: 'Student Mark',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    studentUserId = studentUser.id;

    await prisma.students.create({
      data: {
        user_id: studentUserId,
        admission_no: `ADM_WRD_${Date.now()}`,
        batch_id: batch.id,
        date_of_birth: new Date('2003-01-01'),
        admitted_on: new Date('2022-08-01'),
        status: 'active',
      },
    });

    // 3. Create Hostel, Room & Bed
    const hostel = await prisma.hostels.create({
      data: {
        id: crypto.randomUUID(),
        name: `Hostel Block A ${Date.now()}`,
      },
    });
    hostelId = hostel.id;

    const room = await prisma.hostel_rooms.create({
      data: {
        id: crypto.randomUUID(),
        hostel_id: hostelId,
        floor_no: 1,
        room_no: `101_${Date.now().toString().slice(-4)}`,
      },
    });

    const bed = await prisma.beds.create({
      data: {
        id: crypto.randomUUID(),
        hostel_room_id: room.id,
        bed_no: 1,
        is_usable: true,
      },
    });
    bedId = bed.id;

    // 4. Create sample pending Outpass & SOS Incident
    const outpass = await prisma.outpass_requests.create({
      data: {
        id: crypto.randomUUID(),
        student_id: studentUserId,
        reason: 'Family event',
        destination: 'Home',
        out_at: new Date(),
        expected_return_at: new Date(Date.now() + 86400000),
        status: 'pending',
      },
    });
    testOutpassId = outpass.id;

    const sos = await prisma.sos_incidents.create({
      data: {
        id: crypto.randomUUID(),
        student_id: studentUserId,
        triggered_by: studentUserId,
        source: 'button',
        idempotency_key: `sos_wrd_${Date.now()}`,
        status: 'open',
      },
    });
    testSosId = sos.id;
  });

  describe('Outpass Approvals Inbox', () => {
    it('should list outpasses for warden', async () => {
      const response = await app.handle(
        new Request('http://localhost/warden/outpasses?status=pending', {
          method: 'GET',
          headers: { Authorization: `Bearer ${wardenToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('should list overdue outpasses', async () => {
      const response = await app.handle(
        new Request('http://localhost/warden/outpasses/overdue', {
          method: 'GET',
          headers: { Authorization: `Bearer ${wardenToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
    });

    it('should approve an outpass request', async () => {
      const response = await app.handle(
        new Request(`http://localhost/warden/outpasses/${testOutpassId}/approve`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${wardenToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ decisionNote: 'Approved with parent consent' }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('approved');
    });
  });

  describe('SOS Control Room', () => {
    it('should list active SOS incidents', async () => {
      const response = await app.handle(
        new Request('http://localhost/warden/sos/active', {
          method: 'GET',
          headers: { Authorization: `Bearer ${wardenToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should acknowledge active SOS incident', async () => {
      const response = await app.handle(
        new Request(`http://localhost/warden/sos/${testSosId}/acknowledge`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${wardenToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('acknowledged');
    });

    it('should close SOS incident with final report', async () => {
      const response = await app.handle(
        new Request(`http://localhost/warden/sos/${testSosId}/close`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${wardenToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ closureReport: 'Security team verified student safety' }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('closed');
    });
  });

  describe('Hostel Rooms & Bed Allocations', () => {
    it('should list vacant beds', async () => {
      const response = await app.handle(
        new Request('http://localhost/warden/rooms/vacant', {
          method: 'GET',
          headers: { Authorization: `Bearer ${wardenToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('should allocate bed to student', async () => {
      const response = await app.handle(
        new Request('http://localhost/warden/rooms/allocate', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${wardenToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: studentUserId,
            bedId: bedId,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.student_id).toBe(studentUserId);
    });
  });

  describe('Mess & Visitors', () => {
    it('should record mess hygiene check', async () => {
      const response = await app.handle(
        new Request('http://localhost/warden/mess/hygiene-checks', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${wardenToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hostelId: hostelId,
            passed: true,
            notes: 'Kitchen clean and sanitized',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.passed).toBe(true);
    });

    it('should register and approve visitor pass', async () => {
      const response = await app.handle(
        new Request('http://localhost/warden/visitors', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${wardenToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            hostUserId: studentUserId,
            visitorName: 'Parent Robert Johnson',
            visitorPhone: '+19876543210',
            purpose: 'Parent Visit',
            validFrom: new Date().toISOString(),
            validUntil: new Date(Date.now() + 86400000).toISOString(),
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.visitorName).toBe('Parent Robert Johnson');
      expect(json.data.passCode).toBeDefined();
    });
  });
});
