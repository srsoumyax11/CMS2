import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL environment variable is required')
    .default('postgresql://postgres:postgres@localhost:54322/postgres'),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters long')
    .default('super_secret_jwt_key_campus7_production_hardening_2026'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET must be at least 16 characters long')
    .default('super_secret_jwt_refresh_key_campus7_production_hardening_2026'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  MAX_FILE_SIZE_BYTES: z.coerce.number().default(10485760), // 10MB
  SKIP_RATE_LIMIT: z.enum(['true', 'false']).default('false'),
  ENABLE_TEST_RATE_LIMIT: z.enum(['true', 'false']).default('false'),
});

export const env = envSchema.parse(process.env);
