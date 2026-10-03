import { prisma } from '../config/prisma';
import { CacheService } from './cache.service';

export class AdminService {
  async freezeUserAccount(targetUserId: string, adminUserId: string, reason: string) {
    const user = await prisma.users.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return await prisma.users.update({
      where: { id: targetUserId },
      data: {
        status: 'frozen',
        updated_at: new Date(),
      },
    });
  }

  async listDepartments() {
    return await CacheService.getOrSet('ref:departments', 300, async () => {
      return await prisma.departments.findMany({
        orderBy: { name: 'asc' },
      });
    });
  }

  async createDepartment(name: string, code: string) {
    const newDept = await prisma.departments.create({
      data: {
        id: crypto.randomUUID(),
        name,
        code,
      },
    });
    CacheService.invalidate('ref:departments');
    return newDept;
  }

  async listCourses() {
    return await CacheService.getOrSet('ref:courses', 300, async () => {
      return await prisma.courses.findMany({
        orderBy: { name: 'asc' },
        include: { departments: true },
      });
    });
  }

  async createCourse(name: string, code: string, departmentId: string) {
    const newCourse = await prisma.courses.create({
      data: {
        id: crypto.randomUUID(),
        name,
        code,
        department_id: departmentId,
        degree_level: 'ug',
        duration_semesters: 8,
      },
    });
    CacheService.invalidate('ref:courses');
    return newCourse;
  }

  async listAcademicYears() {
    return await CacheService.getOrSet('ref:academic_years', 300, async () => {
      return await prisma.academic_years.findMany({
        orderBy: { start_date: 'desc' },
      });
    });
  }

  async createBatch(name: string, courseId: string, academicYearId: string) {
    return await prisma.batches.create({
      data: {
        id: crypto.randomUUID(),
        name,
        course_id: courseId,
        admission_year_id: academicYearId,
      },
    });
  }

  async broadcastEmergencyAlert(adminUserId: string, title: string, message: string, severity = 'high', targetRole?: string) {
    return await prisma.notices.create({
      data: {
        id: crypto.randomUUID(),
        title: `[EMERGENCY BROADCAST] ${title}`,
        body: message,
        published_at: new Date(),
        is_emergency: severity === 'high' || severity === 'critical',
        created_by: adminUserId,
      },
    });
  }

  async decideNameCorrection(requestId: string, adminUserId: string, status: 'approved' | 'rejected', remarks?: string) {
    const req = await prisma.name_correction_requests.findUnique({
      where: { id: requestId },
    });

    if (!req) {
      throw new Error('Name correction request not found');
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.name_correction_requests.update({
        where: { id: requestId },
        data: {
          status,
          decided_by: adminUserId,
          decided_at: new Date(),
        },
      });

      if (status === 'approved') {
        await tx.users.update({
          where: { id: req.student_id },
          data: { full_name: req.new_name, updated_at: new Date() },
        });
      }

      return updated;
    });
  }
}

export const adminService = new AdminService();
