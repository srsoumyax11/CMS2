import { prisma } from '../config/prisma';

export class FacultyService {
  async startAttendanceSession(facultyUserId: string, offeringId: string, validForMinutes = 15) {
    const offering = await prisma.subject_offerings.findUnique({
      where: { id: offeringId },
    });

    if (!offering) {
      throw new Error('Subject offering not found');
    }

    const defaultPeriod = await prisma.periods.findFirst();
    if (!defaultPeriod) {
      throw new Error('No active period slot defined in system');
    }

    const expiresAt = new Date(Date.now() + validForMinutes * 60 * 1000);

    return await prisma.class_sessions.create({
      data: {
        id: crypto.randomUUID(),
        offering_id: offeringId,
        session_date: new Date(),
        period_id: defaultPeriod.id,
        status: 'active',
      },
    });
  }

  async submitManualAttendance(sessionId: string, records: Array<{ studentId: string; status: 'present' | 'absent' | 'late' }>) {
    const session = await prisma.class_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Attendance session not found');
    }

    return await prisma.$transaction(async (tx) => {
      for (const rec of records) {
        await tx.attendance_records.upsert({
          where: {
            session_id_student_id: {
              session_id: sessionId,
              student_id: rec.studentId,
            },
          },
          update: { status: rec.status },
          create: {
            session_id: sessionId,
            student_id: rec.studentId,
            status: rec.status,
            method: 'manual',
          },
        });
      }

      await tx.class_sessions.update({
        where: { id: sessionId },
        data: { status: 'completed' },
      });

      return { count: records.length };
    });
  }

  async resolveDispute(disputeId: string, facultyUserId: string, status: 'approved' | 'rejected', resolutionNotes?: string) {
    const dispute = await prisma.attendance_disputes.findUnique({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new Error('Attendance dispute not found');
    }

    return await prisma.attendance_disputes.update({
      where: { id: disputeId },
      data: {
        status,
        decided_by: facultyUserId,
        decided_at: new Date(),
      },
    });
  }

  async createAssignment(facultyUserId: string, data: { subjectOfferingId: string; title: string; description: string; dueAt: string; totalPoints?: number }) {
    return await prisma.assignments.create({
      data: {
        id: crypto.randomUUID(),
        offering_id: data.subjectOfferingId,
        title: data.title,
        description: data.description,
        due_at: new Date(data.dueAt),
        max_marks: data.totalPoints || 100,
        created_by: facultyUserId,
      },
    });
  }

  async gradeSubmission(submissionId: string, facultyUserId: string, marksObtained: number, feedback?: string) {
    const submission = await prisma.assignment_submissions.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new Error('Assignment submission not found');
    }

    const updated = await prisma.assignment_submissions.update({
      where: { id: submissionId },
      data: {
        marks: marksObtained,
        feedback: feedback || null,
        graded_by: facultyUserId,
        graded_at: new Date(),
      },
    });

    await prisma.audit_logs.create({
      data: {
        actor_user_id: facultyUserId,
        action: 'MARK_CHANGED',
        entity_type: 'assignment_submissions',
        entity_id: submissionId,
        new_values: { marks: marksObtained },
      },
    });

    return updated;
  }
}

export const facultyService = new FacultyService();
