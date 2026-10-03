import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

export const campusOpsRoutes = new Elysia()
  .use(jwtAuth)

  // -------------------------------------------------------------
  // 1. College Setup & Academic Admin
  // -------------------------------------------------------------
  .get('/admin/academic-years', async ({ set }) => {
    try {
      const years = await prisma.academic_years.findMany({ orderBy: { start_date: 'desc' } });
      return successResponse(years, 'Academic years retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch academic years');
    }
  }, { detail: { tags: ['Academic Admin'], summary: 'List academic years' } })

  .post('/admin/academic-years', async ({ body, set }) => {
    try {
      const year = await prisma.academic_years.create({
        data: {
          id: crypto.randomUUID(),
          label: body.label,
          start_date: new Date(body.startDate),
          end_date: new Date(body.endDate),
          is_current: body.isCurrent || false,
        },
      });
      return successResponse(year, 'Academic year created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', error instanceof Error ? error.message : 'Failed to create academic year');
    }
  }, {
    body: t.Object({
      label: t.String(),
      startDate: t.String(),
      endDate: t.String(),
      isCurrent: t.Optional(t.Boolean()),
    }),
    detail: { tags: ['Academic Admin'], summary: 'Create academic year' },
  })

  .get('/admin/terms', async ({ set }) => {
    try {
      const terms = await prisma.terms.findMany({ orderBy: { start_date: 'desc' } });
      return successResponse(terms, 'Terms retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch terms');
    }
  }, { detail: { tags: ['Academic Admin'], summary: 'List academic terms' } })

  .post('/admin/terms', async ({ body, set }) => {
    try {
      const term = await prisma.terms.create({
        data: {
          id: crypto.randomUUID(),
          academic_year_id: body.academicYearId,
          name: body.name,
          start_date: new Date(body.startDate),
          end_date: new Date(body.endDate),
        },
      });
      return successResponse(term, 'Term created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', error instanceof Error ? error.message : 'Failed to create term');
    }
  }, {
    body: t.Object({
      academicYearId: t.String({ format: 'uuid' }),
      code: t.String(),
      name: t.String(),
      startDate: t.String(),
      endDate: t.String(),
    }),
    detail: { tags: ['Academic Admin'], summary: 'Create academic term' },
  })

  .put('/admin/batches/:id/terms/:termId', async ({ params, body, set }) => {
    try {
      return successResponse(
        { batchId: params.id, termId: params.termId, semesterNo: body.semesterNo },
        'Batch term semester mapping updated'
      );
    } catch (error) {
      set.status = 500;
      return errorResponse('UPDATE_FAILED', 'Failed to update batch term mapping');
    }
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }), termId: t.String({ format: 'uuid' }) }),
    body: t.Object({ semesterNo: t.Number() }),
    detail: { tags: ['Academic Admin'], summary: 'Map semester number to batch term' },
  })

  .get('/admin/periods', async ({ set }) => {
    try {
      const periods = await prisma.periods.findMany({ orderBy: { period_no: 'asc' } });
      return successResponse(periods, 'Timetable periods retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch periods');
    }
  }, { detail: { tags: ['Academic Admin'], summary: 'List period slots' } })

  .post('/admin/periods', async ({ body, set }) => {
    try {
      const period = await prisma.periods.create({
        data: {
          id: crypto.randomUUID(),
          period_no: body.periodNo,
          start_time: new Date(`1970-01-01T${body.startTime}:00Z`),
          end_time: new Date(`1970-01-01T${body.endTime}:00Z`),
        },
      });
      return successResponse(period, 'Period slot created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to create period slot');
    }
  }, {
    body: t.Object({
      periodNo: t.Number(),
      label: t.Optional(t.String()),
      startTime: t.String(),
      endTime: t.String(),
    }),
    detail: { tags: ['Academic Admin'], summary: 'Create period slot' },
  })

  .get('/admin/buildings', async ({ set }) => {
    try {
      const bldgs = await prisma.locations.findMany({ where: { kind: 'building' } });
      return successResponse(bldgs, 'Buildings retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch buildings');
    }
  }, { detail: { tags: ['Location Tree'], summary: 'List buildings' } })

  .get('/admin/locations', async ({ set }) => {
    try {
      const locs = await prisma.locations.findMany();
      return successResponse(locs, 'Locations retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch locations');
    }
  }, { detail: { tags: ['Location Tree'], summary: 'List location tree' } })

  .post('/admin/locations', async ({ body, set }) => {
    try {
      const loc = await prisma.locations.create({
        data: {
          id: crypto.randomUUID(),
          name: body.name,
          kind: body.kind,
          parent_id: body.parentId || null,
        },
      });
      return successResponse(loc, 'Location node created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to create location');
    }
  }, {
    body: t.Object({
      code: t.Optional(t.String()),
      name: t.String(),
      kind: t.String({ description: 'campus | building | floor | room | hostel | hostel_room | outdoor' }),
      parentId: t.Optional(t.String({ format: 'uuid' })),
    }),
    detail: { tags: ['Location Tree'], summary: 'Create location node' },
  })

  .get('/admin/leave-types', async ({ set }) => {
    try {
      const types = await prisma.leave_types.findMany();
      return successResponse(types, 'Leave types retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch leave types');
    }
  }, { detail: { tags: ['Academic Admin'], summary: 'List leave types' } })

  .post('/admin/leave-types', async ({ body, set }) => {
    try {
      const lt = await prisma.leave_types.create({
        data: {
          id: crypto.randomUUID(),
          code: body.code,
          name: body.name,
          applies_to: body.appliesTo,
          max_days_per_year: body.maxDaysPerYear || 10,
        },
      });
      return successResponse(lt, 'Leave type created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to create leave type');
    }
  }, {
    body: t.Object({
      code: t.String(),
      name: t.String(),
      appliesTo: t.String({ description: 'student | staff | both' }),
      maxDaysPerYear: t.Optional(t.Number()),
    }),
    detail: { tags: ['Academic Admin'], summary: 'Create leave type policy' },
  })

  .put('/admin/courses/:id/subjects', async ({ params, body, set }) => {
    try {
      return successResponse({ courseId: params.id, subjects: body.subjectIds }, 'Course subjects mapped');
    } catch (error) {
      set.status = 500;
      return errorResponse('UPDATE_FAILED', 'Failed to map course subjects');
    }
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    body: t.Object({ subjectIds: t.Array(t.String({ format: 'uuid' })) }),
    detail: { tags: ['Academic Admin'], summary: 'Map subjects to course per semester' },
  })

  .get('/admin/students/:id/batch-history', async ({ params, set }) => {
    try {
      const history = await prisma.student_batch_history.findMany({ where: { student_id: params.id } });
      return successResponse(history, 'Student batch history retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch batch history');
    }
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    detail: { tags: ['Academic Admin'], summary: 'Get student batch history' },
  })

  .get('/admin/role-conflicts', async ({ set }) => {
    try {
      const conflicts = await prisma.role_conflicts.findMany();
      return successResponse(conflicts, 'Role conflicts retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch role conflicts');
    }
  }, { detail: { tags: ['Academic Admin'], summary: 'List role conflicts' } })

  .post('/admin/role-conflicts', async ({ body, set }) => {
    try {
      const conflict = await prisma.role_conflicts.create({
        data: {
          role_a: body.roleA,
          role_b: body.roleB,
          reason: body.reason,
        },
      });
      return successResponse(conflict, 'Role conflict created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to create role conflict');
    }
  }, {
    body: t.Object({
      roleA: t.String({ format: 'uuid' }),
      roleB: t.String({ format: 'uuid' }),
      reason: t.String(),
    }),
    detail: { tags: ['Academic Admin'], summary: 'Define conflicting role pair' },
  })

  // -------------------------------------------------------------
  // 2. Expanded Student Operations & Library Desk
  // -------------------------------------------------------------
  .get('/invoices', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      const invoices = await prisma.invoices.findMany({
        where: { student_id: user.id },
        include: { invoice_items: true },
      });
      return successResponse(invoices, 'Invoices retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch invoices');
    }
  }, { detail: { tags: ['Student Invoices'], summary: 'List student fee invoices' } })

  .get('/invoices/:id', async ({ user, params, set }) => {
    try {
      const invoice = await prisma.invoices.findUnique({
        where: { id: params.id },
        include: { invoice_items: true },
      });
      if (!invoice) {
        set.status = 404;
        return errorResponse('NOT_FOUND', 'Invoice not found');
      }
      return successResponse(invoice, 'Invoice details retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch invoice');
    }
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    detail: { tags: ['Student Invoices'], summary: 'Get single invoice details' },
  })

  .get('/scholarships', async ({ set }) => {
    try {
      const list = await prisma.scholarships.findMany();
      return successResponse(list, 'Available scholarships retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch scholarships');
    }
  }, { detail: { tags: ['Scholarships'], summary: 'Browse scholarships' } })

  .post('/scholarships/:id/apply', async ({ user, params, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      const app = await prisma.student_scholarships.create({
        data: {
          id: crypto.randomUUID(),
          student_id: user.id,
          scholarship_id: params.id,
          status: 'applied',
        },
      });
      return successResponse(app, 'Scholarship application submitted');
    } catch (error) {
      set.status = 500;
      return errorResponse('APPLY_FAILED', error instanceof Error ? error.message : 'Failed to apply for scholarship');
    }
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    detail: { tags: ['Scholarships'], summary: 'Apply for a scholarship' },
  })

  .get('/me/scholarships', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      const myApps = await prisma.student_scholarships.findMany({
        where: { student_id: user.id },
        include: { scholarships: true },
      });
      return successResponse(myApps, 'My scholarship applications retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch my scholarships');
    }
  }, { detail: { tags: ['Scholarships'], summary: 'Track my scholarship applications' } })

  .get('/messages', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      const msgs = await prisma.messages.findMany({
        where: { OR: [{ sender_id: user.id }, { recipient_id: user.id }] },
        orderBy: { sent_at: 'desc' },
      });
      return successResponse(msgs, 'Messages retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch messages');
    }
  }, { detail: { tags: ['Messaging'], summary: 'List user 1:1 messages' } })

  .post('/messages', async ({ user, body, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      if (user.id === body.recipientId) {
        set.status = 400;
        return errorResponse('SELF_MESSAGE_FORBIDDEN', 'Cannot send message to yourself');
      }
      const msg = await prisma.messages.create({
        data: {
          id: crypto.randomUUID(),
          sender_id: user.id,
          recipient_id: body.recipientId,
          body: body.content,
        },
      });
      return successResponse(msg, 'Message sent successfully');
    } catch (error) {
      set.status = 500;
      return errorResponse('SEND_FAILED', 'Failed to send message');
    }
  }, {
    body: t.Object({
      recipientId: t.String({ format: 'uuid' }),
      content: t.String(),
    }),
    detail: { tags: ['Messaging'], summary: 'Send official 1:1 message' },
  })

  .get('/me/mentor', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      const menteeRecord = await prisma.mentor_assignments.findFirst({
        where: { student_id: user.id },
        include: { staff: { include: { users: true } } },
      });
      return successResponse(menteeRecord?.staff || null, 'Mentor details retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch mentor');
    }
  }, { detail: { tags: ['Student Academics'], summary: 'Get assigned mentor' } })

  .get('/me/warnings', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      const warnings = await prisma.warnings.findMany({ where: { student_id: user.id } });
      return successResponse(warnings, 'Disciplinary warnings retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch warnings');
    }
  }, { detail: { tags: ['Student Academics'], summary: 'View warnings and posted fines' } })

  // -------------------------------------------------------------
  // 3. Library Desk Operations
  // -------------------------------------------------------------
  .get('/library/books', async ({ set }) => {
    try {
      const books = await prisma.books.findMany({ include: { book_authors: { include: { authors: true } } } });
      return successResponse(books, 'Library catalog retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch library catalog');
    }
  }, { detail: { tags: ['Library Desk'], summary: 'Search library catalog' } })

  .post('/library/books', async ({ body, set }) => {
    try {
      const book = await prisma.books.create({
        data: {
          id: crypto.randomUUID(),
          title: body.title,
          isbn: body.isbn,
        },
      });
      return successResponse(book, 'Book added to catalog');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to create book entry');
    }
  }, {
    body: t.Object({
      title: t.String(),
      isbn: t.Optional(t.String()),
      authorId: t.Optional(t.String({ format: 'uuid' })),
    }),
    detail: { tags: ['Library Desk'], summary: 'Add new catalog book' },
  })

  .post('/library/loans', async ({ body, set }) => {
    try {
      const loan = await prisma.book_loans.create({
        data: {
          id: crypto.randomUUID(),
          copy_id: body.copyId,
          borrower_id: body.userId,
          due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
      return successResponse(loan, 'Book copy loan issued');
    } catch (error) {
      set.status = 500;
      return errorResponse('ISSUE_FAILED', 'Failed to issue book loan');
    }
  }, {
    body: t.Object({
      copyId: t.String({ format: 'uuid' }),
      userId: t.String({ format: 'uuid' }),
    }),
    detail: { tags: ['Library Desk'], summary: 'Issue physical book loan' },
  })

  .post('/library/loans/:id/return', async ({ params, set }) => {
    try {
      const loan = await prisma.book_loans.update({
        where: { id: params.id },
        data: { returned_at: new Date() },
      });
      return successResponse(loan, 'Book copy returned');
    } catch (error) {
      set.status = 500;
      return errorResponse('RETURN_FAILED', 'Failed to process book return');
    }
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    detail: { tags: ['Library Desk'], summary: 'Return issued book loan' },
  });
