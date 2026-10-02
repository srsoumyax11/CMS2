import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';
import { hashPassword } from '../utils/password';

export const facultyRoutes = new Elysia({ prefix: '/faculty' })
  .use(jwtAuth)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return errorResponse('UNAUTHORIZED', 'Authentication token required');
    }
  })

  /**
   * POST /api/v1/faculty/classes/:id/attendance/session
   * Start attendance session & generate dynamic 6-digit code
   */
  .post(
    '/classes/:id/attendance/session',
    async ({ params, set }) => {
      try {
        const sessionId = params.id;

        const session = await prisma.class_sessions.findUnique({
          where: { id: sessionId },
        });

        if (!session) {
          set.status = 404;
          return errorResponse('SESSION_NOT_FOUND', 'Class session not found');
        }

        const mockCode = '654321';
        const codeHash = await hashPassword(mockCode);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const codeRecord = await prisma.attendance_codes.create({
          data: {
            id: crypto.randomUUID(),
            session_id: sessionId,
            code_hash: codeHash,
            expires_at: expiresAt,
          },
        });

        return successResponse(
          {
            codeId: codeRecord.id,
            sessionId,
            codeHint: mockCode,
            expiresAt,
          },
          'Attendance session started successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('SESSION_START_FAILED', error instanceof Error ? error.message : 'Failed to start attendance session');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Faculty'],
        summary: 'Start attendance session and generate 6-digit dynamic code',
      },
    }
  )

  /**
   * POST /api/v1/faculty/classes/:id/attendance/manual
   * Manually mark attendance records
   */
  .post(
    '/classes/:id/attendance/manual',
    async ({ user, params, body, set }) => {
      try {
        const sessionId = params.id;
        const { records } = body;

        const upsertPromises = records.map((rec) =>
          prisma.attendance_records.upsert({
            where: {
              session_id_student_id: {
                session_id: sessionId,
                student_id: rec.studentId,
              },
            },
            update: {
              status: rec.status,
              method: 'manual',
              marked_by: user!.id,
              marked_at: new Date(),
            },
            create: {
              session_id: sessionId,
              student_id: rec.studentId,
              status: rec.status,
              method: 'manual',
              marked_by: user!.id,
              marked_at: new Date(),
            },
          })
        );

        await prisma.$transaction(upsertPromises);

        return successResponse({ sessionId, count: records.length }, 'Attendance records updated successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('MANUAL_ATTENDANCE_FAILED', error instanceof Error ? error.message : 'Failed to mark attendance');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Object({
        records: t.Array(
          t.Object({
            studentId: t.String({ format: 'uuid' }),
            status: t.String({ description: 'present, absent, late, excused' }),
          })
        ),
      }),
      detail: {
        tags: ['Faculty'],
        summary: 'Manually mark or override student attendance',
      },
    }
  )

  /**
   * GET /api/v1/faculty/attendance/disputes
   * List pending attendance disputes
   */
  .get(
    '/attendance/disputes',
    async ({ set }) => {
      try {
        const disputes = await prisma.attendance_disputes.findMany({
          where: { status: 'pending' },
          include: {
            attendance_records: {
              include: {
                students: {
                  include: {
                    users: { select: { full_name: true } },
                  },
                },
              },
            },
          },
        });

        const data = disputes.map((d: any) => ({
          id: d.id,
          sessionId: d.session_id,
          studentId: d.student_id,
          studentName: d.attendance_records.students.users.full_name,
          reason: d.reason,
          status: d.status,
          createdAt: d.created_at,
        }));

        return successResponse(data, 'Pending attendance disputes retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_DISPUTES_FAILED', error instanceof Error ? error.message : 'Failed to fetch disputes');
      }
    },
    {
      detail: {
        tags: ['Faculty'],
        summary: 'List pending attendance disputes for faculty review',
      },
    }
  )

  /**
   * POST /api/v1/faculty/attendance/disputes/:id/decide
   * Decide attendance dispute
   */
  .post(
    '/attendance/disputes/:id/decide',
    async ({ user, params, body, set }) => {
      try {
        const { status } = body;

        const dispute = await prisma.attendance_disputes.findUnique({
          where: { id: params.id },
        });

        if (!dispute) {
          set.status = 404;
          return errorResponse('DISPUTE_NOT_FOUND', 'Attendance dispute record not found');
        }

        const updated = await prisma.attendance_disputes.update({
          where: { id: params.id },
          data: {
            status,
            decided_by: user!.id,
            decided_at: new Date(),
          },
        });

        if (status === 'approved') {
          await prisma.attendance_records.update({
            where: {
              session_id_student_id: {
                session_id: dispute.session_id,
                student_id: dispute.student_id,
              },
            },
            data: {
              status: 'present',
            },
          });
        }

        return successResponse(updated, `Dispute decision recorded as ${status}`);
      } catch (error) {
        set.status = 500;
        return errorResponse('DECIDE_DISPUTE_FAILED', error instanceof Error ? error.message : 'Failed to decide dispute');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Object({
        status: t.Union([t.Literal('approved'), t.Literal('rejected')]),
      }),
      detail: {
        tags: ['Faculty'],
        summary: 'Approve or reject attendance dispute',
      },
    }
  )

  /**
   * POST /api/v1/faculty/assignments
   * Create course assignment
   */
  .post(
    '/assignments',
    async ({ user, body, set }) => {
      try {
        const { offeringId, title, description, dueAt, maxMarks } = body;

        const assignment = await prisma.assignments.create({
          data: {
            id: crypto.randomUUID(),
            offering_id: offeringId,
            title,
            description,
            due_at: new Date(dueAt),
            max_marks: Number(maxMarks),
            created_by: user!.id,
          },
        });

        return successResponse(assignment, 'Course assignment created successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('CREATE_ASSIGNMENT_FAILED', error instanceof Error ? error.message : 'Failed to create assignment');
      }
    },
    {
      body: t.Object({
        offeringId: t.String({ format: 'uuid' }),
        title: t.String({ minLength: 3 }),
        description: t.Optional(t.String()),
        dueAt: t.String({ description: 'ISO date time string' }),
        maxMarks: t.Number({ minimum: 1 }),
      }),
      detail: {
        tags: ['Faculty'],
        summary: 'Create new course assignment',
      },
    }
  )

  /**
   * GET /api/v1/faculty/assignments/:id/submissions
   * List student submissions for an assignment
   */
  .get(
    '/assignments/:id/submissions',
    async ({ params, set }) => {
      try {
        const submissions = await prisma.assignment_submissions.findMany({
          where: { assignment_id: params.id },
          include: {
            students: {
              include: {
                users: { select: { full_name: true } },
              },
            },
          },
        });

        return successResponse(submissions, 'Submissions retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_SUBMISSIONS_FAILED', error instanceof Error ? error.message : 'Failed to fetch submissions');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Faculty'],
        summary: 'Get list of student assignment submissions',
      },
    }
  )

  /**
   * POST /api/v1/faculty/submissions/:id/grade
   * Grade a student submission
   */
  .post(
    '/submissions/:id/grade',
    async ({ user, params, body, set }) => {
      try {
        const { marks, feedback } = body;

        const submission = await prisma.assignment_submissions.findUnique({
          where: { id: params.id },
        });

        if (!submission) {
          set.status = 404;
          return errorResponse('SUBMISSION_NOT_FOUND', 'Submission record not found');
        }

        const graded = await prisma.assignment_submissions.update({
          where: { id: params.id },
          data: {
            marks: Number(marks),
            feedback,
            graded_by: user!.id,
            graded_at: new Date(),
          },
        });

        return successResponse(graded, 'Submission graded successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('GRADE_FAILED', error instanceof Error ? error.message : 'Failed to grade submission');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Object({
        marks: t.Number({ minimum: 0 }),
        feedback: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Faculty'],
        summary: 'Grade student assignment submission',
      },
    }
  )

  /**
   * GET /api/v1/faculty/timetable
   * Fetch teaching timetable for faculty
   */
  .get(
    '/timetable',
    async ({ user, set }) => {
      try {
        const entries = await prisma.timetable_entries.findMany({
          where: {
            subject_offerings: {
              faculty_id: user!.id,
            },
          },
          include: {
            subject_offerings: {
              include: {
                subjects: true,
                sections: true,
              },
            },
            rooms: true,
            periods: true,
          },
        });

        const data = entries.map((e: any) => ({
          id: e.id,
          dayOfWeek: e.day_of_week,
          startTime: e.periods.start_time,
          endTime: e.periods.end_time,
          subjectName: e.subject_offerings.subjects.name,
          sectionName: e.subject_offerings.sections.name,
          room: e.rooms.room_no,
        }));

        return successResponse(data, 'Faculty timetable retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('TIMETABLE_FAILED', error instanceof Error ? error.message : 'Failed to fetch timetable');
      }
    },
    {
      detail: {
        tags: ['Faculty'],
        summary: 'Get faculty teaching timetable schedule',
      },
    }
  )

  /**
   * GET /api/v1/faculty/mentees
   * List assigned mentees
   */
  .get(
    '/mentees',
    async ({ user, set }) => {
      try {
        const mentees = await prisma.mentor_assignments.findMany({
          where: { mentor_id: user!.id, to_date: null },
          include: {
            students: {
              include: {
                users: {
                  select: { full_name: true, email: true, phone: true },
                },
              },
            },
          },
        });

        const data = mentees.map((m: any) => ({
          studentId: m.student_id,
          admissionNo: m.students.admission_no,
          fullName: m.students.users.full_name,
          email: m.students.users.email,
          phone: m.students.users.phone,
        }));

        return successResponse(data, 'Assigned mentees retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_MENTEES_FAILED', error instanceof Error ? error.message : 'Failed to fetch mentees');
      }
    },
    {
      detail: {
        tags: ['Faculty'],
        summary: 'List assigned student mentees',
      },
    }
  );
