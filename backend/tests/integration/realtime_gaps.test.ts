import { describe, expect, it, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { transportPlacementsRoutes } from '../../src/routes/transport_placements';
import { wardenRoutes } from '../../src/routes/warden';
import { financeHealthRoutes } from '../../src/routes/finance_health';
import { studentService } from '../../src/services/student.service';
import { adminService } from '../../src/services/admin.service';
import { realtimePubSub } from '../../src/utils/pubsub';
import { signAccessToken } from '../../src/utils/jwt';
import { prisma } from '../../src/config/prisma';
import { hashPassword } from '../../src/utils/password';

describe('Integration Test Suite: Real-Time WebSockets & Backend Gaps Resolution', () => {
  let testStudentUserId: string;
  let authHeaders: { Authorization: string };

  beforeAll(async () => {
    const pwd = await hashPassword('GapTestPass123!');
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `GAP_USER_${Date.now()}`,
        email: `gap_user_${Date.now()}@campus.edu`,
        full_name: 'Realtime Gap Tester',
        password_hash: pwd,
        status: 'active',
      },
    });
    testStudentUserId = user.id;

    const ay = await prisma.academic_years.create({
      data: {
        id: crypto.randomUUID(),
        label: `AY_GAP_${Date.now()}`,
        start_date: new Date('2025-08-01'),
        end_date: new Date('2026-05-31'),
        is_current: false,
      },
    });

    const dept = await adminService.createDepartment('GAP Department', `DEPT_GAP_${Date.now()}`);
    const course = await adminService.createCourse('GAP Course', `CRS_GAP_${Date.now()}`, dept.id);
    const batch = await adminService.createBatch('GAP Batch 2026', course.id, ay.id);

    await prisma.students.create({
      data: {
        user_id: testStudentUserId,
        admission_no: `ADM_GAP_${Date.now()}`,
        batch_id: batch.id,
        date_of_birth: new Date('2003-05-05'),
        admitted_on: new Date('2023-08-01'),
        status: 'active',
      },
    });

    const token = signAccessToken({ sub: testStudentUserId, roles: ['warden', 'student', 'admin'] });
    authHeaders = { Authorization: `Bearer ${token}` };
  });

  describe('GAP-001: Driver Telemetry & GPS Location Real-Time PubSub', () => {
    it('should broadcast location telemetry updates on POST /driver/vehicles/:id/location', async () => {
      const app = new Elysia().use(transportPlacementsRoutes);
      const vehicleId = crypto.randomUUID();

      let receivedTelemetry: any = null;
      const listener = (data: any) => {
        receivedTelemetry = data;
      };

      realtimePubSub.on(`location:${vehicleId}`, listener);

      const res = await app.handle(
        new Request(`http://localhost/driver/vehicles/${vehicleId}/location`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            latitude: 20.2961,
            longitude: 85.8245,
          }),
        })
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.vehicleId).toBe(vehicleId);
      expect(body.data.latitude).toBe(20.2961);

      expect(receivedTelemetry).toBeDefined();
      expect(receivedTelemetry.vehicleId).toBe(vehicleId);
      expect(receivedTelemetry.latitude).toBe(20.2961);

      realtimePubSub.off(`location:${vehicleId}`, listener);
    });
  });

  describe('GAP-002: Live Emergency SOS Control Room Real-Time Broadcast', () => {
    it('should dispatch sos:alert event to Warden control room channel when SOS is triggered', async () => {
      let receivedSOSEvent: any = null;

      const sosListener = (event: any) => {
        receivedSOSEvent = event;
      };

      realtimePubSub.on('sos:alert', sosListener);

      const incident = await studentService.triggerSos(testStudentUserId, {
        latitude: 20.3011,
        longitude: 85.8199,
        source: 'button',
      });

      expect(incident).toBeDefined();
      expect(incident.student_id).toBe(testStudentUserId);

      expect(receivedSOSEvent).toBeDefined();
      expect(receivedSOSEvent.studentId).toBe(testStudentUserId);
      expect(receivedSOSEvent.status).toBe('active');
      expect(receivedSOSEvent.latitude).toBe(20.3011);

      realtimePubSub.off('sos:alert', sosListener);
    });
  });

  describe('GAP-003: Anonymous Disciplinary & Safety Reporting', () => {
    it('should allow submitting an anonymous report without storing user identity', async () => {
      const app = new Elysia().use(financeHealthRoutes);

      const res = await app.handle(
        new Request('http://localhost/safety/reports/anonymous', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify({
            title: 'Unsafe Hazard Near Library',
            category: 'discipline',
            incidentDetails: 'Broken electrical cable hanging near main staircase entrance.',
            location: 'Main Library Block B',
          }),
        })
      );

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body.success).toBe(true);
      expect(body.data.isAnonymous).toBe(true);
      expect(body.data.caseNo).toContain('ANON-');
      expect(body.data.category).toBe('discipline');
    });
  });
});
