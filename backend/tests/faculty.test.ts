import { describe, expect, it, beforeAll } from 'bun:test';
import { facultyRoutes } from '../src/routes/faculty';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';

const app = new Elysia().use(facultyRoutes);

describe('Faculty API Routes (/api/v1/faculty)', () => {
  let facultyUserId: string;
  let facultyToken: string;
  let studentUserId: string;
  let offeringId: string;
  let sessionId: string;
  let periodId: string;
  let testAssignmentId: string;
  let testSubmissionId: string;
  let testDisputeId: string;

  beforeAll(async () => {
    const passwordHash = await hashPassword('FacultyPass123!');

    // 1. Create Academic Year, Term, Department, Course, Section
    const acadYear = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_FAC_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
        is_current: false,
      },
    });

    const term = await prisma.terms.create({
      data: {
        id: crypto.randomUUID(),
        academic_year_id: acadYear.id,
        name: `Term_FAC_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2025-12-31'),
      },
    });

    const dept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEPT_FAC_${Date.now()}`,
        name: 'Faculty Test Department',
      },
    });

    const course = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        department_id: dept.id,
        code: `CSE_FAC_${Date.now()}`,
        name: 'Faculty Test Course',
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });

    const batch = await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        course_id: course.id,
        admission_year_id: acadYear.id,
        name: 'Faculty Test Batch',
      },
    });

    const section = await prisma.sections.create({
      data: {
        id: crypto.randomUUID(),
        batch_id: batch.id,
        name: 'Section A',
      },
    });

    const subject = await prisma.subjects.create({
      data: {
        id: crypto.randomUUID(),
        code: `SUB_FAC_${Date.now()}`,
        name: 'Algorithms & Data Structures',
        credits: 4.0,
        subject_type: 'theory',
      },
    });

    const period = await prisma.periods.create({
      data: {
        id: crypto.randomUUID(),
        period_no: Math.floor(Math.random() * 30000) + 1,
        start_time: new Date('1970-01-01T09:00:00Z'),
        end_time: new Date('1970-01-01T10:00:00Z'),
      },
    });
    periodId = period.id;

    // 2. Create Faculty User & Staff record
    const facultyUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `FAC_${Date.now()}`,
        email: `faculty_${Date.now()}@campus.edu`,
        full_name: 'Prof. Alan Turing',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    facultyUserId = facultyUser.id;
    facultyToken = `mock_jwt_token_${facultyUserId}`;

    await prisma.staff.create({
      data: {
        user_id: facultyUserId,
        employee_code: `EMP_FAC_${Date.now()}`,
        department_id: dept.id,
        designation: 'Professor',
        joined_on: new Date('2020-01-01'),
      },
    });

    // 3. Create Student User & Record
    const studentUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `STU_FAC_${Date.now()}`,
        email: `student_fac_${Date.now()}@campus.edu`,
        full_name: 'Student Ada',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    studentUserId = studentUser.id;

    await prisma.students.create({
      data: {
        user_id: studentUserId,
        admission_no: `ADM_FAC_${Date.now()}`,
        batch_id: batch.id,
        section_id: section.id,
        date_of_birth: new Date('2003-01-01'),
        admitted_on: new Date('2022-08-01'),
        status: 'active',
      },
    });

    // 4. Create Subject Offering & Class Session
    const offering = await prisma.subject_offerings.create({
      data: {
        id: crypto.randomUUID(),
        subject_id: subject.id,
        term_id: term.id,
        section_id: section.id,
        faculty_id: facultyUserId,
      },
    });
    offeringId = offering.id;

    const session = await prisma.class_sessions.create({
      data: {
        id: crypto.randomUUID(),
        offering_id: offeringId,
        session_date: new Date(),
        period_id: periodId,
        status: 'scheduled',
      },
    });
    sessionId = session.id;

    // 5. Create attendance record & dispute
    await prisma.attendance_records.create({
      data: {
        session_id: sessionId,
        student_id: studentUserId,
        status: 'absent',
        method: 'manual',
      },
    });

    const dispute = await prisma.attendance_disputes.create({
      data: {
        id: crypto.randomUUID(),
        session_id: sessionId,
        student_id: studentUserId,
        reason: 'Was present in medical clinic during session',
        status: 'pending',
      },
    });
    testDisputeId = dispute.id;
  });

  describe('Attendance Management', () => {
    it('should start attendance session and generate 6-digit code', async () => {
      const response = await app.handle(
        new Request(`http://localhost/faculty/classes/${sessionId}/attendance/session`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${facultyToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.codeHint).toBe('654321');
    });

    it('should manually update student attendance records', async () => {
      const response = await app.handle(
        new Request(`http://localhost/faculty/classes/${sessionId}/attendance/manual`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${facultyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [
              {
                studentId: studentUserId,
                status: 'present',
              },
            ],
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.count).toBe(1);
    });

    it('should list pending attendance disputes', async () => {
      const response = await app.handle(
        new Request('http://localhost/faculty/attendance/disputes', {
          method: 'GET',
          headers: { Authorization: `Bearer ${facultyToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should approve an attendance dispute', async () => {
      const response = await app.handle(
        new Request(`http://localhost/faculty/attendance/disputes/${testDisputeId}/decide`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${facultyToken}`,
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
  });

  describe('Assignments & Submissions', () => {
    it('should create a course assignment', async () => {
      const response = await app.handle(
        new Request('http://localhost/faculty/assignments', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${facultyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            offeringId: offeringId,
            title: 'Data Structures Problem Set 1',
            description: 'Implement AVL Tree in C++',
            dueAt: new Date(Date.now() + 86400000 * 7).toISOString(),
            maxMarks: 100,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.title).toBe('Data Structures Problem Set 1');
      testAssignmentId = json.data.id;
    });

    it('should list submissions for an assignment', async () => {
      // Create mock file & submission for testing
      const file = await prisma.files.create({
        data: {
          id: crypto.randomUUID(),
          storage_key: `assignments/${Date.now()}.pdf`,
          original_name: 'ps1.pdf',
          mime_type: 'application/pdf',
          size_bytes: BigInt(1024),
          uploaded_by: studentUserId,
        },
      });

      const submission = await prisma.assignment_submissions.create({
        data: {
          id: crypto.randomUUID(),
          assignment_id: testAssignmentId,
          student_id: studentUserId,
          file_id: file.id,
        },
      });
      testSubmissionId = submission.id;

      const response = await app.handle(
        new Request(`http://localhost/faculty/assignments/${testAssignmentId}/submissions`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${facultyToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json()as any;
      expect(json.success).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it('should grade a student submission', async () => {
      const response = await app.handle(
        new Request(`http://localhost/faculty/submissions/${testSubmissionId}/grade`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${facultyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            marks: 95,
            feedback: 'Excellent tree balancing implementation',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(Number(json.data.marks)).toBe(95);
    });
  });

  describe('Timetable & Mentees', () => {
    it('should fetch faculty teaching timetable', async () => {
      const response = await app.handle(
        new Request('http://localhost/faculty/timetable', {
          method: 'GET',
          headers: { Authorization: `Bearer ${facultyToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('should fetch assigned mentees list', async () => {
      const response = await app.handle(
        new Request('http://localhost/faculty/mentees', {
          method: 'GET',
          headers: { Authorization: `Bearer ${facultyToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });
  });
});
