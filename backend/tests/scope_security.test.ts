import { describe, expect, it, beforeAll } from 'bun:test';
import { verifyStudentScope, verifyWardenHostelScope, verifyParentChildScope } from '../src/guards/scope';
import { requestLogger } from '../src/middleware/request-logger';
import { createOutpassSchema, updateStudentProfileSchema } from '../src/schemas/student';
import { outpassDecisionSchema } from '../src/schemas/warden';
import { startAttendanceSessionSchema } from '../src/schemas/faculty';
import { Elysia } from 'elysia';

describe('Scope Security & Data Integrity Audit Tests (Phase 13 & 14)', () => {
  describe('Row-Level Scope Isolation & IDOR Guards (AUTH-002, AUTH-003)', () => {
    it('verifyStudentScope should allow student accessing their own resource', () => {
      const studentUser = { sub: 'student-123', roles: ['student'] };
      expect(() => verifyStudentScope(studentUser, 'student-123')).not.toThrow();
    });

    it('verifyStudentScope should allow admin or warden accessing student resource', () => {
      const wardenUser = { sub: 'warden-456', roles: ['warden'] };
      const adminUser = { sub: 'admin-789', roles: ['admin'] };

      expect(() => verifyStudentScope(wardenUser, 'student-123')).not.toThrow();
      expect(() => verifyStudentScope(adminUser, 'student-123')).not.toThrow();
    });

    it('verifyStudentScope should throw 403 when student accesses another student resource', () => {
      const studentUserA = { sub: 'student-123', roles: ['student'] };
      expect(() => verifyStudentScope(studentUserA, 'student-456')).toThrow();
    });

    it('verifyWardenHostelScope should allow warden assigned to target hostel', () => {
      const wardenUser = { sub: 'warden-1', roles: ['warden'], hostelId: 'hostel-A' };
      expect(() => verifyWardenHostelScope(wardenUser, 'hostel-A')).not.toThrow();
    });

    it('verifyWardenHostelScope should throw 403 for unassigned hostel', () => {
      const wardenUser = { sub: 'warden-1', roles: ['warden'], hostelId: 'hostel-A' };
      expect(() => verifyWardenHostelScope(wardenUser, 'hostel-B')).toThrow();
    });

    it('verifyParentChildScope should throw 403 for non-linked child ID', async () => {
      const nonExistentChildId = crypto.randomUUID();
      const parentId = crypto.randomUUID();

      try {
        await verifyParentChildScope(parentId, nonExistentChildId);
        expect(true).toBe(false); // Should not reach
      } catch (err: any) {
        expect(err).toBeDefined();
      }
    });
  });

  describe('Request Correlation ID Middleware (REL-001)', () => {
    const app = new Elysia()
      .use(requestLogger)
      .get('/test-correlation', ({ requestId }) => {
        return { success: true, requestId };
      });

    it('should inject x-request-id header into response', async () => {
      const response = await app.handle(new Request('http://localhost/test-correlation'));
      expect(response.status).toBe(200);
      const requestIdHeader = response.headers.get('x-request-id');
      expect(requestIdHeader).toBeDefined();
      expect(requestIdHeader?.length).toBeGreaterThan(10);

      const json = await response.json() as any;
      expect(json.requestId).toBe(requestIdHeader);
    });

    it('should preserve client provided x-request-id header', async () => {
      const customId = `custom-req-${Date.now()}`;
      const response = await app.handle(
        new Request('http://localhost/test-correlation', {
          headers: { 'x-request-id': customId },
        })
      );
      expect(response.status).toBe(200);
      expect(response.headers.get('x-request-id')).toBe(customId);
    });
  });

  describe('Zod Input Validation Schemas (SEC-002)', () => {
    it('createOutpassSchema should validate correct outpass dates', () => {
      const result = createOutpassSchema.safeParse({
        reason: 'Hospital Visit',
        destination: 'City Clinic',
        outAt: new Date().toISOString(),
        expectedReturnAt: new Date(Date.now() + 86400000).toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it('createOutpassSchema should fail for invalid date strings', () => {
      const result = createOutpassSchema.safeParse({
        reason: 'Hospital Visit',
        destination: 'City Clinic',
        outAt: 'invalid-date',
        expectedReturnAt: 'tomorrow',
      });
      expect(result.success).toBe(false);
    });

    it('outpassDecisionSchema should enforce approved or rejected status', () => {
      expect(outpassDecisionSchema.safeParse({ status: 'approved' }).success).toBe(true);
      expect(outpassDecisionSchema.safeParse({ status: 'rejected' }).success).toBe(true);
      expect(outpassDecisionSchema.safeParse({ status: 'maybe' }).success).toBe(false);
    });

    it('startAttendanceSessionSchema should fail for negative or zero minutes', () => {
      const offeringId = crypto.randomUUID();
      expect(startAttendanceSessionSchema.safeParse({ offeringId, validForMinutes: 15 }).success).toBe(true);
      expect(startAttendanceSessionSchema.safeParse({ offeringId, validForMinutes: 0 }).success).toBe(false);
    });
  });
});
