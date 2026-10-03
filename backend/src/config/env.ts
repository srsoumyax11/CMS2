import { z } from 'zod';
import { logger } from './logger';

const toLowerBool = (val: unknown, defaultVal: string) => {
  if (typeof val === 'string') return val.trim().toLowerCase();
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return defaultVal;
};

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
  CORS_ORIGINS: z.string().default('http://localhost:8081,http://localhost:3000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  MAX_FILE_SIZE_BYTES: z.coerce.number().default(10485760), // 10MB
  SKIP_RATE_LIMIT: z.preprocess((v) => toLowerBool(v, 'false'), z.enum(['true', 'false'])).default('false'),
  ENABLE_TEST_RATE_LIMIT: z.preprocess((v) => toLowerBool(v, 'false'), z.enum(['true', 'false'])).default('false'),
  ENABLE_SWAGGER: z.preprocess((v) => toLowerBool(v, process.env.NODE_ENV === 'production' ? 'false' : 'true'), z.enum(['true', 'false'])).default('true'),
  EXPOSE_RAW_ERRORS: z.preprocess((v) => toLowerBool(v, 'false'), z.enum(['true', 'false'])).default('false'),
  COOKIE_SECURE: z.preprocess((v) => toLowerBool(v, process.env.NODE_ENV === 'production' ? 'true' : 'false'), z.enum(['true', 'false'])).default('false'),
  COOKIE_SAMESITE: z.preprocess((v) => (typeof v === 'string' ? v.trim().toLowerCase() : 'strict'), z.enum(['lax', 'strict', 'none'])).default('strict'),
  COOKIE_DOMAIN: z.string().optional(),
});

const parsedEnv = envSchema.parse(process.env);

// Safety Guard: Force EXPOSE_RAW_ERRORS to false in production & log warning
if (parsedEnv.NODE_ENV === 'production' && parsedEnv.EXPOSE_RAW_ERRORS === 'true') {
  logger.warn({
    message: '[Security Warning] EXPOSE_RAW_ERRORS=true is prohibited in production. Forcing EXPOSE_RAW_ERRORS to false.',
  });
  (parsedEnv as any).EXPOSE_RAW_ERRORS = 'false';
}

// Safety Guard: Force ENABLE_SWAGGER default to false in production if not explicitly enabled
if (parsedEnv.NODE_ENV === 'production' && process.env.ENABLE_SWAGGER === undefined) {
  (parsedEnv as any).ENABLE_SWAGGER = 'false';
}

export const env = parsedEnv;
