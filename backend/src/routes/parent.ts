import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';
import { createRateLimiter } from '../middleware/rate-limit';

export const parentRoutes = new Elysia({ prefix: '/parent' })
  .use(jwtAuth)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return errorResponse('UNAUTHORIZED', 'Authentication token required');
    }
  })

  /**
   * POST /api/v1/parent/link/request
   * Request student link by Admission No & Date of Birth
   */
  .post(
    '/link/request',
    async ({ user, body, set }) => {
      try {
        const { admissionNo, dateOfBirth, relation } = body;

        const student = await prisma.students.findUnique({
          where: { admission_no: admissionNo },
          include: { users: true },
        });

        if (!student) {
          set.status = 404;
          return errorResponse('STUDENT_NOT_FOUND', 'Student with provided admission number not found');
        }

        const dobMatch = new Date(dateOfBirth).toISOString().slice(0, 10) === new Date(student.date_of_birth).toISOString().slice(0, 10);
        if (!dobMatch) {
          set.status = 400;
          return errorResponse('DOB_MISMATCH', 'Date of birth does not match student records');
        }

        const linkRequest = await prisma.guardian_link_requests.create({
          data: {
            id: crypto.randomUUID(),
            guardian_user_id: user!.id,
            student_id: student.user_id,
            relation,
            dob_matched: true,
            status: 'pending_student',
          },
        });

        return successResponse(linkRequest, 'Guardian link request created successfully. Awaiting verification.');
      } catch (error) {
        set.status = 500;
        return errorResponse('LINK_REQUEST_FAILED', error instanceof Error ? error.message : 'Failed to request student link');
      }
    },
    {
      beforeHandle: createRateLimiter(15 * 60 * 1000, 5, 'guardian_link_create'),
      body: t.Object({
        admissionNo: t.String(),
        dateOfBirth: t.String({ description: 'YYYY-MM-DD' }),
        relation: t.String({ description: 'father, mother, guardian' }),
      }),
      detail: {
        tags: ['Parent'],
        summary: 'Request student link via admission number and DOB check',
      },
    }
  )

  /**
   * GET /api/v1/parent/children
   * List linked children for current guardian
   */
  .get(
    '/children',
    async ({ user, set }) => {
      try {
        const links = await prisma.student_guardians.findMany({
          where: { guardian_id: user!.id },
          include: {
            students: {
              include: {
                users: {
                  select: { full_name: true, email: true, phone: true },
                },
                batches: {
                  include: { courses: true },
                },
              },
            },
          },
        });

        const children = links.map((l: any) => ({
          studentId: l.student_id,
          admissionNo: l.students.admission_no,
          fullName: l.students.users.full_name,
          course: l.students.batches.courses.name,
          relation: l.relation,
          isPrimary: l.is_primary,
        }));

        return successResponse(children, 'Linked children retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_CHILDREN_FAILED', error instanceof Error ? error.message : 'Failed to list linked children');
      }
    },
    {
      detail: {
        tags: ['Parent'],
        summary: 'List linked children for guardian',
      },
    }
  )

  /**
   * GET /api/v1/parent/children/:id/outpasses
   * View outpass requests for a child
   */
  .get(
    '/children/:id/outpasses',
    async ({ params, set }) => {
      try {
        const outpasses = await prisma.outpass_requests.findMany({
          where: { student_id: params.id },
          orderBy: { created_at: 'desc' },
        });

        return successResponse(outpasses, 'Child outpass list retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_OUTPASSES_FAILED', error instanceof Error ? error.message : 'Failed to fetch outpasses');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Parent'],
        summary: 'Get outpass list for a linked child',
      },
    }
  )

  /**
   * POST /api/v1/parent/outpasses/:id/approve
   * Parent outpass approval
   */
  .post(
    '/outpasses/:id/approve',
    async ({ user, params, body, set }) => {
      try {
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
            decision_note: body?.note ? `Parent Approved: ${body.note}` : 'Parent Approved',
            updated_at: new Date(),
          },
        });

        return successResponse(updated, 'Outpass approved by parent');
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
          note: t.Optional(t.String()),
        })
      ),
      detail: {
        tags: ['Parent'],
        summary: 'Approve outpass request as parent',
      },
    }
  )

  /**
   * GET /api/v1/parent/children/:id/fees
   * View pending fee invoices for child
   */
  .get(
    '/children/:id/fees',
    async ({ params, set }) => {
      try {
        const invoices = await prisma.invoices.findMany({
          where: { student_id: params.id },
          include: {
            academic_years: true,
            invoice_items: {
              include: { fee_heads: true },
            },
          },
          orderBy: { due_date: 'asc' },
        });

        const data = invoices.map((inv: any) => ({
          invoiceId: inv.id,
          invoiceNo: inv.invoice_no,
          academicYear: inv.academic_years.label,
          dueDate: inv.due_date,
          status: inv.status,
          items: inv.invoice_items.map((item: any) => ({
            head: item.fee_heads.name,
            amount: item.amount,
          })),
        }));

        return successResponse(data, 'Child fee invoices retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FEES_FAILED', error instanceof Error ? error.message : 'Failed to fetch fee invoices');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Parent'],
        summary: 'Get pending fee invoices for a child',
      },
    }
  )

  /**
   * POST /api/v1/parent/payments/initiate
   * Initiate official fee payment
   */
  .post(
    '/payments/initiate',
    async ({ user, body, set, request }) => {
      try {
        const { studentId, amount, method, idempotencyKey } = body;
        const key = request.headers.get('idempotency-key') || idempotencyKey || `pay_${user!.id}_${Date.now()}`;

        // Idempotency check: return existing transaction if matching key exists
        const existing = await prisma.payments.findFirst({
          where: { idempotency_key: key },
        });

        if (existing) {
          return successResponse(
            {
              paymentId: existing.id,
              amount: existing.amount,
              status: existing.status,
              gatewayTxnUrl: `https://gateway.campus.edu/pay/${existing.id}`,
              isIdempotentReplay: true,
            },
            'Fee payment already initiated (Idempotent response)'
          );
        }

        const payment = await prisma.payments.create({
          data: {
            id: crypto.randomUUID(),
            student_id: studentId,
            payer_user_id: user!.id,
            amount: Number(amount),
            method: method || 'upi',
            status: 'initiated',
            idempotency_key: key,
          },
        });

        return successResponse(
          {
            paymentId: payment.id,
            amount: payment.amount,
            status: payment.status,
            gatewayTxnUrl: `https://gateway.campus.edu/pay/${payment.id}`,
          },
          'Fee payment initiated successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('PAYMENT_INITIATE_FAILED', error instanceof Error ? error.message : 'Failed to initiate payment');
      }
    },
    {
      body: t.Object({
        studentId: t.String({ format: 'uuid' }),
        amount: t.Number({ minimum: 1 }),
        method: t.Optional(t.String()),
        idempotencyKey: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Parent'],
        summary: 'Initiate official fee payment',
      },
    }
  );
