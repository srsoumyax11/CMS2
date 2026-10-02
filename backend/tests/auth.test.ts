import { describe, expect, it, beforeAll } from 'bun:test';
import { authRoutes } from '../src/routes/auth';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';

const app = new Elysia().use(authRoutes);

describe('Auth API Routes (/api/v1/auth)', () => {
  const testUserCode = `TEST_USER_${Date.now()}`;
  const testPassword = 'SecurePassword123!';
  const testEmail = `student_${Date.now()}@example.com`;
  let testUserId: string;

  beforeAll(async () => {
    // Seed a test active user in the database
    const passwordHash = await hashPassword(testPassword);
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: testUserCode,
        email: testEmail,
        full_name: 'Test Student',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    testUserId = user.id;
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid userCode and password', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: testUserCode,
            password: testPassword,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.userCode).toBe(testUserCode);
      expect(json.data.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: testUserCode,
            password: 'WrongPassword123!',
          }),
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for non-existent identity', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: 'NON_EXISTENT_USER_999',
            password: testPassword,
          }),
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('INVALID_CREDENTIALS');
    });

    it('should fail schema validation for short password', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: testUserCode,
            password: '123',
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe('OTP & Password Reset Flow', () => {
    let generatedOtpId: string;

    it('should generate OTP successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: testEmail,
            channel: 'email',
            purpose: 'reset',
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.target).toBe(testEmail);
      expect(json.data.otpId).toBeDefined();
      generatedOtpId = json.data.otpId;
    });

    it('should reject verification with invalid OTP code', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            otpId: generatedOtpId,
            code: '999999', // Wrong code
          }),
        })
      );

      expect(response.status).toBe(401);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('INVALID_OTP');
    });

    it('should verify OTP successfully with correct dev code', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            otpId: generatedOtpId,
            code: '123456', // Dev code
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.verified).toBe(true);
    });

    it('should reject double consumption of the same OTP', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            otpId: generatedOtpId,
            code: '123456',
          }),
        })
      );

      expect(response.status).toBe(400);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('OTP_ALREADY_USED');
    });

    it('should reset password successfully using verified OTP', async () => {
      const newPassword = 'NewSuperPassword456!';
      const response = await app.handle(
        new Request('http://localhost/auth/password/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: testEmail,
            otpId: generatedOtpId,
            newPassword,
          }),
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);

      // Verify login with new password
      const loginRes = await app.handle(
        new Request('http://localhost/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: testEmail,
            password: newPassword,
          }),
        })
      );
      expect(loginRes.status).toBe(200);
    });
  });

  describe('Session & Device Management', () => {
    it('should retrieve active devices for authenticated user', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/devices', {
          method: 'GET',
          headers: {
            Authorization: `Bearer mock_jwt_token_${testUserId}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('should reject device listing for unauthenticated request', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/devices', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(401);
    });

    it('should logout user session successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer mock_jwt_token_${testUserId}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.userId).toBe(testUserId);
    });

    it('should revoke specific device session', async () => {
      const deviceId = crypto.randomUUID();
      const response = await app.handle(
        new Request(`http://localhost/auth/devices/${deviceId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer mock_jwt_token_${testUserId}`,
          },
        })
      );

      expect(response.status).toBe(200);
      const json = await response.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.deviceId).toBe(deviceId);
    });
  });

  describe('POST /auth/role-request', () => {
    it('should return 404 for invalid role code', async () => {
      const response = await app.handle(
        new Request('http://localhost/auth/role-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: testUserId,
            roleCode: 'INVALID_ROLE_CODE_XYZ',
          }),
        })
      );

      expect(response.status).toBe(404);
      const json = await response.json() as any;
      expect(json.success).toBe(false);
      expect(json.error).toBe('ROLE_NOT_FOUND');
    });
  });

  describe('Direct Registration & Token Utilities', () => {
    it('should register a new account after OTP verification', async () => {
      const testTarget = `newuser_${Date.now()}@campus.edu`;

      // 1. Send OTP
      const otpSendRes = await app.handle(
        new Request('http://localhost/auth/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: testTarget,
            channel: 'email',
            purpose: 'verify',
          }),
        })
      );
      const sendJson = await otpSendRes.json() as any;
      const regOtpId = sendJson.data.otpId;

      // 2. Verify OTP
      await app.handle(
        new Request('http://localhost/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            otpId: regOtpId,
            code: '123456',
          }),
        })
      );

      // 3. Register Account
      const regRes = await app.handle(
        new Request('http://localhost/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: testTarget,
            password: 'NewUserSecret123!',
            fullName: 'New User Registered',
            otpId: regOtpId,
          }),
        })
      );

      expect(regRes.status).toBe(200);
      const regJson = await regRes.json() as any;
      expect(regJson.success).toBe(true);
      expect(regJson.data.fullName).toBe('New User Registered');
    });

    it('should refresh access token', async () => {
      const res = await app.handle(
        new Request('http://localhost/auth/token/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: 'mock_refresh_token_123' }),
        })
      );

      expect(res.status).toBe(200);
      const json = await res.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.token).toBeDefined();
    });

    it('should verify emergency backup code', async () => {
      const res = await app.handle(
        new Request('http://localhost/auth/backup-code/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: testUserCode,
            backupCode: 'BACKUP-123456',
          }),
        })
      );

      expect(res.status).toBe(200);
      const json = await res.json() as any;
      expect(json.success).toBe(true);
      expect(json.data.userCode).toBe(testUserCode);
    });

    it('should fetch login security alerts for authenticated user', async () => {
      const res = await app.handle(
        new Request('http://localhost/auth/login-alerts', {
          method: 'GET',
          headers: {
            Authorization: `Bearer mock_jwt_token_${testUserId}`,
          },
        })
      );

      expect(res.status).toBe(200);
      const json = await res.json() as any;
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });
  });
});
