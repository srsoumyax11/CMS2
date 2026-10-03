import { describe, expect, it, beforeAll } from 'bun:test';
import { studentService } from '../../src/services/student.service';
import { wardenService } from '../../src/services/warden.service';
import { facultyService } from '../../src/services/faculty.service';
import { adminService } from '../../src/services/admin.service';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';

describe('Phase 16 Unit Tests: Domain Services', () => {
  let testUserId: string;
  let testDepartmentId: string;
  let testCourseId: string;
  let testBatchId: string;

  beforeAll(async () => {
    const pwd = await hashPassword('ServicePass123!');

    // Create academic year
    const ay = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_SERVICE_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
        is_current: false,
      },
    });

    // Create user
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `SRV_USER_${Date.now()}`,
        email: `srv_user_${Date.now()}@campus.edu`,
        full_name: 'Service Unit Tester',
        password_hash: pwd,
        status: 'active',
      },
    });
    testUserId = user.id;

    // Create department
    const dept = await adminService.createDepartment('Department of Robotics', `ROB_${Date.now()}`);
    testDepartmentId = dept.id;

    // Create course
    const course = await adminService.createCourse('B.Tech Robotics', `COURSE_ROB_${Date.now()}`, testDepartmentId);
    testCourseId = course.id;

    // Create batch
    const batch = await adminService.createBatch('Robotics Batch 2026', testCourseId, ay.id);
    testBatchId = batch.id;

    // Create student
    await prisma.students.create({
      data: {
        user_id: testUserId,
        admission_no: `ADM_SRV_${Date.now()}`,
        batch_id: testBatchId,
        date_of_birth: new Date('2003-01-01'),
        admitted_on: new Date('2022-08-01'),
        status: 'active',
      },
    });
  });

  describe('StudentService (services/student.service.ts)', () => {
    it('should retrieve student profile', async () => {
      const profile = await studentService.getStudentProfile(testUserId);
      expect(profile).toBeDefined();
      expect(profile.fullName).toBe('Service Unit Tester');
      expect(profile.course).toBe('B.Tech Robotics');
    });

    it('should update student contact preferences', async () => {
      const newPhone = `+19${Date.now().toString().slice(-9)}`;
      const updated = await studentService.updateStudentProfile(testUserId, {
        phone: newPhone,
        preferredLanguage: 'en',
      });
      expect(updated.phone).toBe(newPhone);
      expect(updated.preferredLanguage).toBe('en');
    });

    it('should create outpass request', async () => {
      const outpass = await studentService.createOutpass(testUserId, {
        reason: 'Family Event',
        destination: 'Home',
        outAt: new Date(Date.now() + 3600000).toISOString(),
        expectedReturnAt: new Date(Date.now() + 86400000).toISOString(),
      });
      expect(outpass.id).toBeDefined();
      expect(outpass.destination).toBe('Home');
      expect(outpass.status).toBe('pending');
    });

    it('should trigger emergency SOS incident', async () => {
      const sos = await studentService.triggerSos(testUserId, {
        latitude: 12.9,
        longitude: 77.5,
        source: 'button',
      });
      expect(sos.id).toBeDefined();
      expect(sos.status).toBe('open');
    });
  });

  describe('WardenService (services/warden.service.ts)', () => {
    it('should list pending outpasses', async () => {
      const pending = await wardenService.listPendingOutpasses();
      expect(Array.isArray(pending)).toBe(true);
      expect(pending.length).toBeGreaterThan(0);
    });

    it('should list active SOS incidents', async () => {
      const incidents = await wardenService.listActiveSosIncidents();
      expect(Array.isArray(incidents)).toBe(true);
      expect(incidents.length).toBeGreaterThan(0);
    });
  });

  describe('AdminService (services/admin.service.ts)', () => {
    it('should freeze user account', async () => {
      const frozen = await adminService.freezeUserAccount(testUserId, testUserId, 'Violation of campus rules');
      expect(frozen.status).toBe('frozen');
    });

    it('should broadcast emergency alert notice', async () => {
      const notice = await adminService.broadcastEmergencyAlert(testUserId, 'Severe Weather Warning', 'Stay indoors', 'critical');
      expect(notice.id).toBeDefined();
      expect(notice.title).toContain('EMERGENCY BROADCAST');
      expect(notice.is_emergency).toBe(true);
    });
  });
});
