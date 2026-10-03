import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { env } from './env';

// Single source of truth for Prisma Client connection with pool configuration & query metrics
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export async function disconnectPrisma(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info({ message: 'Prisma Client database connection pool safely disconnected.' });
  } catch (error) {
    logger.error({ message: 'Error disconnecting Prisma Client', meta: { error } });
  }
}
