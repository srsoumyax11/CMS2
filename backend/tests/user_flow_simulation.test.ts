import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { authRoutes } from '../src/routes/auth';
import { onboardingRoutes } from '../src/routes/onboarding';

const app = new Elysia({ prefix: '/api/v1' })
  .use(authRoutes)
  .use(onboardingRoutes);

describe('Real-World End-to-End User Registration & 2FA Authentication Flow Simulation', () => {
  const userEmail = `sim_user_${Date.now()}@campus7.edu`;
  const userPassword = 'Campus7UserPass!';
  const userFullName = 'Alex Rivera';

  let otpId: string;
  let userId: string;
  let userToken: string;
  let mfaOtpId: string;

  it('Step 1: User arrives at site and requests registration OTP', async () => {
    const req = new Request('http://localhost/api/v1/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: userEmail,
        channel: 'email',
        purpose: 'verify',
      }),
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.otpId).toBeDefined();
    expect(json.data.devOtpHint).toBe('123456');

    otpId = json.data.otpId;
  });

  it('Step 2: User verifies 6-digit OTP code', async () => {
    const req = new Request('http://localhost/api/v1/auth/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        otpId,
        code: '123456',
      }),
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.verified).toBe(true);
  });

  it('Step 3: User completes registration with verified OTP and password', async () => {
    const req = new Request('http://localhost/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: userEmail,
        password: userPassword,
        fullName: userFullName,
        otpId,
      }),
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.userId).toBeDefined();
    expect(json.data.userCode).toBeDefined();
    expect(json.data.status).toBe('active');
    expect(json.data.token).toBeDefined();

    userId = json.data.userId;
    userToken = json.data.token;
  });

  it('Step 4: User performs standard login (2FA disabled by default)', async () => {
    const req = new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: userEmail,
        password: userPassword,
      }),
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.requires2FA).toBeUndefined();
    expect(json.data.token).toBeDefined();
    expect(json.data.userId).toBe(userId);
  });

  it('Step 5: User accesses protected onboarding status (/me/onboarding)', async () => {
    const req = new Request('http://localhost/api/v1/me/onboarding', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.userId).toBe(userId);
    expect(json.data.status).toBe('active');
  });

  it('Step 6: User enables 2FA / MFA in account settings', async () => {
    const req = new Request('http://localhost/api/v1/auth/mfa/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.mfaEnabled).toBe(true);
  });

  it('Step 7: User attempts login with 2FA enabled -> Server triggers 2FA OTP challenge', async () => {
    const req = new Request('http://localhost/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: userEmail,
        password: userPassword,
      }),
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.requires2FA).toBe(true);
    expect(json.data.otpId).toBeDefined();
    expect(json.data.userId).toBe(userId);
    expect(json.data.devOtpHint).toBe('123456');

    mfaOtpId = json.data.otpId;
  });

  it('Step 8: User completes 2FA verification code challenge to complete login', async () => {
    const req = new Request('http://localhost/api/v1/auth/2fa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        otpId: mfaOtpId,
        code: '123456',
        userId,
      }),
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.token).toBeDefined();
    expect(json.data.userId).toBe(userId);

    // Save 2FA authenticated token
    userToken = json.data.token;
  });

  it('Step 9: User lists active login sessions/devices', async () => {
    const req = new Request('http://localhost/api/v1/auth/devices', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('Step 10: User logs out cleanly', async () => {
    const req = new Request('http://localhost/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.userId).toBe(userId);
  });
});
