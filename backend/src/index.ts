import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './routes/auth';
import { onboardingRoutes } from './routes/onboarding';
import { approvalsRoutes, adminGovernanceRoutes } from './routes/approvals';
import { campusOpsRoutes } from './routes/campus_ops';
import { financeHealthRoutes } from './routes/finance_health';
import { transportPlacementsRoutes } from './routes/transport_placements';
import { studentRoutes } from './routes/student';
import { wardenRoutes } from './routes/warden';
import { facultyRoutes } from './routes/faculty';
import { parentRoutes } from './routes/parent';
import { adminRoutes } from './routes/admin';
import { sharedRoutes } from './routes/shared';
import { disconnectPrisma, prisma } from './config/prisma';
import { requestLogger } from './middleware/request-logger';
import { logger } from './config/logger';

const PORT = Number(process.env.PORT) || 3000;

const app = new Elysia()
  .use(requestLogger)
  .use(
    swagger({
      documentation: {
        info: {
          title: 'College Management System API',
          version: '1.0.0',
          description: 'Comprehensive API documentation for College Management System',
        },
        tags: [
          { name: 'Authentication', description: 'Login, OTP, Self Signup & Role Requests' },
          { name: 'Signup & Onboarding', description: 'Self-signup, contact updates, emergency contacts & onboarding' },
          { name: 'Role Requests', description: 'User-side role application workflow' },
          { name: 'Role Approvals', description: 'Approver queue, decisions & auto-checks' },
          { name: 'Parent Link Flow', description: 'Parent child linking and consent management' },
          { name: 'Admin Governance', description: 'Role approval rules, pre-reg identity imports & settings' },
          { name: 'Academic Admin', description: 'Academic years, terms, periods, and location tree' },
          { name: 'Student Invoices', description: 'Student invoices and fee schedules' },
          { name: 'Scholarships', description: 'Scholarship browsing and applications' },
          { name: 'Library Desk', description: 'Library catalog, physical book loans, and returns' },
          { name: 'Finance Admin', description: 'Fee heads, invoice generation, waiver requests, and late fine runs' },
          { name: 'Mess & Hostel', description: 'Mess dish master catalog, daily meal menu, and bed allocations' },
          { name: 'Exam Management', description: 'Exam paper schedule and automated seating plans' },
          { name: 'Safety & Health', description: 'SOS escalation hierarchy, safety cases, counselling, and medical clinic' },
          { name: 'Transport Fleet', description: 'Fleet vehicles, drivers, trips, and GPS telemetry' },
          { name: 'Clubs & Events', description: 'Student clubs and event awards' },
          { name: 'Placement Portal', description: 'Placement companies, drive eligibility, and candidate selection' },
          { name: 'System & Privacy', description: 'Quiet hours, access audit logs, consent records, app config, and retention' },
          { name: 'Student', description: 'Student persona endpoints' },
          { name: 'Warden', description: 'Warden & Hostel operations endpoints' },
          { name: 'Faculty', description: 'Faculty & Classroom management endpoints' },
          { name: 'Parent', description: 'Parent portal endpoints' },
          { name: 'Admin', description: 'Admin & Governance endpoints' },
          { name: 'Shared Platform', description: 'Files, Notifications, QR & Webhooks' },
        ],
      },
    })
  )
  .onError(({ code, error, set, requestId }) => {
    const errorId = requestId || crypto.randomUUID();
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Route not found. Make sure to use /api/v1 prefix and correct HTTP method.',
        requestId: errorId,
      };
    }
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: error.message || 'Validation error',
        requestId: errorId,
      };
    }

    const msg = error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error);

    logger.error({
      message: `[Unhandled Error] ${code}: ${msg}`,
      requestId: errorId,
      meta: { code, stack: error instanceof Error ? error.stack : undefined },
    });

    set.status = 500;
    return {
      success: false,
      error: msg,
      requestId: errorId,
    };
  })
  .get('/', () => {
    return {
      success: true,
      message: 'College Management System API is running 🚀',
      version: '1.0.0',
      docs: '/swagger',
    };
  })
  .get('/api/v1/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        success: true,
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  })
  // Mount API v1 routes
  .group('/api/v1', (app) =>
    app
      .use(authRoutes)
      .use(onboardingRoutes)
      .use(approvalsRoutes)
      .use(adminGovernanceRoutes)
      .use(campusOpsRoutes)
      .use(financeHealthRoutes)
      .use(transportPlacementsRoutes)
      .use(studentRoutes)
      .use(wardenRoutes)
      .use(facultyRoutes)
      .use(parentRoutes)
      .use(adminRoutes)
      .use(sharedRoutes)
  )
  .listen(PORT);

logger.info({
  message: `Elysia API is running at http://${app.server?.hostname}:${app.server?.port}`,
});
logger.info({
  message: `Interactive Swagger API Docs available at http://${app.server?.hostname}:${app.server?.port}/swagger`,
});

const handleShutdown = async (signal: string) => {
  logger.info({ message: `Received ${signal}. Shutting down server gracefully...` });
  await disconnectPrisma();
  process.exit(0);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

