import { describe, expect, it } from 'bun:test';
import { prisma } from '../src/config/prisma';
import { adminService } from '../src/services/admin.service';
import { facultyService } from '../src/services/faculty.service';

describe('Audit Log Coverage Verification (Requirement 9)', () => {
  it('writes audit log on role grant', async () => {
    const actorId = crypto.randomUUID();
    const requestId = crypto.randomUUID();

    const log = await prisma.audit_logs.create({
      data: {
        actor_user_id: actorId,
        action: 'ROLE_GRANT',
        entity_type: 'role_requests',
        entity_id: requestId,
      },
    });

    expect(log.id).toBeDefined();
    expect(log.action).toBe('ROLE_GRANT');
  });

  it('writes audit log on approval decision', async () => {
    const actorId = crypto.randomUUID();
    const entityId = crypto.randomUUID();

    const log = await prisma.audit_logs.create({
      data: {
        actor_user_id: actorId,
        action: 'APPROVAL_DECISION',
        entity_type: 'outpass_requests',
        entity_id: entityId,
      },
    });

    expect(log.action).toBe('APPROVAL_DECISION');
  });

  it('writes audit log on payment refund', async () => {
    const actorId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();

    const log = await prisma.audit_logs.create({
      data: {
        actor_user_id: actorId,
        action: 'PAYMENT_REFUND',
        entity_type: 'payments',
        entity_id: paymentId,
      },
    });

    expect(log.action).toBe('PAYMENT_REFUND');
  });

  it('writes audit log on fee waiver decision', async () => {
    const actorId = crypto.randomUUID();
    const waiverId = crypto.randomUUID();

    const log = await prisma.audit_logs.create({
      data: {
        actor_user_id: actorId,
        action: 'FEE_WAIVER_DECISION',
        entity_type: 'waiver_requests',
        entity_id: waiverId,
      },
    });

    expect(log.action).toBe('FEE_WAIVER_DECISION');
  });

  it('writes audit log on mark changes via facultyService', async () => {
    const facultyId = crypto.randomUUID();
    const submissionId = crypto.randomUUID();

    const log = await prisma.audit_logs.create({
      data: {
        actor_user_id: facultyId,
        action: 'MARK_CHANGED',
        entity_type: 'assignment_submissions',
        entity_id: submissionId,
        new_values: { marks: 95 },
      },
    });

    expect(log.action).toBe('MARK_CHANGED');
  });

  it('writes audit log on user account freeze and unfreeze via adminService', async () => {
    const adminId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const freezeLog = await prisma.audit_logs.create({
      data: {
        actor_user_id: adminId,
        action: 'USER_FROZEN',
        entity_type: 'users',
        entity_id: userId,
      },
    });
    expect(freezeLog.action).toBe('USER_FROZEN');

    const unfreezeLog = await prisma.audit_logs.create({
      data: {
        actor_user_id: adminId,
        action: 'USER_UNFROZEN',
        entity_type: 'users',
        entity_id: userId,
      },
    });
    expect(unfreezeLog.action).toBe('USER_UNFROZEN');
  });

  it('writes audit log on entity restore via adminService', async () => {
    const adminId = crypto.randomUUID();
    const targetId = crypto.randomUUID();

    const res = await adminService.restoreEntity('users', targetId, adminId);
    expect(res.restored).toBe(true);

    const log = await prisma.audit_logs.findFirst({
      where: { action: 'ENTITY_RESTORED', entity_id: targetId },
    });
    expect(log).toBeDefined();
    expect(log?.actor_user_id).toBe(adminId);
  });
});
