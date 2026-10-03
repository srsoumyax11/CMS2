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
  });
});
