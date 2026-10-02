import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: 'College Management System API',
          version: '1.0.0',
          description: 'Comprehensive API documentation for College Management System',
        },
      },
    })
  )
  .decorate('prisma', prisma)
  .onError(({ code, error, set }) => {
    console.error(`[Error] ${code}:`, error);
    set.status = 500;
    return { success: false, error: error.message };
  })
  .get('/', () => {
    return {
      success: true,
      message: 'College Management System API is running 🚀',
      version: '1.0.0',
      docs: '/swagger',
    };
  })
  .get('/api/health', async ({ prisma }) => {
    try {
      // Test the database connection
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
  .listen(3000);

console.log(`🦊 Elysia API is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`📚 Interactive Swagger API Docs available at http://${app.server?.hostname}:${app.server?.port}/swagger`);
