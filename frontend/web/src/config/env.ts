import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
  VITE_APP_TITLE: z.string().default('Campus CMS'),
  VITE_ENABLE_ANALYTICS: z.enum(['true', 'false']).optional().default('false'),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error(`Environment Validation Error: ${JSON.stringify(_env.error.flatten().fieldErrors, null, 2)}`);
}

export const env = _env.data;
