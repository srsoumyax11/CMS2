import { describe, expect, it, beforeAll } from 'bun:test';
import { createRateLimiter } from '../src/middleware/rate-limit';
import { sharedRoutes } from '../src/routes/shared';
import { env } from '../src/config/env';
import { prisma } from '../src/config/prisma';
import { signAccessToken } from '../src/utils/jwt';
import { hashPassword } from '../src/utils/password';
import { Elysia } from 'elysia';

describe('Phase 15: Security & Resource Management Tuning Tests', () => {
  let validToken: string;

  beforeAll(async () => {
    process.env.ENABLE_TEST_RATE_LIMIT = 'true';
    const passwordHash = await hashPassword('TestPass123!');
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: `FILE_TEST_${Date.now()}`,
        email: `file_tester_${Date.now()}@campus.edu`,
        full_name: 'File Tester',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    validToken = signAccessToken({ sub: user.id });
  });

  describe('Runtime Environment & Secrets Validation (SEC-005)', () => {
    it('should load default environment configuration successfully', () => {
      expect(env.PORT).toBeDefined();
      expect(typeof env.PORT).toBe('number');
      expect(env.JWT_SECRET.length).toBeGreaterThanOrEqual(16);
      expect(env.DATABASE_URL).toContain('postgresql://');
    });
  });

  describe('Endpoint Rate Limiting Middleware (SEC-004)', () => {
    it('should enforce rate limiting threshold and return 429 when exceeded', async () => {
      delete process.env.SKIP_RATE_LIMIT;
      const rateLimitedApp = new Elysia()
        .use(createRateLimiter(60000, 3, `test_rl_${crypto.randomUUID()}`))
        .get('/test-rate-limit', () => ({ success: true, message: 'allowed' }));

      // 1st request -> 200
      const res1 = await rateLimitedApp.handle(new Request('http://localhost/test-rate-limit'));
      expect(res1.status).toBe(200);

      // 2nd request -> 200
      const res2 = await rateLimitedApp.handle(new Request('http://localhost/test-rate-limit'));
      expect(res2.status).toBe(200);

      // 3rd request -> 200
      const res3 = await rateLimitedApp.handle(new Request('http://localhost/test-rate-limit'));
      expect(res3.status).toBe(200);

      // 4th request -> 429 Too Many Requests
      const res4 = await rateLimitedApp.handle(new Request('http://localhost/test-rate-limit'));
      expect(res4.status).toBe(429);
      expect(res4.headers.get('Retry-After')).toBeDefined();
      const json4 = (await res4.json()) as any;
      expect(json4.success).toBe(false);
      expect(json4.error).toContain('Too many requests');
      process.env.SKIP_RATE_LIMIT = 'true';
    });
  });

  describe('File Upload Security Hardening (SEC-006)', () => {
    const app = new Elysia().use(sharedRoutes);

    it('should reject file upload exceeding 10MB limit with HTTP 400', async () => {
      const res = await app.handle(
        new Request('http://localhost/files/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validToken}`,
          },
          body: JSON.stringify({
            fileName: 'large_video.mp4',
            mimeType: 'video/mp4',
            sizeBytes: 15 * 1024 * 1024, // 15MB
          }),
        })
      );

      expect(res.status).toBe(400);
      const json = (await res.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('FILE_TOO_LARGE');
    });

    it('should reject unsupported MIME types with HTTP 400', async () => {
      const res = await app.handle(
        new Request('http://localhost/files/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validToken}`,
          },
          body: JSON.stringify({
            fileName: 'script.exe',
            mimeType: 'application/x-msdownload',
            sizeBytes: 1024 * 1024,
          }),
        })
      );

      expect(res.status).toBe(400);
      const json = (await res.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('INVALID_MIME_TYPE');
    });

    it('should generate signed upload URL for valid image file within limits', async () => {
      const res = await app.handle(
        new Request('http://localhost/files/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validToken}`,
          },
          body: JSON.stringify({
            fileName: 'student_photo.jpg',
            mimeType: 'image/jpeg',
            sizeBytes: 2 * 1024 * 1024, // 2MB
          }),
        })
      );

      expect(res.status).toBe(200);
      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.data.uploadUrl).toBeDefined();
    });
  });
});
