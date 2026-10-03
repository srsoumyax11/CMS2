import { describe, expect, it, beforeAll } from 'bun:test';
import { Elysia } from 'elysia';
import { authRoutes } from '../src/routes/auth';
import { jwtAuth, requireRoles } from '../src/middleware/auth';
import { signAccessToken, signRefreshToken, verifyToken } from '../src/utils/jwt';
import { hashPassword, verifyPassword } from '../src/utils/password';
import { loginSchema, registerSchema } from '../src/schemas/auth';
import { prisma } from '../src/config/prisma';

describe('🔒 Security Audit Remediation & Auth Test Suite', () => {
  let testUser: { id: string; userCode: string; email: string; password: string };

  beforeAll(async () => {
    // Create a dedicated test user in the database
    const email = `sec_test_${Date.now()}@example.com`;
    const password = 'SecurePassword123!';
    const passwordHash = await hashPassword(password);
    const userCode = `SEC_USER_${Date.now()}`;

    const created = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: userCode,
        full_name: 'Security Test User',
        email,
        password_hash: passwordHash,
        status: 'active',
      },
    });

    testUser = { id: created.id, userCode, email, password };
  });

  describe('SEC-001: JWT Authentication Hardening', () => {
    it('should reject hardcoded mock tokens (mock_jwt_token_...)', async () => {
      const app = new Elysia().use(jwtAuth).get('/test-protected', ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { success: false, message: 'Unauthorized' };
        }
        return { success: true, user };
      });

      const response = await app.handle(
        new Request('http://localhost/test-protected', {
          headers: { Authorization: `Bearer mock_jwt_token_${testUser.id}` },
        })
      );

      expect(response.status).toBe(401);
    });

    it('should accept valid signed JWT access tokens', async () => {
      const validToken = signAccessToken({ sub: testUser.id, userCode: testUser.userCode });

      const app = new Elysia().use(jwtAuth).get('/test-protected', ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { success: false, message: 'Unauthorized' };
        }
        return { success: true, user };
      });

      const response = await app.handle(
        new Request('http://localhost/test-protected', {
          headers: { Authorization: `Bearer ${validToken}` },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.user.id).toBe(testUser.id);
    });

    it('should reject tampered or invalid signature JWT tokens', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature';

      const app = new Elysia().use(jwtAuth).get('/test-protected', ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return { success: false, message: 'Unauthorized' };
        }
        return { success: true, user };
      });

      const response = await app.handle(
        new Request('http://localhost/test-protected', {
          headers: { Authorization: `Bearer ${invalidToken}` },
        })
      );

      expect(response.status).toBe(401);
    });

    it('should verify token utility methods (signAccessToken & verifyToken)', () => {
      const token = signAccessToken({ sub: testUser.id, userCode: testUser.userCode });
      const decoded = verifyToken(token);

      expect(decoded).not.toBeNull();
      expect(decoded?.sub).toBe(testUser.id);
      expect(decoded?.type).toBe('access');
    });
  });

  describe('SEC-003: Password Hashing Integrity', () => {
    it('should hash passwords using Bun Argon2id & verify correctly', async () => {
      const rawPassword = 'MySecretPassword123!';
      const hash = await hashPassword(rawPassword);

      expect(hash).not.toBe(rawPassword);
      expect(hash.startsWith('$argon2')).toBe(true);

      const isValid = await verifyPassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('SEC-002: Zod Input Validation', () => {
    it('should validate registration payloads using Zod schema', () => {
      const validPayload = {
        email: 'test@college.edu',
        phone: '+919876543210',
        fullName: 'Test Student',
        password: 'ValidPassword123!',
      };

      const result = registerSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email formats in Zod schema', () => {
      const invalidPayload = {
        email: 'not-an-email',
        phone: '+919876543210',
        fullName: 'Test Student',
        password: 'ValidPassword123!',
      };

      const result = registerSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });
});
