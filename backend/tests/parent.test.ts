import { describe, expect, it, beforeAll } from 'bun:test';
import { parentRoutes } from '../src/routes/parent';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';

const app = new Elysia().use(parentRoutes);

describe('Parent API Routes (/api/v1/parent)', () => {
  let parentUserId: string;
  let parentToken: string;
  let studentUserId: string;
  let studentAdmissionNo: string;
  let studentDob: Date;
  let testOutpassId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('ParentPass123!');

    // 1. Setup Academic Year, Department, Course, Batch, Section
    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_PAR_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
        is_current: false,
      },
    });

    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_PAR_${Date.now()}`,
        name: 'Parent Test Department',
      },
    });

    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: dept.id,
        code: `CSE_PAR_${Date.now()}`,
        name: 'Parent Test Course',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });

    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: course.id,
        admission_year_id: acadYear.id,
        name: 'Parent Test Batch',
      },
    });

    // 2. Create Parent User
    const parentUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `PAR_${Date.now()}`,
        email: `parent_${Date.now()}@campus.edu`,
        full_name: 'John Doe Sr.',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    parentUserId = parentUser.id;
    parentToken = `mock_jwt_token_${parentUserId}`;

    await prisma.guardians.create({
      data: {
        user_id: parentUserId,
      },
    });

    // 3. Create Student User & Record
    studentDob = new Date('2004-05-15');
    studentAdmissionNo = `ADM_PAR_${Date.now()}`;

    const studentUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `STU_PAR_${Date.now()}`,
        email: `student_par_${Date.now()}@campus.edu`,
        full_name: 'John Doe Jr.',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    studentUserId = studentUser.id;

    await prisma.students.create({
      data: {
        user_id: studentUserId,
        admission_no: studentAdmissionNo,
        batch_id: batch.id,
        date_of_birth: studentDob,
        admitted_on: new Date('2022-08-01'),
        status: 'active',
      },
    });

    // 4. Create Student Guardian Link
    await prisma.student_guardians.create({
      data: {
        student_id: studentUserId,
        guardian_id: parentUserId,
        relation: 'father',
        is_primary: true,
      },
    });

    // 5. Create test outpass request
    const outpass = await prisma.outpass_requests.create({
      data: {
        id: crypto.randomUUID(),
        student_id: studentUserId,
        destination: 'Home City',
        reason: 'Family Gathering',
        out_at: new Date(Date.now() + 3600000),
        expected_return_at: new Date(Date.now() + 86400000),
        status: 'pending',
      },
    });
    testOutpassId = outpass.id;

    // 6. Create fee head & invoice for student
    const feeHead = await prisma.fee_heads.create({
      data: {
        id: crypto.randomUUID(),
        name: `Tuition Fee ${Date.now()}`,
        code: `FEE_PAR_${Date.now()}`,
      },
    });

    const invoice = await prisma.invoices.create({
      data: {
        id: crypto.randomUUID(),
        student_id: studentUserId,
        academic_year_id: acadYear.id,
        invoice_no: `INV_PAR_${Date.now()}`,
        due_date: new Date('2026-12-31'),
        status: 'open',
      },
    });

    await prisma.invoice_items.create({
      data: {
        id: crypto.randomUUID(),
        invoice_id: invoice.id,
        fee_head_id: feeHead.id,
        kind: 'charge',
        amount: 50000,
      },
    });
  });

  describe('Guardian Link Requests', () => {
    it('should reject link request when student is not found', async () => {
      const response = await app.handle(
        new Request('http://localhost/parent/link/request', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admissionNo: 'NON_EXISTENT_ADM_99999',
            dateOfBirth: '2004-05-15',
            relation: 'father',
          }),
        })
      );

      expect(response.status).toBe(404);
      const json = (await response.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('STUDENT_NOT_FOUND');
    });

    it('should reject link request when DOB does not match', async () => {
      const response = await app.handle(
        new Request('http://localhost/parent/link/request', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admissionNo: studentAdmissionNo,
            dateOfBirth: '2000-01-01',
            relation: 'father',
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = (await response.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('DOB_MISMATCH');
    });

    it('should successfully create link request with correct details', async () => {
      const response = await app.handle(
        new Request('http://localhost/parent/link/request', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            admissionNo: studentAdmissionNo,
            dateOfBirth: '2004-05-15',
            relation: 'father',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('pending_student');
    });
  });

  describe('Children Information & Outpasses', () => {
    it('should fetch linked children for parent', async () => {
      const response = await app.handle(
        new Request('http://localhost/parent/children', {
          method: 'GET',
          headers: { Authorization: `Bearer ${parentToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      expect(json.data[0].admissionNo).toBe(studentAdmissionNo);
    });

    it('should fetch outpass list for child', async () => {
      const response = await app.handle(
        new Request(`http://localhost/parent/children/${studentUserId}/outpasses`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${parentToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should approve outpass request as parent', async () => {
      const response = await app.handle(
        new Request(`http://localhost/parent/outpasses/${testOutpassId}/approve`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: 'Approved for family event',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.decision_note).toContain('Parent Approved');
    });
  });

  describe('Fees & Payments', () => {
    it('should fetch fee invoices for linked child', async () => {
      const response = await app.handle(
        new Request(`http://localhost/parent/children/${studentUserId}/fees`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${parentToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should initiate fee payment for child', async () => {
      const response = await app.handle(
        new Request('http://localhost/parent/payments/initiate', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${parentToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentId: studentUserId,
            amount: 50000,
            method: 'upi',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = (await response.json()) as any;
      expect(json.success).toBe(true);
      expect(Number(json.data.amount)).toBe(50000);
      expect(json.data.gatewayTxnUrl).toBeDefined();
    });
  });
});
