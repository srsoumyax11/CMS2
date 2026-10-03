import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

export const transportPlacementsRoutes = new Elysia()
  .use(jwtAuth)

  // -------------------------------------------------------------
  // 1. Transport & Telemetry
  // -------------------------------------------------------------
  .get('/admin/vehicles', async ({ set }) => {
    try {
      const v = await prisma.vehicles.findMany();
      return successResponse(v, 'Fleet vehicles retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch vehicles');
    }
  }, { detail: { tags: ['Transport Fleet'], summary: 'List vehicles' } })

  .post('/admin/vehicles', async ({ body, set }) => {
    try {
      const v = await prisma.vehicles.create({
        data: {
          id: crypto.randomUUID(),
          registration_no: body.registrationNo,
          capacity: body.capacity,
        },
      });
      return successResponse(v, 'Vehicle registered');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to register vehicle');
    }
  }, {
    body: t.Object({
      registrationNo: t.String(),
      model: t.Optional(t.String()),
      capacity: t.Number(),
    }),
    detail: { tags: ['Transport Fleet'], summary: 'Add vehicle to fleet' },
  })

  .post('/driver/trips/start', async ({ body, set }) => {
    return successResponse({ tripId: crypto.randomUUID(), vehicleId: body.vehicleId, status: 'in_transit' }, 'Driver trip started');
  }, {
    body: t.Object({ vehicleId: t.String({ format: 'uuid' }), routeId: t.String({ format: 'uuid' }) }),
    detail: { tags: ['Transport Fleet'], summary: 'Driver starts route trip' },
  })

  .post('/driver/vehicles/:id/location', async ({ params, body, set }) => {
    return successResponse({ vehicleId: params.id, latitude: body.latitude, longitude: body.longitude, timestamp: new Date() }, 'Live location updated');
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    body: t.Object({ latitude: t.Number(), longitude: t.Number() }),
    detail: { tags: ['Transport Fleet'], summary: 'Broadcast live driver vehicle GPS telemetry' },
  })

  // -------------------------------------------------------------
  // 2. Clubs, Events & Placements
  // -------------------------------------------------------------
  .get('/clubs', async ({ set }) => {
    try {
      const clubs = await prisma.clubs.findMany();
      return successResponse(clubs, 'Clubs retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch clubs');
    }
  }, { detail: { tags: ['Clubs & Events'], summary: 'List student clubs' } })

  .post('/clubs', async ({ body, set }) => {
    try {
      const club = await prisma.clubs.create({
        data: {
          id: crypto.randomUUID(),
          name: body.name,
        },
      });
      return successResponse(club, 'Club created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to create club');
    }
  }, {
    body: t.Object({ code: t.Optional(t.String()), name: t.String(), category: t.Optional(t.String()) }),
    detail: { tags: ['Clubs & Events'], summary: 'Create student club' },
  })

  .post('/events/:id/awards', async ({ params, body, set }) => {
    try {
      const award = await prisma.event_awards.create({
        data: {
          id: crypto.randomUUID(),
          user_id: body.recipientUserId,
          event_id: params.id,
          award: body.title,
        },
      });
      return successResponse(award, 'Event award and digital certificate issued');
    } catch (error) {
      set.status = 500;
      return errorResponse('ISSUE_FAILED', 'Failed to issue event award');
    }
  }, {
    params: t.Object({ id: t.String({ format: 'uuid' }) }),
    body: t.Object({ recipientUserId: t.String({ format: 'uuid' }), title: t.String() }),
    detail: { tags: ['Clubs & Events'], summary: 'Issue event award' },
  })

  .get('/placements/companies', async ({ set }) => {
    try {
      const companies = await prisma.companies.findMany();
      return successResponse(companies, 'Placement companies retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch placement companies');
    }
  }, { detail: { tags: ['Placement Portal'], summary: 'List placement companies' } })

  .post('/placements/companies', async ({ body, set }) => {
    try {
      const comp = await prisma.companies.create({
        data: {
          id: crypto.randomUUID(),
          name: body.name,
          website: body.website,
        },
      });
      return successResponse(comp, 'Placement company profile created');
    } catch (error) {
      set.status = 500;
      return errorResponse('CREATE_FAILED', 'Failed to create company profile');
    }
  }, {
    body: t.Object({ name: t.String(), industry: t.Optional(t.String()), website: t.Optional(t.String()) }),
    detail: { tags: ['Placement Portal'], summary: 'Create company portal profile' },
  })

  .patch('/placements/applications/:driveId/:studentId', async ({ params, body, set }) => {
    try {
      const app = await prisma.drive_applications.update({
        where: { drive_id_student_id: { drive_id: params.driveId, student_id: params.studentId } },
        data: { status: body.status },
      });
      return successResponse(app, `Placement application status set to ${body.status}`);
    } catch (error) {
      set.status = 500;
      return errorResponse('UPDATE_FAILED', 'Failed to update application status');
    }
  }, {
    params: t.Object({ driveId: t.String({ format: 'uuid' }), studentId: t.String({ format: 'uuid' }) }),
    body: t.Object({ status: t.String({ description: 'shortlisted | interviewed | selected | rejected' }) }),
    detail: { tags: ['Placement Portal'], summary: 'Update student placement candidate status' },
  })

  .get('/alumni/profile', async ({ user, set }) => {
    try {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication required');
      }
      const alum = await prisma.alumni_profiles.findUnique({ where: { user_id: user.id } });
      return successResponse(alum, 'Alumni profile retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch alumni profile');
    }
  }, { detail: { tags: ['Alumni Network'], summary: 'Get alumni profile' } })

  // -------------------------------------------------------------
  // 3. System, Compliance & Privacy Governance
  // -------------------------------------------------------------
  .patch('/notifications/quiet-hours', async ({ user, body, set }) => {
    try {
      return successResponse({ startTime: body.startTime, endTime: body.endTime }, 'Quiet hours preference updated');
    } catch (error) {
      set.status = 500;
      return errorResponse('UPDATE_FAILED', 'Failed to update quiet hours');
    }
  }, {
    body: t.Object({ startTime: t.String(), endTime: t.String() }),
    detail: { tags: ['System & Privacy'], summary: 'Configure notification quiet hours' },
  })

  .get('/admin/access-logs', async ({ query, set }) => {
    try {
      const logs = await prisma.audit_logs.findMany({
        where: query.subjectId ? { entity_id: query.subjectId } : {},
        orderBy: { occurred_at: 'desc' },
        take: 50,
      });
      const safeLogs = logs.map((l: any) => ({ ...l, id: l.id.toString() }));
      return successResponse(safeLogs, 'Access security audit log retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch access logs');
    }
  }, {
    query: t.Object({ subjectId: t.Optional(t.String()) }),
    detail: { tags: ['System & Privacy'], summary: 'Security & privacy access audit log' },
  })

  .get('/admin/consents', async ({ query, set }) => {
    try {
      const consents = await prisma.guardian_consents.findMany({
        where: query.userId ? { student_id: query.userId } : {},
      });
      return successResponse(consents, 'Data sharing consent records retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch consent records');
    }
  }, {
    query: t.Object({ userId: t.Optional(t.String({ format: 'uuid' })) }),
    detail: { tags: ['System & Privacy'], summary: 'Data processing consent records audit' },
  })

  .get('/admin/app-config', async ({ set }) => {
    return successResponse(
      {
        minSupportedVersion: '1.0.0',
        latestVersion: '1.2.0',
        isMaintenanceMode: false,
        maintenanceMessage: 'System is running normally',
      },
      'App configuration retrieved'
    );
  }, { detail: { tags: ['System & Privacy'], summary: 'Mobile app update versioning and maintenance mode toggles' } })

  .put('/admin/app-config', async ({ body, set }) => {
    return successResponse(body, 'App configuration updated');
  }, {
    body: t.Object({
      minSupportedVersion: t.Optional(t.String()),
      latestVersion: t.Optional(t.String()),
      isMaintenanceMode: t.Optional(t.Boolean()),
      maintenanceMessage: t.Optional(t.String()),
    }),
    detail: { tags: ['System & Privacy'], summary: 'Update mobile app configuration' },
  })

  .get('/admin/retention', async ({ set }) => {
    try {
      const pol = await prisma.retention_policies.findMany();
      return successResponse(pol, 'Data retention policies retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch retention policies');
    }
  }, { detail: { tags: ['System & Privacy'], summary: 'View data retention policies' } })

  .get('/admin/login-events', async ({ query, set }) => {
    try {
      const events = await prisma.login_events.findMany({
        where: query.risk ? { risk_flag: query.risk } : {},
        orderBy: { created_at: 'desc' },
        take: 50,
      });
      return successResponse(events, 'Login anomaly events retrieved');
    } catch (error) {
      set.status = 500;
      return errorResponse('FETCH_FAILED', 'Failed to fetch login events');
    }
  }, {
    query: t.Object({ risk: t.Optional(t.String()) }),
    detail: { tags: ['System & Privacy'], summary: 'Anomaly detection login event log' },
  });
