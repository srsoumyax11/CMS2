import { PrismaClient } from '@prisma/client';

// Single source of truth for Prisma Client connection
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
