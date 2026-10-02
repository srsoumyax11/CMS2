import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(jwtAuth)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return errorResponse('UNAUTHORIZED', 'Authentication token required');
    }
  })

  /**
   * GET /api/v1/admin/users
   * List users with optional status filtering
   */
  .get(
    '/users',
    async ({ query, set }) => {
      try {
        const { status, limit = 50, offset = 0 } = query;

        const usersList = await prisma.users.findMany({
          where: status ? { status } : undefined,
          select: {
            id: true,
            user_code: true,
            email: true,
            full_name: true,
            phone: true,
            status: true,
            created_at: true,
          },
          take: Number(limit),
          skip: Number(offset),
          orderBy: { created_at: 'desc' },
        });

        return successResponse(usersList, 'Users retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_USERS_FAILED', error instanceof Error ? error.message : 'Failed to fetch users');
      }
    },
    {
      query: t.Object({
        status: t.Optional(t.String()),
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
      detail: {
        tags: ['Admin'],
        summary: 'List users with status filter and pagination',
      },
    }
  )

  /**
   * POST /api/v1/admin/users/:id/freeze
   * Freeze user account
   */
  .post(
    '/users/:id/freeze',
    async ({ params, body, set }) => {
      try {
        const userToFreeze = await prisma.users.findUnique({
          where: { id: params.id },
        });

        if (!userToFreeze) {
          set.status = 404;
          return errorResponse('USER_NOT_FOUND', 'Target user not found');
        }

        const updated = await prisma.users.update({
          where: { id: params.id },
          data: {
            status: 'frozen',
            updated_at: new Date(),
          },
          select: {
            id: true,
            user_code: true,
            full_name: true,
            status: true,
          },
        });

        return successResponse(updated, `User account ${userToFreeze.user_code} frozen successfully`);
      } catch (error) {
        set.status = 500;
        return errorResponse('FREEZE_FAILED', error instanceof Error ? error.message : 'Failed to freeze user');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Optional(
        t.Object({
          reason: t.Optional(t.String()),
        })
      ),
      detail: {
        tags: ['Admin'],
        summary: 'Freeze/Suspend a user account',
      },
    }
  )

  /**
   * GET & POST /api/v1/admin/departments
   */
  .get(
    '/departments',
    async ({ set }) => {
      try {
        const depts = await prisma.departments.findMany({
          orderBy: { name: 'asc' },
        });
        return successResponse(depts, 'Departments retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_DEPTS_FAILED', error instanceof Error ? error.message : 'Failed to fetch departments');
      }
    },
    {
      detail: {
        tags: ['Admin'],
        summary: 'List all departments',
      },
    }
  )
  .post(
    '/departments',
    async ({ body, set }) => {
      try {
        const { code, name } = body;

        const newDept = await prisma.departments.create({
          data: {
            id: crypto.randomUUID(),
            code,
            name,
          },
        });

        return successResponse(newDept, 'Department created successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('CREATE_DEPT_FAILED', error instanceof Error ? error.message : 'Failed to create department');
      }
    },
    {
      body: t.Object({
        code: t.String({ minLength: 2 }),
        name: t.String({ minLength: 2 }),
      }),
      detail: {
        tags: ['Admin'],
        summary: 'Create a new department',
      },
    }
  )

  /**
   * GET & POST /api/v1/admin/courses
   */
  .get(
    '/courses',
    async ({ set }) => {
      try {
        const coursesList = await prisma.courses.findMany({
          include: { departments: true },
          orderBy: { name: 'asc' },
        });
        return successResponse(coursesList, 'Courses retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_COURSES_FAILED', error instanceof Error ? error.message : 'Failed to fetch courses');
      }
    },
    {
      detail: {
        tags: ['Admin'],
        summary: 'List all courses',
      },
    }
  )
  .post(
    '/courses',
    async ({ body, set }) => {
      try {
        const { departmentId, code, name, degreeLevel, durationSemesters } = body;

        const newCourse = await prisma.courses.create({
          data: {
            id: crypto.randomUUID(),
            department_id: departmentId,
            code,
            name,
            degree_level: degreeLevel,
            duration_semesters: durationSemesters,
          },
        });

        return successResponse(newCourse, 'Course created successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('CREATE_COURSE_FAILED', error instanceof Error ? error.message : 'Failed to create course');
      }
    },
    {
      body: t.Object({
        departmentId: t.String({ format: 'uuid' }),
        code: t.String({ minLength: 2 }),
        name: t.String({ minLength: 2 }),
        degreeLevel: t.String({ description: 'diploma, ug, pg, phd' }),
        durationSemesters: t.Number({ minimum: 1 }),
      }),
      detail: {
        tags: ['Admin'],
        summary: 'Create a new degree course',
      },
    }
  )

  /**
   * GET & POST /api/v1/admin/batches
   */
  .get(
    '/batches',
    async ({ set }) => {
      try {
        const batchesList = await prisma.batches.findMany({
          include: { courses: true, academic_years: true },
          orderBy: { name: 'asc' },
        });
        return successResponse(batchesList, 'Batches retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_BATCHES_FAILED', error instanceof Error ? error.message : 'Failed to fetch batches');
      }
    },
    {
      detail: {
        tags: ['Admin'],
        summary: 'List all academic batches',
      },
    }
  )
  .post(
    '/batches',
    async ({ body, set }) => {
      try {
        const { courseId, admissionYearId, name } = body;

        const newBatch = await prisma.batches.create({
          data: {
            id: crypto.randomUUID(),
            course_id: courseId,
            admission_year_id: admissionYearId,
            name,
          },
        });

        return successResponse(newBatch, 'Batch created successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('CREATE_BATCH_FAILED', error instanceof Error ? error.message : 'Failed to create batch');
      }
    },
    {
      body: t.Object({
        courseId: t.String({ format: 'uuid' }),
        admissionYearId: t.String({ format: 'uuid' }),
        name: t.String({ minLength: 2 }),
      }),
      detail: {
        tags: ['Admin'],
        summary: 'Create a new batch',
      },
    }
  )

  /**
   * GET /api/v1/admin/name-corrections
   * List pending name correction requests
   */
  .get(
    '/name-corrections',
    async ({ set }) => {
      try {
        const requests = await prisma.name_correction_requests.findMany({
          include: {
            students: {
              include: {
                users: {
                  select: { full_name: true, email: true },
                },
              },
            },
          },
          orderBy: { created_at: 'desc' },
        });

        return successResponse(requests, 'Name correction requests retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_NAME_CORRECTIONS_FAILED', error instanceof Error ? error.message : 'Failed to fetch name corrections');
      }
    },
    {
      detail: {
        tags: ['Admin'],
        summary: 'List name correction requests',
      },
    }
  )

  /**
   * POST /api/v1/admin/name-corrections/:id/decide
   * Approve or reject name correction request
   */
  .post(
    '/name-corrections/:id/decide',
    async ({ user, params, body, set }) => {
      try {
        const req = await prisma.name_correction_requests.findUnique({
          where: { id: params.id },
        });

        if (!req) {
          set.status = 404;
          return errorResponse('REQUEST_NOT_FOUND', 'Name correction request not found');
        }

        const updated = await prisma.name_correction_requests.update({
          where: { id: params.id },
          data: {
            status: body.status,
            decided_by: user!.id,
            decided_at: new Date(),
          },
        });

        // If approved, update user's full name in users table
        if (body.status === 'approved') {
          await prisma.users.update({
            where: { id: req.student_id },
            data: { full_name: req.new_name, updated_at: new Date() },
          });
        }

        return successResponse(updated, `Name correction request ${body.status} successfully`);
      } catch (error) {
        set.status = 500;
        return errorResponse('DECISION_FAILED', error instanceof Error ? error.message : 'Failed to decide name correction');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Object({
        status: t.String({ description: 'approved, rejected' }),
      }),
      detail: {
        tags: ['Admin'],
        summary: 'Approve or reject a name correction request',
      },
    }
  )

  /**
   * POST /api/v1/admin/broadcast/emergency
   * System-wide emergency broadcast trigger
   */
  .post(
    '/broadcast/emergency',
    async ({ user, body, set }) => {
      try {
        const { title, message, severity } = body;

        // Mock emergency broadcast response payload
        const broadcastResult = {
          broadcastId: crypto.randomUUID(),
          title,
          message,
          severity: severity || 'high',
          senderId: user!.id,
          recipientCount: 1500,
          deliveredChannels: ['push', 'sms', 'web_popup'],
          triggeredAt: new Date().toISOString(),
        };

        return successResponse(broadcastResult, 'Emergency broadcast sent successfully across all channels');
      } catch (error) {
        set.status = 500;
        return errorResponse('BROADCAST_FAILED', error instanceof Error ? error.message : 'Failed to trigger emergency broadcast');
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 3 }),
        message: t.String({ minLength: 5 }),
        severity: t.Optional(t.String({ description: 'low, medium, high, critical' })),
      }),
      detail: {
        tags: ['Admin'],
        summary: 'Trigger system-wide emergency broadcast',
      },
    }
  );
