import { prisma } from '../config/prisma';

export class WardenService {
  async listPendingOutpasses() {
    return await prisma.outpass_requests.findMany({
      where: { status: 'pending' },
      include: {
        students: {
          include: { users: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async decideOutpass(outpassId: string, wardenUserId: string, status: 'approved' | 'rejected', reviewRemarks?: string) {
    const outpass = await prisma.outpass_requests.findUnique({
      where: { id: outpassId },
    });

    if (!outpass) {
      throw new Error('Outpass request not found');
    }

    return await prisma.outpass_requests.update({
      where: { id: outpassId },
      data: {
        status,
        decided_by: wardenUserId,
        decided_at: new Date(),
        decision_note: reviewRemarks || null,
      },
    });
  }

  async listActiveSosIncidents() {
    return await prisma.sos_incidents.findMany({
      where: { status: { in: ['open', 'acknowledged'] } },
      include: {
        students: {
          include: { users: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async acknowledgeSos(incidentId: string, wardenUserId: string) {
    const incident = await prisma.sos_incidents.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new Error('SOS incident not found');
    }

    const updated = await prisma.sos_incidents.update({
      where: { id: incidentId },
      data: {
        status: 'acknowledged',
      },
    });

    await prisma.sos_updates.create({
      data: {
        id: crypto.randomUUID(),
        incident_id: incidentId,
        author_id: wardenUserId,
        body: 'Incident acknowledged by Warden',
      },
    });

    return updated;
  }

  async closeSos(incidentId: string, wardenUserId: string, closureReport: string) {
    const incident = await prisma.sos_incidents.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new Error('SOS incident not found');
    }

    return await prisma.sos_incidents.update({
      where: { id: incidentId },
      data: {
        status: 'closed',
        closed_by: wardenUserId,
        closed_at: new Date(),
        closure_report: closureReport,
      },
    });
  }

  async allocateBed(studentId: string, bedId: string, fromDate?: string) {
    const bed = await prisma.beds.findUnique({
      where: { id: bedId },
      include: {
        bed_allocations: {
          where: { to_date: null },
        },
      },
    });

    if (!bed || bed.is_usable === false) {
      throw new Error('Bed is not usable or does not exist');
    }

    if (bed.bed_allocations.length > 0) {
      throw new Error('Bed is currently occupied by another student');
    }

    return await prisma.bed_allocations.create({
      data: {
        id: crypto.randomUUID(),
        student_id: studentId,
        bed_id: bedId,
        from_date: fromDate ? new Date(fromDate) : new Date(),
      },
    });
  }
}

export const wardenService = new WardenService();
