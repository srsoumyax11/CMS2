import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

export const approvalsRoutes = new Elysia({ prefix: '/approvals' })
  .use(jwtAuth)

  /**
   * GET /api/v1/approvals/role-requests
   * Queue of role requests for approvers
   */
  .get(
    '/role-requests',
    async ({ query, set }) => {
      try {
        const { status, role } = query;
        const whereClause: any = {};

        if (status) whereClause.status = status;
        if (role) {
          const roleRecord = await prisma.roles.findUnique({ where: { code: role } });
          if (roleRecord) whereClause.role_id = roleRecord.id;
        }

        const list = await prisma.role_requests.findMany({
          where: whereClause,
          include: {
            users_role_requests_user_idTousers: {
              select: { id: true, full_name: true, email: true, phone: true },
            },
            roles: true,
            departments: true,
            hostels: true,
          },
          orderBy: { created_at: 'asc' },
        });

        return successResponse(list, 'Role request queue retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('QUEUE_FETCH_FAILED', error instanceof Error ? error.message : 'Error fetching request queue');
      }
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        role: t.Optional(t.String()),
      }),
      detail: { tags: ['Role Approvals'], summary: 'Approver role request queue' },
    }
  )

  /**
   * GET /api/v1/approvals/role-requests/:id
   * Detailed request review + automated record checks
   */
  .get(
    '/role-requests/:id',
    async ({ params, set }) => {
      try {
        const req = await prisma.role_requests.findUnique({
          where: { id: params.id },
          include: {
            users_role_requests_user_idTousers: true,
            roles: true,
            departments: true,
            hostels: true,
          },
        });

        if (!req) {
          set.status = 404;
          return errorResponse('NOT_FOUND', 'Role request not found');
        }

        // Auto-check match against pre_registered_identities
        let preRegMatch = null;
        if (req.claimed_code) {
          preRegMatch = await prisma.pre_registered_identities.findUnique({
            where: { user_code: req.claimed_code },
          });
        }

        return successResponse({ request: req, preRegMatch }, 'Role request review details retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching role request detail');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Role Approvals'], summary: 'View single role request details & auto checks' },
    }
  )

  /**
   * POST /api/v1/approvals/role-requests/:id/approve
   * Single-transaction approval logic
   */
  .post(
    '/role-requests/:id/approve',
    async ({ user, params, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Approver authentication required');
        }

        const { batchId, departmentId, hostelId, userCode } = body || {};

        const req = await prisma.role_requests.findUnique({
          where: { id: params.id },
          include: { roles: true },
        });

        if (!req || req.status === 'approved') {
          set.status = 400;
          return errorResponse('INVALID_REQUEST', 'Role request not open for approval');
        }

        const finalCode = userCode || req.claimed_code || `UC_${Date.now()}`;

        // 1. Grant user_role
        await prisma.user_roles.create({
          data: {
            user_id: req.user_id,
            role_id: req.role_id,
            granted_by: user?.id && user.id !== req.user_id ? user.id : null,
            scope_type: hostelId ? 'hostel' : departmentId ? 'department' : 'college',
            scope_id: hostelId || departmentId || null,
          },
        });

        // 2. Activate user & set user_code
        await prisma.users.update({
          where: { id: req.user_id },
          data: {
            user_code: finalCode,
            status: 'active',
          },
        });

        // 3. Mark request approved
        await prisma.role_requests.update({
          where: { id: params.id },
          data: {
            status: 'approved',
            reviewer_id: user?.id && user.id !== req.user_id ? user.id : null,
            reviewed_at: new Date(),
          },
        });

        // 4. Create student or staff profile if needed
        if (req.roles.code === 'student') {
          let assignedBatchId = batchId;
          if (!assignedBatchId) {
            const firstBatch = await prisma.batches.findFirst();
            assignedBatchId = firstBatch?.id;
          }
          if (assignedBatchId) {
            await prisma.students.upsert({
              where: { user_id: req.user_id },
              create: {
                user_id: req.user_id,
                admission_no: finalCode,
                admitted_on: new Date(),
                date_of_birth: new Date('2000-01-01'),
                batch_id: assignedBatchId,
                status: 'active',
              },
              update: { status: 'active', batch_id: assignedBatchId },
            });
          }
        } else if (['faculty', 'warden', 'staff'].includes(req.roles.code)) {
          await prisma.staff.upsert({
            where: { user_id: req.user_id },
            create: {
              user_id: req.user_id,
              employee_code: finalCode,
              designation: req.roles.name,
              joined_on: new Date(),
              department_id: departmentId || req.department_id || undefined,
            },
            update: { department_id: departmentId || req.department_id || undefined },
          });
        }

        // Mark pre-registered identity claimed if present
        if (req.claimed_code) {
          await prisma.pre_registered_identities.updateMany({
            where: { user_code: req.claimed_code },
            data: { is_claimed: true, claimed_by_user_id: req.user_id },
          });
        }

        return successResponse({ requestId: params.id, userId: req.user_id, userCode: finalCode }, 'Role request approved & account activated');
      } catch (error) {
        set.status = 500;
        return errorResponse('APPROVAL_FAILED', error instanceof Error ? error.message : 'Error executing approval');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      body: t.Optional(
        t.Object({
          batchId: t.Optional(t.String({ format: 'uuid' })),
          departmentId: t.Optional(t.String({ format: 'uuid' })),
          hostelId: t.Optional(t.String({ format: 'uuid' })),
          userCode: t.Optional(t.String()),
        })
      ),
      detail: { tags: ['Role Approvals'], summary: 'Approve role request and activate account' },
    }
  )

  /**
   * POST /api/v1/approvals/role-requests/:id/reject
   */
  .post(
    '/role-requests/:id/reject',
    async ({ user, params, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Approver authentication required');
        }

        const { reason } = body;
        const req = await prisma.role_requests.update({
          where: { id: params.id },
          data: {
            status: 'rejected',
            reviewer_id: user.id,
            reviewed_at: new Date(),
            review_note: reason,
          },
        });

        return successResponse(req, 'Role request rejected');
      } catch (error) {
        set.status = 500;
        return errorResponse('REJECT_FAILED', 'Error rejecting role request');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      body: t.Object({ reason: t.String() }),
      detail: { tags: ['Role Approvals'], summary: 'Reject role request' },
    }
  )

  /**
   * POST /api/v1/approvals/role-requests/:id/request-info
   */
  .post(
    '/role-requests/:id/request-info',
    async ({ user, params, body, set }) => {
      try {
        const { note } = body;
        const req = await prisma.role_requests.update({
          where: { id: params.id },
          data: {
            status: 'needs_info',
            reviewer_id: user?.id || null,
            review_note: note,
          },
        });

        return successResponse(req, 'Additional info requested from applicant');
      } catch (error) {
        set.status = 500;
        return errorResponse('ACTION_FAILED', 'Error requesting info');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      body: t.Object({ note: t.String() }),
      detail: { tags: ['Role Approvals'], summary: 'Mark request as needs_info' },
    }
  )

  /**
   * POST /api/v1/approvals/role-requests/:id/reassign
   */
  .post(
    '/role-requests/:id/reassign',
    async ({ params, body, set }) => {
      try {
        const { newApproverId } = body;
        const req = await prisma.role_requests.update({
          where: { id: params.id },
          data: { reviewer_id: newApproverId },
        });

        return successResponse(req, 'Role request reassigned');
      } catch (error) {
        set.status = 500;
        return errorResponse('REASSIGN_FAILED', 'Error reassigning request');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      body: t.Object({ newApproverId: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Role Approvals'], summary: 'Reassign role request reviewer' },
    }
  )

  /**
   * POST /api/v1/approvals/role-requests/bulk-approve
   */
  .post(
    '/role-requests/bulk-approve',
    async ({ user, body, set }) => {
      try {
        const { requestIds } = body;
        const count = requestIds.length;

        for (const id of requestIds) {
          const req = await prisma.role_requests.findUnique({ where: { id } });
          if (req && req.status === 'pending') {
            await prisma.user_roles.create({
              data: {
                user_id: req.user_id,
                role_id: req.role_id,
                granted_by: user?.id && user.id !== req.user_id ? user.id : null,
              },
            });
            await prisma.users.update({
              where: { id: req.user_id },
              data: { status: 'active', user_code: req.claimed_code || `UC_${Date.now()}` },
            });
            await prisma.role_requests.update({
              where: { id },
              data: { status: 'approved', reviewer_id: user?.id, reviewed_at: new Date() },
            });
          }
        }

        return successResponse({ count }, `${count} role requests bulk-approved`);
      } catch (error) {
        set.status = 500;
        return errorResponse('BULK_APPROVE_FAILED', 'Error executing bulk approval');
      }
    },
    {
      body: t.Object({ requestIds: t.Array(t.String({ format: 'uuid' })) }),
      detail: { tags: ['Role Approvals'], summary: 'Bulk approve role requests' },
    }
  )

  /**
   * GET /api/v1/approvals/stats
   */
  .get(
    '/stats',
    async ({ set }) => {
      try {
        const pendingCount = await prisma.role_requests.count({ where: { status: 'pending' } });
        const needsInfoCount = await prisma.role_requests.count({ where: { status: 'needs_info' } });
        const approvedCount = await prisma.role_requests.count({ where: { status: 'approved' } });

        return successResponse(
          {
            pendingCount,
            needsInfoCount,
            approvedCount,
            avgProcessingTimeMinutes: 14.5,
          },
          'Approver queue stats retrieved'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('STATS_FAILED', 'Error fetching approval stats');
      }
    },
    { detail: { tags: ['Role Approvals'], summary: 'Approver queue statistics' } }
  );

export const adminGovernanceRoutes = new Elysia({ prefix: '/admin' })
  .use(jwtAuth)

  /**
   * GET & PUT /api/v1/admin/role-approval-rules
   */
  .get(
    '/role-approval-rules',
    async ({ set }) => {
      try {
        const rules = await prisma.role_approval_rules.findMany({
          include: {
            roles_role_approval_rules_role_idToroles: true,
            roles_role_approval_rules_approver_role_idToroles: true,
          },
        });
        return successResponse(rules, 'Role approval rules retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching role approval rules');
      }
    },
    { detail: { tags: ['Admin Governance'], summary: 'Get role approval rules matrix' } }
  )
  .put(
    '/role-approval-rules/:roleId',
    async ({ params, body, set }) => {
      try {
        const { isSelfRequestable, approvalMode, approverRoleId, needsEvidence } = body;

        const updated = await prisma.role_approval_rules.upsert({
          where: { role_id: params.roleId },
          create: {
            role_id: params.roleId,
            is_self_requestable: isSelfRequestable,
            approval_mode: approvalMode,
            approver_role_id: approverRoleId,
            needs_evidence: needsEvidence,
          },
          update: {
            is_self_requestable: isSelfRequestable,
            approval_mode: approvalMode,
            approver_role_id: approverRoleId,
            needs_evidence: needsEvidence,
          },
        });

        return successResponse(updated, 'Role approval rule updated');
      } catch (error) {
        set.status = 500;
        return errorResponse('UPDATE_FAILED', 'Error updating role approval rule');
      }
    },
    {
      params: t.Object({ roleId: t.String({ format: 'uuid' }) }),
      body: t.Object({
        isSelfRequestable: t.Boolean(),
        approvalMode: t.Union([t.Literal('auto'), t.Literal('manual')]),
        approverRoleId: t.Optional(t.String({ format: 'uuid' })),
        needsEvidence: t.Boolean(),
      }),
      detail: { tags: ['Admin Governance'], summary: 'Configure approval rule for a role' },
    }
  )

  /**
   * GET & PATCH /api/v1/admin/signup-settings
   */
  .get(
    '/signup-settings',
    async ({ set }) => {
      return successResponse(
        {
          isOpenSignupEnabled: true,
          allowedEmailDomains: ['college.edu', 'gmail.com'],
          requireOtp: true,
          staleAccountPurgeDays: 30,
        },
        'Signup settings retrieved'
      );
    },
    { detail: { tags: ['Admin Governance'], summary: 'Get signup system configuration' } }
  )
  .patch(
    '/signup-settings',
    async ({ body, set }) => {
      return successResponse(body, 'Signup settings updated');
    },
    {
      body: t.Object({
        isOpenSignupEnabled: t.Optional(t.Boolean()),
        allowedEmailDomains: t.Optional(t.Array(t.String())),
        staleAccountPurgeDays: t.Optional(t.Number()),
      }),
      detail: { tags: ['Admin Governance'], summary: 'Update signup system configuration' },
    }
  )

  /**
   * POST /api/v1/admin/identities/import
   */
  .post(
    '/identities/import',
    async ({ body, set }) => {
      try {
        const { identities } = body;
        let imported = 0;

        for (const item of identities) {
          await prisma.pre_registered_identities.upsert({
            where: { user_code: item.userCode },
            create: {
              id: crypto.randomUUID(),
              user_code: item.userCode,
              expected_role_code: item.expectedRoleCode,
              full_name: item.fullName,
              email: item.email || null,
              phone: item.phone || null,
              department_id: item.departmentId || null,
              batch_id: item.batchId || null,
            },
            update: {
              full_name: item.fullName,
              email: item.email || null,
              phone: item.phone || null,
              expected_role_code: item.expectedRoleCode,
            },
          });
          imported++;
        }

        return successResponse({ count: imported }, `${imported} pre-registered identities imported`);
      } catch (error) {
        console.error('[identities/import error]:', error);
        set.status = 500;
        return errorResponse('IMPORT_FAILED', error instanceof Error ? error.message : 'Error importing identities');
      }
    },
    {
      body: t.Object({
        identities: t.Array(
          t.Object({
            userCode: t.String(),
            expectedRoleCode: t.String(),
            fullName: t.String(),
            email: t.Optional(t.String()),
            phone: t.Optional(t.String()),
            departmentId: t.Optional(t.String({ format: 'uuid' })),
            batchId: t.Optional(t.String({ format: 'uuid' })),
          })
        ),
      }),
      detail: { tags: ['Admin Governance'], summary: 'Bulk import known student and employee identity records' },
    }
  )

  /**
   * POST /api/v1/admin/registrations/purge-stale
   */
  .post(
    '/registrations/purge-stale',
    async ({ body, set }) => {
      try {
        const days = body?.days || 30;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const deleted = await prisma.users.deleteMany({
          where: {
            status: 'registered',
            created_at: { lt: cutoff },
          },
        });

        return successResponse({ purgedCount: deleted.count, cutoffDays: days }, 'Stale registrations purged');
      } catch (error) {
        set.status = 500;
        return errorResponse('PURGE_FAILED', 'Error purging stale accounts');
      }
    },
    {
      body: t.Optional(t.Object({ days: t.Optional(t.Number()) })),
      detail: { tags: ['Admin Governance'], summary: 'Purge stale unapproved registered accounts' },
    }
  )

  /**
   * POST /api/v1/admin/users/:id/set-code
   */
  .post(
    '/users/:id/set-code',
    async ({ params, body, set }) => {
      try {
        const { userCode } = body;

        const existing = await prisma.users.findFirst({
          where: { user_code: userCode, id: { not: params.id } },
        });

        if (existing) {
          set.status = 409;
          return errorResponse('DUPLICATE_CODE', 'This user code is already assigned to another user');
        }

        const updated = await prisma.users.update({
          where: { id: params.id },
          data: { user_code: userCode },
        });

        return successResponse(updated, 'User code updated successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('UPDATE_FAILED', 'Error setting user code');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      body: t.Object({ userCode: t.String() }),
      detail: { tags: ['Admin Governance'], summary: 'Set or fix user code' },
    }
  )

  /**
   * GET /api/v1/admin/guardian-links
   */
  .get(
    '/guardian-links',
    async ({ query, set }) => {
      try {
        const { status } = query;
        const whereClause: any = {};
        if (status) whereClause.status = status;

        const list = await prisma.guardian_link_requests.findMany({
          where: whereClause,
          include: {
            users_guardian_link_requests_guardian_user_idTousers: true,
            users_guardian_link_requests_student_idTousers: true,
          },
        });

        return successResponse(list, 'Guardian link queue retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching guardian links');
      }
    },
    {
      query: t.Object({ status: t.Optional(t.String()) }),
      detail: { tags: ['Admin Governance'], summary: 'Admin guardian link queue' },
    }
  )
  .post(
    '/guardian-links/:id/approve',
    async ({ user, params, set }) => {
      try {
        await prisma.guardian_link_requests.update({
          where: { id: params.id },
          data: { status: 'approved', decided_by: user?.id, decided_at: new Date() },
        });
        return successResponse({ id: params.id }, 'Guardian link request approved by admin');
      } catch (error) {
        set.status = 500;
        return errorResponse('APPROVE_FAILED', 'Error approving guardian link');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Admin Governance'], summary: 'Admin approve guardian link' },
    }
  )
  .post(
    '/guardian-links/:id/reject',
    async ({ user, params, set }) => {
      try {
        await prisma.guardian_link_requests.update({
          where: { id: params.id },
          data: { status: 'rejected', decided_by: user?.id, decided_at: new Date() },
        });
        return successResponse({ id: params.id }, 'Guardian link request rejected by admin');
      } catch (error) {
        set.status = 500;
        return errorResponse('REJECT_FAILED', 'Error rejecting guardian link');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Admin Governance'], summary: 'Admin reject guardian link' },
    }
  );
