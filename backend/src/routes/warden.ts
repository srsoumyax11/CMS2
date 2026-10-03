import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';
import { hashPassword } from '../utils/password';
import { realtimePubSub, type SOSEventPayload } from '../utils/pubsub';

export const wardenRoutes = new Elysia({ prefix: '/warden' })
  .use(jwtAuth)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return errorResponse('UNAUTHORIZED', 'Authentication token required');
    }
  })

  /**
   * GET /api/v1/warden/outpasses
   * List outpass requests (filterable by status)
   */
  .get(
    '/outpasses',
    async ({ query, set }) => {
      try {
        const { status } = query;

        const outpasses = await prisma.outpass_requests.findMany({
          where: {
            ...(status && { status }),
          },
          include: {
            students: {
              include: {
                users: {
                  select: {
                    full_name: true,
                    phone: true,
                  },
                },
              },
            },
          },
          orderBy: { created_at: 'desc' },
        });

        const data = outpasses.map((o: any) => ({
          id: o.id,
          studentId: o.student_id,
          studentName: o.students.users.full_name,
          studentPhone: o.students.users.phone,
          admissionNo: o.students.admission_no,
          reason: o.reason,
          destination: o.destination,
          outAt: o.out_at,
          expectedReturnAt: o.expected_return_at,
          status: o.status,
          decisionNote: o.decision_note,
          createdAt: o.created_at,
        }));

        return successResponse(data, 'Outpass requests retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_OUTPASSES_FAILED', error instanceof Error ? error.message : 'Unknown error');
      }
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Warden'],
        summary: 'List outpass inbox for warden approval',
      },
    }
  )

  /**
   * GET /api/v1/warden/outpasses/overdue
   * List overdue outpasses
   */
  .get(
    '/outpasses/overdue',
    async ({ set }) => {
      try {
        const now = new Date();
        const overdue = await prisma.outpass_requests.findMany({
          where: {
            status: 'approved',
            expected_return_at: { lt: now },
            outpass_events: {
              none: {
                event_kind: 'check_in',
              },
            },
          },
          include: {
            students: {
              include: {
                users: {
                  select: { full_name: true, phone: true },
                },
              },
            },
          },
        });

        const data = overdue.map((o: any) => ({
          id: o.id,
          studentName: o.students.users.full_name,
          admissionNo: o.students.admission_no,
          expectedReturnAt: o.expected_return_at,
          overdueHours: Number(((now.getTime() - new Date(o.expected_return_at).getTime()) / 3600000).toFixed(1)),
        }));

        return successResponse(data, 'Overdue outpasses retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_OVERDUE_FAILED', error instanceof Error ? error.message : 'Unknown error');
      }
    },
    {
      detail: {
        tags: ['Warden'],
        summary: 'Get list of overdue outpasses',
      },
    }
  )

  /**
   * POST /api/v1/warden/outpasses/:id/approve
   * Approve outpass request
   */
  .post(
    '/outpasses/:id/approve',
    async ({ user, params, body, set }) => {
      try {
        const decisionNote = body?.decisionNote;

        const outpass = await prisma.outpass_requests.findUnique({
          where: { id: params.id },
        });

        if (!outpass) {
          set.status = 404;
          return errorResponse('OUTPASS_NOT_FOUND', 'Outpass request not found');
        }

        const updated = await prisma.outpass_requests.update({
          where: { id: params.id },
          data: {
            status: 'approved',
            decided_by: user!.id,
            decided_at: new Date(),
            decision_note: decisionNote || 'Approved by warden',
            updated_at: new Date(),
          },
        });

        return successResponse(updated, 'Outpass request approved');
      } catch (error) {
        set.status = 500;
        return errorResponse('APPROVE_FAILED', error instanceof Error ? error.message : 'Failed to approve outpass');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Optional(
        t.Object({
          decisionNote: t.Optional(t.String()),
        })
      ),
      detail: {
        tags: ['Warden'],
        summary: 'Approve outpass request',
      },
    }
  )

  /**
   * POST /api/v1/warden/outpasses/:id/reject
   * Reject outpass request
   */
  .post(
    '/outpasses/:id/reject',
    async ({ user, params, body, set }) => {
      try {
        const { decisionNote } = body;

        const outpass = await prisma.outpass_requests.findUnique({
          where: { id: params.id },
        });

        if (!outpass) {
          set.status = 404;
          return errorResponse('OUTPASS_NOT_FOUND', 'Outpass request not found');
        }

        const updated = await prisma.outpass_requests.update({
          where: { id: params.id },
          data: {
            status: 'rejected',
            decided_by: user!.id,
            decided_at: new Date(),
            decision_note: decisionNote,
            updated_at: new Date(),
          },
        });

        return successResponse(updated, 'Outpass request rejected');
      } catch (error) {
        set.status = 500;
        return errorResponse('REJECT_FAILED', error instanceof Error ? error.message : 'Failed to reject outpass');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Object({
        decisionNote: t.String({ minLength: 3 }),
      }),
      detail: {
        tags: ['Warden'],
        summary: 'Reject outpass request',
      },
    }
  )

  /**
   * GET /api/v1/warden/sos/active
   * List open/active SOS incidents
   */
  .get(
    '/sos/active',
    async ({ set }) => {
      try {
        const activeSos = await prisma.sos_incidents.findMany({
          where: {
            status: { in: ['open', 'acknowledged', 'escalated'] },
          },
          include: {
            students: {
              include: {
                users: { select: { full_name: true, phone: true } },
              },
            },
          },
          orderBy: { created_at: 'desc' },
        });

        return successResponse(activeSos, 'Active SOS alerts retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_SOS_FAILED', error instanceof Error ? error.message : 'Failed to list active SOS');
      }
    },
    {
      detail: {
        tags: ['Warden'],
        summary: 'Get active SOS incidents control room inbox',
      },
    }
  )

  /**
   * WS /api/v1/warden/sos/stream
   * Real-time WebSocket push notifications for SOS alerts
   */
  .ws('/sos/stream', {
    open(ws) {
      const listener = (data: SOSEventPayload) => {
        ws.send(data);
      };
      (ws as any)._listener = listener;
      realtimePubSub.on('sos:alert', listener);
    },
    close(ws) {
      const listener = (ws as any)._listener;
      if (listener) {
        realtimePubSub.off('sos:alert', listener);
      }
    },
  })

  /**
   * POST /api/v1/warden/sos/:id/acknowledge
   * Acknowledge active SOS incident
   */
  .post(
    '/sos/:id/acknowledge',
    async ({ user, params, set }) => {
      try {
        const incident = await prisma.sos_incidents.findUnique({
          where: { id: params.id },
        });

        if (!incident) {
          set.status = 404;
          return errorResponse('SOS_NOT_FOUND', 'SOS incident not found');
        }

        const updated = await prisma.sos_incidents.update({
          where: { id: params.id },
          data: {
            status: 'acknowledged',
          },
        });

        // Add progress update log
        await prisma.sos_updates.create({
          data: {
            id: crypto.randomUUID(),
            incident_id: params.id,
            author_id: user!.id,
            body: `Incident acknowledged by Warden (${user!.fullName})`,
          },
        });

        return successResponse(updated, 'SOS incident acknowledged successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('ACKNOWLEDGE_FAILED', error instanceof Error ? error.message : 'Failed to acknowledge SOS');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Warden'],
        summary: 'Acknowledge active SOS incident',
      },
    }
  )

  /**
   * POST /api/v1/warden/sos/:id/close
   * Close SOS incident with closure report
   */
  .post(
    '/sos/:id/close',
    async ({ user, params, body, set }) => {
      try {
        const { closureReport } = body;

        const incident = await prisma.sos_incidents.findUnique({
          where: { id: params.id },
        });

        if (!incident) {
          set.status = 404;
          return errorResponse('SOS_NOT_FOUND', 'SOS incident not found');
        }

        const updated = await prisma.sos_incidents.update({
          where: { id: params.id },
          data: {
            status: 'closed',
            closed_by: user!.id,
            closed_at: new Date(),
            closure_report: closureReport,
          },
        });

        return successResponse(updated, 'SOS incident resolved and closed');
      } catch (error) {
        set.status = 500;
        return errorResponse('CLOSE_FAILED', error instanceof Error ? error.message : 'Failed to close SOS incident');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Object({
        closureReport: t.String({ minLength: 5 }),
      }),
      detail: {
        tags: ['Warden'],
        summary: 'Close SOS incident with final report',
      },
    }
  )

  /**
   * GET /api/v1/warden/rooms/vacant
   * List vacant beds in hostel rooms
   */
  .get(
    '/rooms/vacant',
    async ({ set }) => {
      try {
        const vacantBeds = await prisma.beds.findMany({
          where: {
            is_usable: true,
            bed_allocations: {
              none: {
                to_date: null,
              },
            },
          },
          include: {
            hostel_rooms: {
              include: {
                hostels: true,
              },
            },
          },
        });

        const data = vacantBeds.map((b: any) => ({
          bedId: b.id,
          bedNo: b.bed_no,
          roomNo: b.hostel_rooms.room_no,
          floorNo: b.hostel_rooms.floor_no,
          hostelName: b.hostel_rooms.hostels.name,
        }));

        return successResponse(data, 'Vacant beds retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_VACANT_FAILED', error instanceof Error ? error.message : 'Failed to list vacant beds');
      }
    },
    {
      detail: {
        tags: ['Warden'],
        summary: 'List available vacant hostel beds',
      },
    }
  )

  /**
   * POST /api/v1/warden/rooms/allocate
   * Allocate bed to a student
   */
  .post(
    '/rooms/allocate',
    async ({ user, body, set }) => {
      try {
        const { studentId, bedId } = body;

        // Deactivate previous bed allocations
        await prisma.bed_allocations.updateMany({
          where: {
            student_id: studentId,
            to_date: null,
          },
          data: {
            to_date: new Date(),
          },
        });

        const allocation = await prisma.bed_allocations.create({
          data: {
            id: crypto.randomUUID(),
            student_id: studentId,
            bed_id: bedId,
            allocated_by: user!.id,
            from_date: new Date(),
          },
        });

        return successResponse(allocation, 'Hostel bed allocated successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('ALLOCATION_FAILED', error instanceof Error ? error.message : 'Failed to allocate bed');
      }
    },
    {
      body: t.Object({
        studentId: t.String({ format: 'uuid' }),
        bedId: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Warden'],
        summary: 'Allocate hostel bed to student',
      },
    }
  )

  /**
   * POST /api/v1/warden/mess/hygiene-checks
   * Submit mess hygiene inspection
   */
  .post(
    '/mess/hygiene-checks',
    async ({ user, body, set }) => {
      try {
        const { hostelId, passed, notes } = body;

        const check = await prisma.mess_hygiene_checks.create({
          data: {
            id: crypto.randomUUID(),
            hostel_id: hostelId,
            checked_by: user!.id,
            check_date: new Date(),
            passed,
            notes,
          },
        });

        return successResponse(check, 'Mess hygiene inspection recorded');
      } catch (error) {
        set.status = 500;
        return errorResponse('HYGIENE_CHECK_FAILED', error instanceof Error ? error.message : 'Failed to record hygiene check');
      }
    },
    {
      body: t.Object({
        hostelId: t.String({ format: 'uuid' }),
        passed: t.Boolean(),
        notes: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Warden'],
        summary: 'Submit hostel mess hygiene check report',
      },
    }
  )

  /**
   * POST /api/v1/warden/visitors
   * Register visitor
   */
  .post(
    '/visitors',
    async ({ user, body, set }) => {
      try {
        const { hostUserId, visitorName, visitorPhone, purpose, validFrom, validUntil } = body;

        const passCode = 'VIS_' + Math.floor(100000 + Math.random() * 900000);
        const passCodeHash = await hashPassword(passCode);

        const visitor = await prisma.visitors.create({
          data: {
            id: crypto.randomUUID(),
            host_user_id: hostUserId,
            visitor_name: visitorName,
            visitor_phone: visitorPhone,
            purpose,
            pass_code_hash: passCodeHash,
            valid_from: new Date(validFrom),
            valid_until: new Date(validUntil),
            approved_by: user!.id,
          },
        });

        return successResponse(
          {
            visitorId: visitor.id,
            visitorName: visitor.visitor_name,
            passCode,
            validFrom: visitor.valid_from,
            validUntil: visitor.valid_until,
          },
          'Visitor pass approved and generated'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('VISITOR_REGISTRATION_FAILED', error instanceof Error ? error.message : 'Failed to register visitor');
      }
    },
    {
      body: t.Object({
        hostUserId: t.String({ format: 'uuid' }),
        visitorName: t.String({ minLength: 2 }),
        visitorPhone: t.Optional(t.String()),
        purpose: t.Optional(t.String()),
        validFrom: t.String({ description: 'ISO date time' }),
        validUntil: t.String({ description: 'ISO date time' }),
      }),
      detail: {
        tags: ['Warden'],
        summary: 'Register and approve visitor entry pass',
      },
    }
  );
