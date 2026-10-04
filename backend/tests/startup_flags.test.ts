import { describe, expect, it } from 'bun:test';

describe('Production Environment Flags & Startup Safety', () => {
  it('forces EXPOSE_RAW_ERRORS to false in production mode even if set to true', () => {
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      process.env.EXPOSE_RAW_ERRORS = 'true';
      delete (require.cache as any)[require.resolve('../src/config/env')];

      const { env } = require('../src/config/env');
      expect(env.EXPOSE_RAW_ERRORS).toBe('false');
    } finally {
      process.env = originalEnv;
      delete (require.cache as any)[require.resolve('../src/config/env')];
    }
  });

  it('defaults ENABLE_SWAGGER to false in production mode when undefined', () => {
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ENABLE_SWAGGER;
      delete (require.cache as any)[require.resolve('../src/config/env')];

      const { env } = require('../src/config/env');
      expect(env.ENABLE_SWAGGER).toBe('false');
    } finally {
      process.env = originalEnv;
      delete (require.cache as any)[require.resolve('../src/config/env')];
    }
  });

  it('allows ENABLE_SWAGGER to default to true in development mode', () => {
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'development';
      delete process.env.ENABLE_SWAGGER;
      delete (require.cache as any)[require.resolve('../src/config/env')];

      const { env } = require('../src/config/env');
      expect(env.ENABLE_SWAGGER).toBe('true');
    } finally {
      process.env = originalEnv;
      delete (require.cache as any)[require.resolve('../src/config/env')];
    }
  });

  it('forces LOG_FORMAT to json in production mode even if set to pretty', () => {
    const originalEnv = { ...process.env };
    try {
      process.env.NODE_ENV = 'production';
      process.env.LOG_FORMAT = 'pretty';
      delete (require.cache as any)[require.resolve('../src/config/env')];

      const { env } = require('../src/config/env');
      expect(env.LOG_FORMAT).toBe('json');
    } finally {
      process.env = originalEnv;
      delete (require.cache as any)[require.resolve('../src/config/env')];
    }
  });
});
