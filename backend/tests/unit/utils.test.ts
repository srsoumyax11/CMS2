import { describe, expect, it } from 'bun:test';
import { signAccessToken, signRefreshToken, verifyToken } from '../../src/utils/jwt';
import { hashPassword, verifyPassword } from '../../src/utils/password';
import { successResponse, errorResponse } from '../../src/utils/response';

describe('Phase 16 Unit Tests: Utility Modules', () => {
  describe('JWT Utility (utils/jwt.ts)', () => {
    it('should sign and verify valid access tokens', () => {
      const payload = { sub: 'user-uuid-123', roles: ['student'] };
      const token = signAccessToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.sub).toBe('user-uuid-123');
    });

    it('should sign refresh token with longer duration', () => {
      const payload = { sub: 'user-uuid-456' };
      const refreshToken = signRefreshToken(payload);
      expect(refreshToken).toBeDefined();

      const decoded = verifyToken(refreshToken);
      expect(decoded?.sub).toBe('user-uuid-456');
    });

    it('should return null for malformed or invalid JWT strings', () => {
      expect(verifyToken('invalid.jwt.token')).toBeNull();
      expect(verifyToken('')).toBeNull();
    });
  });

  describe('Password Hashing Utility (utils/password.ts)', () => {
    it('should hash password and verify correct plain text', async () => {
      const plainPassword = 'ComplexPassword123!';
      const hash = await hashPassword(plainPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plainPassword);

      const isValid = await verifyPassword(plainPassword, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect plain text password during verification', async () => {
      const hash = await hashPassword('CorrectPassword123!');
      const isValid = await verifyPassword('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Response Formatting Utility (utils/response.ts)', () => {
    it('should format success responses with data envelope', () => {
      const res = successResponse({ id: '123' }, 'Operation successful');
      expect(res.success).toBe(true);
      expect(res.message).toBe('Operation successful');
      expect(res.data?.id).toBe('123');
    });

    it('should format error responses with code and message', () => {
      const res = errorResponse('INVALID_INPUT', 'Field missing');
      expect(res.success).toBe(false);
      expect(res.error).toBe('INVALID_INPUT');
      expect(res.message).toBe('Field missing');
    });

    it('should sanitize raw Prisma tracebacks and database connection error strings', () => {
      delete process.env.EXPOSE_RAW_ERRORS;
      const rawPrismaError = `\nInvalid \`prisma.role_approval_rules.findMany()\` invocation in\nD:\\APP_DEV\\PS7\\backend\\src\\routes\\onboarding.ts:75:56\nCan't reach database server at \`127.0.0.1:54322\``;
      const res = errorResponse('FETCH_FAILED', rawPrismaError, 'Failed to fetch roles');

      expect(res.success).toBe(false);
      expect(res.error).toBe('FETCH_FAILED');
      expect(res.message).not.toContain('127.0.0.1');
      expect(res.message).not.toContain('prisma');
      expect(res.message).toContain('Database service is temporarily unavailable');
    });

    it('should return raw error traceback when EXPOSE_RAW_ERRORS is set to true for debugging', () => {
      process.env.EXPOSE_RAW_ERRORS = 'true';
      const rawPrismaError = `\nInvalid \`prisma.role_approval_rules.findMany()\` invocation in\nD:\\APP_DEV\\PS7\\backend\\src\\routes\\onboarding.ts:75:56\nCan't reach database server at \`127.0.0.1:54322\``;
      const res = errorResponse('FETCH_FAILED', rawPrismaError, 'Failed to fetch roles');

      expect(res.success).toBe(false);
      expect(res.message).toContain('127.0.0.1:54322');
      delete process.env.EXPOSE_RAW_ERRORS;
    });
  });
});
