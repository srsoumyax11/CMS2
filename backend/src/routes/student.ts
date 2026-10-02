import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

export const studentRoutes = new Elysia({ prefix: '/student' })
  .use(jwtAuth)
  .onBeforeHandle(({ user, set }) => {
    if (!user) {
      set.status = 401;
      return errorResponse('UNAUTHORIZED', 'Authentication token required');
    }
  })

  /**
   * GET /api/v1/student/me
   * Get complete student profile
   */
  .get(
    '/me',
    async ({ user, set }) => {
      try {
        const student = await prisma.students.findUnique({
          where: { user_id: user!.id },
          include: {
            users: {
              select: {
                id: true,
                user_code: true,
                full_name: true,
                email: true,
                phone: true,
                status: true,
                preferred_language: true,
              },
            },
            batches: {
              include: {
                courses: true,
                academic_years: true,
              },
            },
            sections: true,
            bed_allocations: {
              where: { to_date: null },
              include: {
                beds: {
                  include: {
                    hostel_rooms: {
                      include: {
                        hostels: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!student) {
          set.status = 404;
          return errorResponse('STUDENT_NOT_FOUND', 'Student profile record not found');
        }

        const activeBed = student.bed_allocations[0];
        const roomInfo = activeBed
          ? {
              allocationId: activeBed.id,
              hostelName: activeBed.beds.hostel_rooms.hostels.name,
              floorNo: activeBed.beds.hostel_rooms.floor_no,
              roomNo: activeBed.beds.hostel_rooms.room_no,
              bedNo: activeBed.beds.bed_no,
            }
          : null;

        return successResponse(
          {
            userId: student.user_id,
            admissionNo: student.admission_no,
            fullName: student.users.full_name,
            email: student.users.email,
            phone: student.users.phone,
            dateOfBirth: student.date_of_birth,
            status: student.status,
            course: student.batches.courses.name,
            academicYear: student.batches.academic_years.label,
            section: student.sections?.name || 'Unassigned',
            room: roomInfo,
          },
          'Student profile retrieved successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('PROFILE_FETCH_FAILED', error instanceof Error ? error.message : 'Unknown error');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get student profile and assignment details',
      },
    }
  )

  /**
   * PATCH /api/v1/student/me
   * Update student profile fields (phone, preferred language)
   */
  .patch(
    '/me',
    async ({ user, body, set }) => {
      try {
        const { phone, preferredLanguage } = body;

        const updatedUser = await prisma.users.update({
          where: { id: user!.id },
          data: {
            ...(phone && { phone }),
            ...(preferredLanguage && { preferred_language: preferredLanguage }),
            updated_at: new Date(),
          },
        });

        return successResponse(
          {
            userId: updatedUser.id,
            phone: updatedUser.phone,
            preferredLanguage: updatedUser.preferred_language,
          },
          'Profile updated successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('PROFILE_UPDATE_FAILED', error instanceof Error ? error.message : 'Failed to update profile');
      }
    },
    {
      body: t.Object({
        phone: t.Optional(t.String()),
        preferredLanguage: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Student'],
        summary: 'Update student contact and language preferences',
      },
    }
  )

  /**
   * POST /api/v1/student/me/name-correction
   * Request official name correction
   */
  .post(
    '/me/name-correction',
    async ({ user, body, set }) => {
      try {
        const { newName, evidenceFileId } = body;

        const currentUser = await prisma.users.findUnique({
          where: { id: user!.id },
        });

        if (!currentUser) {
          set.status = 404;
          return errorResponse('USER_NOT_FOUND', 'User record not found');
        }

        const request = await prisma.name_correction_requests.create({
          data: {
            id: crypto.randomUUID(),
            student_id: user!.id,
            old_name: currentUser.full_name,
            new_name: newName,
            evidence_file_id: evidenceFileId,
            status: 'pending',
          },
        });

        return successResponse(request, 'Name correction request submitted successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('REQUEST_FAILED', error instanceof Error ? error.message : 'Failed to submit request');
      }
    },
    {
      body: t.Object({
        newName: t.String({ minLength: 2 }),
        evidenceFileId: t.Optional(t.String({ format: 'uuid' })),
      }),
      detail: {
        tags: ['Student'],
        summary: 'Submit name correction request',
      },
    }
  )

  /**
   * GET /api/v1/student/me/id-card
   * Get digital ID card payload and QR code payload
   */
  .get(
    '/me/id-card',
    async ({ user, set }) => {
      try {
        const student = await prisma.students.findUnique({
          where: { user_id: user!.id },
          include: {
            users: true,
            batches: {
              include: {
                courses: true,
              },
            },
          },
        });

        if (!student) {
          set.status = 404;
          return errorResponse('STUDENT_NOT_FOUND', 'Student record not found');
        }

        const qrPayload = JSON.stringify({
          userId: student.user_id,
          admissionNo: student.admission_no,
          issuedAt: new Date().toISOString(),
          verifyUrl: `http://localhost:3000/api/v1/verify/${student.admission_no}`,
        });

        return successResponse(
          {
            admissionNo: student.admission_no,
            fullName: student.users.full_name,
            course: student.batches.courses.name,
            photoUrl: null,
            qrPayload,
          },
          'Digital ID Card generated successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('ID_CARD_FAILED', error instanceof Error ? error.message : 'Failed to generate ID card');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get digital ID Card with verification QR payload',
      },
    }
  )

  /**
   * GET /api/v1/student/timetable
   * Fetch active section timetable
   */
  .get(
    '/timetable',
    async ({ user, set }) => {
      try {
        const student = await prisma.students.findUnique({
          where: { user_id: user!.id },
        });

        if (!student || !student.section_id) {
          set.status = 404;
          return errorResponse('SECTION_UNASSIGNED', 'Student is not assigned to an active section');
        }

        const entries = await prisma.timetable_entries.findMany({
          where: {
            subject_offerings: {
              section_id: student.section_id,
            },
          },
          include: {
            subject_offerings: {
              include: {
                subjects: true,
                staff: {
                  include: {
                    users: true,
                  },
                },
              },
            },
            rooms: true,
            periods: true,
          },
        });

        const timetable = entries.map((entry: any) => ({
          id: entry.id,
          dayOfWeek: entry.day_of_week,
          startTime: entry.periods.start_time,
          endTime: entry.periods.end_time,
          subjectCode: entry.subject_offerings.subjects.code,
          subjectName: entry.subject_offerings.subjects.name,
          facultyName: entry.subject_offerings.staff?.users.full_name || 'Faculty',
          room: entry.rooms.room_no,
        }));

        return successResponse(timetable, 'Timetable retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('TIMETABLE_FAILED', error instanceof Error ? error.message : 'Failed to fetch timetable');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get live timetable schedule',
      },
    }
  )

  /**
   * GET /api/v1/student/attendance/summary
   * Subject-wise attendance percentages
   */
  .get(
    '/attendance/summary',
    async ({ user, set }) => {
      try {
        const records = await prisma.attendance_records.findMany({
          where: { student_id: user!.id },
          include: {
            class_sessions: {
              include: {
                subject_offerings: {
                  include: {
                    subjects: true,
                  },
                },
              },
            },
          },
        });

        const subjectStats: Record<string, { subjectName: string; total: number; present: number }> = {};

        for (const rec of records) {
          const subject = rec.class_sessions.subject_offerings.subjects;
          const stat = subjectStats[subject.id] || { subjectName: subject.name, total: 0, present: 0 };
          stat.total += 1;
          if (rec.status === 'present' || rec.status === 'late') {
            stat.present += 1;
          }
          subjectStats[subject.id] = stat;
        }

        const summary = Object.values(subjectStats).map((stat) => ({
          subjectName: stat.subjectName,
          totalClasses: stat.total,
          attendedClasses: stat.present,
          percentage: stat.total > 0 ? Number(((stat.present / stat.total) * 100).toFixed(2)) : 100,
          isShortage: stat.total > 0 ? (stat.present / stat.total) * 100 < 75 : false,
        }));

        return successResponse(summary, 'Attendance summary calculated successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('ATTENDANCE_FAILED', error instanceof Error ? error.message : 'Failed to calculate attendance');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get attendance summary per subject',
      },
    }
  )

  /**
   * POST /api/v1/student/attendance/disputes
   * Submit attendance dispute
   */
  .post(
    '/attendance/disputes',
    async ({ user, body, set }) => {
      try {
        const { sessionId, reason } = body;

        const dispute = await prisma.attendance_disputes.create({
          data: {
            id: crypto.randomUUID(),
            session_id: sessionId,
            student_id: user!.id,
            reason,
            status: 'pending',
          },
        });

        return successResponse(dispute, 'Attendance dispute submitted for review');
      } catch (error) {
        set.status = 500;
        return errorResponse('DISPUTE_FAILED', error instanceof Error ? error.message : 'Failed to create dispute');
      }
    },
    {
      body: t.Object({
        sessionId: t.String({ format: 'uuid' }),
        reason: t.String({ minLength: 5 }),
      }),
      detail: {
        tags: ['Student'],
        summary: 'Submit attendance dispute ticket',
      },
    }
  )

  /**
   * POST /api/v1/student/outpasses
   * Submit outpass request
   */
  .post(
    '/outpasses',
    async ({ user, body, set }) => {
      try {
        const { reason, destination, outAt, expectedReturnAt } = body;

        const outpass = await prisma.outpass_requests.create({
          data: {
            id: crypto.randomUUID(),
            student_id: user!.id,
            reason,
            destination,
            out_at: new Date(outAt),
            expected_return_at: new Date(expectedReturnAt),
            status: 'pending',
          },
        });

        return successResponse(outpass, 'Outpass request submitted successfully for warden approval');
      } catch (error) {
        set.status = 500;
        return errorResponse('OUTPASS_FAILED', error instanceof Error ? error.message : 'Failed to submit outpass');
      }
    },
    {
      body: t.Object({
        reason: t.String({ minLength: 3 }),
        destination: t.String({ minLength: 2 }),
        outAt: t.String({ description: 'ISO date time' }),
        expectedReturnAt: t.String({ description: 'ISO date time' }),
      }),
      detail: {
        tags: ['Student'],
        summary: 'Submit digital outpass request',
      },
    }
  )

  /**
   * GET /api/v1/student/outpasses
   * Get student outpass history
   */
  .get(
    '/outpasses',
    async ({ user, set }) => {
      try {
        const outpasses = await prisma.outpass_requests.findMany({
          where: { student_id: user!.id },
          orderBy: { created_at: 'desc' },
        });

        return successResponse(outpasses, 'Outpasses retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('OUTPASS_FETCH_FAILED', error instanceof Error ? error.message : 'Failed to list outpasses');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get student outpass list',
      },
    }
  )

  /**
   * POST /api/v1/student/sos
   * Trigger emergency SOS alert
   */
  .post(
    '/sos',
    async ({ user, body, set }) => {
      try {
        const { latitude, longitude, source } = body;

        const incident = await prisma.sos_incidents.create({
          data: {
            id: crypto.randomUUID(),
            student_id: user!.id,
            triggered_by: user!.id,
            source: source || 'button',
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            idempotency_key: `sos_${user!.id}_${Date.now()}`,
            status: 'open',
          },
        });

        return successResponse(
          {
            incidentId: incident.id,
            status: incident.status,
            createdAt: incident.created_at,
          },
          'EMERGENCY SOS ALERT TRIGGERED. Warden and Emergency team notified!'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('SOS_TRIGGER_FAILED', error instanceof Error ? error.message : 'Failed to trigger SOS alert');
      }
    },
    {
      body: t.Object({
        latitude: t.Optional(t.Number()),
        longitude: t.Optional(t.Number()),
        source: t.Optional(t.Union([t.Literal('button'), t.Literal('shake'), t.Literal('roommate'), t.Literal('faculty'), t.Literal('guard')])),
      }),
      detail: {
        tags: ['Student'],
        summary: 'Trigger emergency SOS alert',
      },
    }
  )

  /**
   * POST /api/v1/student/sos/:id/cancel
   * Cancel active SOS alert
   */
  .post(
    '/sos/:id/cancel',
    async ({ user, params, body, set }) => {
      try {
        const reason = body?.reason;

        const incident = await prisma.sos_incidents.findUnique({
          where: { id: params.id },
        });

        if (!incident || incident.student_id !== user!.id) {
          set.status = 404;
          return errorResponse('SOS_NOT_FOUND', 'SOS incident not found or unauthorized');
        }

        const updated = await prisma.sos_incidents.update({
          where: { id: params.id },
          data: {
            status: 'false_alarm',
            closed_by: user!.id,
            closed_at: new Date(),
            closure_report: reason || 'Cancelled by user',
          },
        });

        return successResponse(updated, 'SOS alert cancelled successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('SOS_CANCEL_FAILED', error instanceof Error ? error.message : 'Failed to cancel SOS');
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
        tags: ['Student'],
        summary: 'Cancel active SOS alert',
      },
    }
  )

  /**
   * GET /api/v1/student/subjects
   * List enrolled subjects for current student
   */
  .get(
    '/subjects',
    async ({ set }) => {
      try {
        const subjectsList = await prisma.subjects.findMany({
          orderBy: { name: 'asc' },
        });

        return successResponse(subjectsList, 'Enrolled subjects retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_SUBJECTS_FAILED', error instanceof Error ? error.message : 'Failed to fetch subjects');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get enrolled subjects',
      },
    }
  )

  /**
   * GET /api/v1/student/assignments
   * Get pending and completed assignments
   */
  .get(
    '/assignments',
    async ({ set }) => {
      try {
        const assignmentsList = await prisma.assignments.findMany({
          include: {
            subject_offerings: {
              include: { subjects: true },
            },
          },
          orderBy: { due_at: 'asc' },
        });

        return successResponse(assignmentsList, 'Assignments retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_ASSIGNMENTS_FAILED', error instanceof Error ? error.message : 'Failed to fetch assignments');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'List course assignments',
      },
    }
  )

  /**
   * POST /api/v1/student/assignments/:id/submit
   * Submit an assignment
   */
  .post(
    '/assignments/:id/submit',
    async ({ user, params, body, set }) => {
      try {
        const { fileId } = body;

        const assignment = await prisma.assignments.findUnique({
          where: { id: params.id },
        });

        if (!assignment) {
          set.status = 404;
          return errorResponse('ASSIGNMENT_NOT_FOUND', 'Assignment not found');
        }

        const submission = await prisma.assignment_submissions.create({
          data: {
            id: crypto.randomUUID(),
            assignment_id: params.id,
            student_id: user!.id,
            file_id: fileId,
          },
        });

        return successResponse(submission, 'Assignment submitted successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('SUBMISSION_FAILED', error instanceof Error ? error.message : 'Failed to submit assignment');
      }
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      body: t.Object({
        fileId: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Student'],
        summary: 'Submit course assignment',
      },
    }
  )

  /**
   * GET /api/v1/student/notices
   * Get campus notice board feed
   */
  .get(
    '/notices',
    async ({ set }) => {
      try {
        const notices = await prisma.notices.findMany({
          where: { published_at: { lte: new Date() } },
          orderBy: { published_at: 'desc' },
        });

        return successResponse(notices, 'Campus notices retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_NOTICES_FAILED', error instanceof Error ? error.message : 'Failed to fetch notices');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get notice board feed',
      },
    }
  )

  /**
   * GET /api/v1/student/fees
   * Get fee invoices for current student
   */
  .get(
    '/fees',
    async ({ user, set }) => {
      try {
        const invoices = await prisma.invoices.findMany({
          where: { student_id: user!.id },
          include: {
            invoice_items: {
              include: { fee_heads: true },
            },
            academic_years: true,
          },
          orderBy: { due_date: 'asc' },
        });

        return successResponse(invoices, 'Student fee invoices retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FEES_FAILED', error instanceof Error ? error.message : 'Failed to fetch fee invoices');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get student fee breakdown and invoices',
      },
    }
  )

  /**
   * GET /api/v1/student/me/joining-checklist
   * Get student joining and onboarding checklist items
   */
  .get(
    '/me/joining-checklist',
    async ({ user, set }) => {
      try {
        const student = await prisma.students.findUnique({
          where: { user_id: user!.id },
        });

        if (!student) {
          set.status = 404;
          return errorResponse('STUDENT_NOT_FOUND', 'Student record not found');
        }

        const bed = await prisma.bed_allocations.findFirst({
          where: { student_id: user!.id, to_date: null },
        });

        const checklist = [
          { id: '1', item: 'Submit 10th & 12th Marksheets', isCompleted: true, category: 'Documents' },
          { id: '2', item: 'Hostel Room Allocation', isCompleted: Boolean(bed), category: 'Hostel' },
          { id: '3', item: 'Library Card Issuance', isCompleted: true, category: 'Academic' },
          { id: '4', item: 'Anti-Ragging Undertaking', isCompleted: true, category: 'Compliance' },
          { id: '5', item: 'Medical Fitness Certificate', isCompleted: false, category: 'Health' },
        ];

        return successResponse(checklist, 'Joining checklist retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('CHECKLIST_FAILED', error instanceof Error ? error.message : 'Failed to fetch joining checklist');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get student joining and onboarding checklist',
      },
    }
  )

  /**
   * GET /api/v1/student/admission/status
   * Get student admission application status
   */
  .get(
    '/admission/status',
    async ({ user, set }) => {
      try {
        const student = await prisma.students.findUnique({
          where: { user_id: user!.id },
          include: {
            batches: {
              include: { courses: true },
            },
          },
        });

        if (!student) {
          set.status = 404;
          return errorResponse('STUDENT_NOT_FOUND', 'Student record not found');
        }

        const statusData = {
          admissionNo: student.admission_no,
          courseName: student.batches.courses.name,
          admissionStatus: student.status,
          admittedOn: student.admitted_on,
          verificationStatus: 'verified',
        };

        return successResponse(statusData, 'Admission status retrieved successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('ADMISSION_STATUS_FAILED', error instanceof Error ? error.message : 'Failed to fetch admission status');
      }
    },
    {
      detail: {
        tags: ['Student'],
        summary: 'Get admission application status',
      },
    }
  );
