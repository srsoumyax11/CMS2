import { prisma } from '../config/prisma';
import { realtimePubSub } from '../utils/pubsub';

export class StudentService {
  async getStudentProfile(userId: string) {
    const student = await prisma.students.findUnique({
      where: { user_id: userId },
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
      throw new Error('Student profile record not found');
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

    return {
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
    };
  }

  async updateStudentProfile(userId: string, data: { phone?: string; preferredLanguage?: string }) {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        ...(data.phone && { phone: data.phone }),
        ...(data.preferredLanguage && { preferred_language: data.preferredLanguage }),
        updated_at: new Date(),
      },
    });

    return {
      userId: updatedUser.id,
      phone: updatedUser.phone,
      preferredLanguage: updatedUser.preferred_language,
    };
  }

  async submitNameCorrection(userId: string, newName: string, evidenceFileId?: string) {
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      throw new Error('User record not found');
    }

    return await prisma.name_correction_requests.create({
      data: {
        id: crypto.randomUUID(),
        student_id: userId,
        old_name: currentUser.full_name,
        new_name: newName,
        evidence_file_id: evidenceFileId,
        status: 'pending',
      },
    });
  }

  async generateDigitalIdCard(userId: string) {
    const student = await prisma.students.findUnique({
      where: { user_id: userId },
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
      throw new Error('Student record not found');
    }

    const qrPayload = JSON.stringify({
      userId: student.user_id,
      admissionNo: student.admission_no,
      issuedAt: new Date().toISOString(),
      verifyUrl: `http://localhost:3000/api/v1/verify/${student.admission_no}`,
    });

    return {
      admissionNo: student.admission_no,
      fullName: student.users.full_name,
      course: student.batches.courses.name,
      photoUrl: null,
      qrPayload,
    };
  }

  async createOutpass(userId: string, data: { reason: string; destination: string; outAt: string; expectedReturnAt: string }) {
    return await prisma.outpass_requests.create({
      data: {
        id: crypto.randomUUID(),
        student_id: userId,
        reason: data.reason,
        destination: data.destination,
        out_at: new Date(data.outAt),
        expected_return_at: new Date(data.expectedReturnAt),
        status: 'pending',
      },
    });
  }

  async triggerSos(userId: string, data: { latitude?: number; longitude?: number; source?: string }) {
    const incident = await prisma.sos_incidents.create({
      data: {
        id: crypto.randomUUID(),
        student_id: userId,
        triggered_by: userId,
        source: data.source || 'button',
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
        idempotency_key: `sos_${userId}_${Date.now()}`,
        status: 'open',
      },
    });

    realtimePubSub.publishSOSEvent({
      incidentId: incident.id,
      studentId: userId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: incident.created_at ? incident.created_at.toISOString() : new Date().toISOString(),
      status: 'active',
    });

    return incident;
  }
}

export const studentService = new StudentService();
