import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './routes/auth';
import { studentRoutes } from './routes/student';
import { wardenRoutes } from './routes/warden';
import { facultyRoutes } from './routes/faculty';
import { parentRoutes } from './routes/parent';
import { adminRoutes } from './routes/admin';
import { sharedRoutes } from './routes/shared';
import { prisma } from './config/prisma';

const app = new Elysia()
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
  .onError(({ code, error, set }) => {
    console.error(`[Error] ${code}:`, error);
    set.status = 500;
    const msg = error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
    return { success: false, error: msg };
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
      .use(studentRoutes)
      .use(wardenRoutes)
      .use(facultyRoutes)
      .use(parentRoutes)
      .use(adminRoutes)
      .use(sharedRoutes)
  )
  .listen(3000);

console.log(`🦊 Elysia API is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Interactive Swagger API Docs available at http://${app.server?.hostname}:${app.server?.port}/swagger`);
