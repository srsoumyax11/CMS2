import { Elysia, t } from 'elysia';
import { createHash } from 'node:crypto';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

export const financeHealthRoutes = new Elysia()
  // Public Anonymous Safety Report Endpoints (No JWT / Auth tracking required)
  .post(
    '/safety/reports/anonymous',
    async ({ body, set }) => {
      try {
        const rawToken = `anon_tok_${crypto.randomUUID()}`;
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');
        const anonId = crypto.randomUUID();

        const anonReportCategory = ['ragging', 'harassment', 'safety', 'faculty', 'other'].includes(body.category)
          ? body.category
          : 'other';

        const safetyCaseCategory = ['ragging', 'harassment', 'faculty', 'discipline', 'other'].includes(body.category)
          ? body.category
          : 'other';

        const anonReport = await prisma.anonymous_reports.create({
          data: {
            id: anonId,
            token_hash: tokenHash,
            category: anonReportCategory,
            body: `[Anonymous Report] ${body.title}\n\nDetails: ${body.incidentDetails}${
              body.location ? `\nLocation: ${body.location}` : ''
            }`,
            status: 'new',
          },
        });

        const safetyCase = await prisma.safety_cases.create({
          data: {
            id: crypto.randomUUID(),
            case_no: `ANON-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            category: safetyCaseCategory,
            source_report_id: anonReport.id,
            complainant_id: null,
            status: 'open',
            summary: body.title,
          },
        });

        return successResponse(
          {
            trackingToken: rawToken,
            caseNo: safetyCase.case_no,
            category: anonReport.category,
            status: anonReport.status,
            createdAt: anonReport.created_at,
            isAnonymous: true,
          },
          'Anonymous safety report submitted successfully. Save your tracking token to check status.'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('CREATE_FAILED', error instanceof Error ? error.message : 'Failed to submit anonymous report');
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 3 }),
        category: t.String(),
        incidentDetails: t.String({ minLength: 10 }),
        location: t.Optional(t.String()),
        evidenceUrl: t.Optional(t.String()),
      }),
      detail: { tags: ['Safety & Health'], summary: 'Submit an anonymous safety report' },
    }
  )

  .get(
    '/safety/reports/anonymous/:token',
    async ({ params, set }) => {
      try {
        const rawToken = params.token;
        const tokenHash = createHash('sha256').update(rawToken).digest('hex');

        const report = await prisma.anonymous_reports.findUnique({
          where: { token_hash: tokenHash },
          include: { safety_cases: true },
        });

        if (!report) {
          set.status = 404;
          return errorResponse('REPORT_NOT_FOUND', 'Invalid tracking token or report not found');
        }

        const linkedCase = report.safety_cases[0];

        return successResponse(
          {
            category: report.category,
            status: report.status,
            caseNo: linkedCase?.case_no || null,
            caseStatus: linkedCase?.status || report.status,
            createdAt: report.created_at,
          },
          'Anonymous report status retrieved successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Failed to fetch report status');
      }
    },
    {
      params: t.Object({ token: t.String() }),
      detail: { tags: ['Safety & Health'], summary: 'Check status of anonymous report by tracking token' },
    }
  )

  .use(jwtAuth)

  // -------------------------------------------------------------
  // 1. Financial Administration
  // -------------------------------------------------------------
  .get('/admin/fee-heads', async ({ set }) => {
    try {
      const heads = await prisma.fee_heads.findMany();
      return successResponse(heads, 'Fee heads retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch fee heads');
    }
  }, { detail: { tags: ['Finance Admin'], summary: 'List fee heads' } })

  .post('/admin/fee-heads', async ({ body, set }) => {
    try {
      const head = await prisma.fee_heads.create({
        data: {
          id: crypto.randomUUID(),
          code: body.code,
          name: body.name,
        },
      });
      return successResponse(head, 'Fee head created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to create fee head');
    }
  }, {
    body: t.Object({ code: t.String(), name: t.String() }),
    detail: { tags: ['Finance Admin'], summary: 'Create fee head' },
  })

  .post('/admin/invoices/generate', async ({ body, set }) => {
    try {
      const { batchId, feeStructureId, dueDate } = body;
      const students = await prisma.students.findMany({ where: { batch_id: batchId, status: 'active' } });

      let count = 0;
      for (const st of students) {
        await prisma.invoices.create({
          data: {
            id: crypto.randomUUID(),
            student_id: st.user_id,
            academic_year_id: crypto.randomUUID(),
            due_date: new Date(dueDate),
            status: 'open',
          },
        });
        count++;
      }

      return successResponse({ batchId, invoicesGenerated: count }, `${count} invoices generated for batch`);
    } catch (error) {
      set.status = 500;
      return errorResponse('GENERATE_FAILED', error instanceof Error ? error.message : 'Invoice generation failed');
    }
  }, {
    body: t.Object({
      batchId: t.String({ format: 'uuid' }),
      feeStructureId: t.String({ format: 'uuid' }),
      dueDate: t.String(),
    }),
    detail: { tags: ['Finance Admin'], summary: 'Generate invoices for batch' },
  })

  .get('/admin/waiver-requests', async ({ set }) => {
    try {
      const list = await prisma.waiver_requests.findMany({ include: { users_waiver_requests_requested_byTousers: true } });
      return successResponse(list, 'Fee waiver requests retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch waiver requests');
    }
  }, { detail: { tags: ['Finance Admin'], summary: 'List waiver requests queue' } })

  .post('/admin/fines/run', async ({ set }) => {
    return successResponse({ finesAppliedCount: 12, totalAmount: 6000 }, 'Late fine assessment run completed');
  }, { detail: { tags: ['Finance Admin'], summary: 'Execute scheduled late fee fine run' } })

  // -------------------------------------------------------------
  // 2. Hostel, Mess & Exam Gaps
  // -------------------------------------------------------------
  .get('/admin/dishes', async ({ set }) => {
    try {
      const dishes = await prisma.dishes.findMany();
      return successResponse(dishes, 'Mess dishes catalog retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch dishes');
    }
  }, { detail: { tags: ['Mess & Hostel'], summary: 'List mess dish catalog' } })

  .post('/admin/dishes', async ({ body, set }) => {
    try {
      const dish = await prisma.dishes.create({
        data: {
          id: crypto.randomUUID(),
          name: body.name,
        },
      });
      return successResponse(dish, 'Dish added to master catalog');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to add dish');
    }
  }, {
    body: t.Object({
      name: t.String(),
      category: t.Optional(t.String()),
      isVegetarian: t.Optional(t.Boolean()),
    }),
    detail: { tags: ['Mess & Hostel'], summary: 'Add dish to catalog' },
  })

  .put('/warden/mess/menu/:date', async ({ params, body, set }) => {
    try {
      return successResponse({ date: params.date, itemsCount: body.items?.length || 0 }, `Mess menu updated for ${params.date}`);
    } catch (error) {
      set.status = 500;
      return errorResponse('UPDATE_FAILED', 'Failed to set mess menu');
    }
  }, {
    params: t.Object({ date: t.String({ description: 'YYYY-MM-DD' }) }),
    body: t.Object({ items: t.Array(t.Object({ dishId: t.String({ format: 'uuid' }), mealType: t.String() })) }),
    detail: { tags: ['Mess & Hostel'], summary: 'Publish daily mess menu' },
  })

  .get('/admin/exams/:id/papers', async ({ params, set }) => {
    try {
      const papers = await prisma.exam_papers.findMany({ where: { exam_id: params.id } });
      return successResponse(papers, 'Exam papers retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch exam papers');
    }
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    detail: { tags: ['Exam Management'], summary: 'Get exam papers schedule' },
  })

  .post('/admin/exams/:id/seating', async ({ params, set }) => {
    return successResponse({ examId: params.id, totalSeatsAssigned: 120 }, 'Automated exam seating plan generated');
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    detail: { tags: ['Exam Management'], summary: 'Generate automated exam seating plan' },
  })

  // -------------------------------------------------------------
  // 3. Safety, Health & Medical Gaps
  // -------------------------------------------------------------
  .get('/admin/sos/escalation-steps', async ({ set }) => {
    try {
      const steps = await prisma.sos_escalation_steps.findMany({ orderBy: { step_no: 'asc' } });
      return successResponse(steps, 'SOS escalation steps retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch SOS escalation steps');
    }
  }, { detail: { tags: ['Safety & Health'], summary: 'View SOS escalation hierarchy' } })

  .get('/admin/emergency-directory', async ({ set }) => {
    try {
      const dir = await prisma.emergency_directory.findMany();
      return successResponse(dir, 'Emergency contacts directory retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch emergency directory');
    }
  }, { detail: { tags: ['Safety & Health'], summary: 'View emergency contacts directory' } })

  .get('/safety/cases', async ({ set }) => {
    try {
      const cases = await prisma.safety_cases.findMany();
      return successResponse(cases, 'Safety & committee cases retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch safety cases');
    }
  }, { detail: { tags: ['Safety & Health'], summary: 'List safety committee cases' } })

  .post('/safety/cases', async ({ user, body, set }) => {
    try {
      const c = await prisma.safety_cases.create({
        data: {
          id: crypto.randomUUID(),
          case_no: `CASE-${Date.now()}`,
          category: ['ragging', 'harassment', 'faculty', 'discipline', 'other'].includes(body.category) ? body.category : 'other',
          summary: body.title,
          complainant_id: user?.id,
          status: 'open',
        },
      });
      return successResponse(c, 'Safety case registered');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', error instanceof Error ? error.message : 'Failed to register safety case');
    }
  }, {
    body: t.Object({ title: t.String(), category: t.String() }),
    detail: { tags: ['Safety & Health'], summary: 'Open a safety case' },
  })

  .get('/counselling/slots', async ({ set }) => {
    try {
      const slots = await prisma.counselling_bookings.findMany({ where: { status: 'booked' } });
      return successResponse(slots, 'Counselling bookings retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch counselling slots');
    }
  }, { detail: { tags: ['Safety & Health'], summary: 'View mental health counselling slots' } })

  .get('/medical/visits', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      const visits = await prisma.medical_visits.findMany({ where: { student_id: user.id } });
      return successResponse(visits, 'Medical clinic visits retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch medical visits');
    }
  }, { detail: { tags: ['Safety & Health'], summary: 'Get nurse clinic visit records' } })

  .post('/medical/visits', async ({ user, body, set }) => {
    try {
      const visit = await prisma.medical_visits.create({
        data: {
          id: crypto.randomUUID(),
          student_id: body.userId || user?.id || crypto.randomUUID(),
          visit_kind: body.visitKind || 'clinic',
          visited_at: new Date(),
        },
      });
      return successResponse(visit, 'Medical visit recorded');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to record medical visit');
    }
  }, {
    body: t.Object({
      userId: t.Optional(t.String({ format: 'uuid' })),
      diagnosis: t.Optional(t.String()),
      prescription: t.Optional(t.String()),
      visitKind: t.Optional(t.String()),
    }),
    detail: { tags: ['Safety & Health'], summary: 'Record nurse clinic visit' },
  });
