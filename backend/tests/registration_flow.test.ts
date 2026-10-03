import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { authRoutes } from '../src/routes/auth';
import { onboardingRoutes } from '../src/routes/onboarding';

const app = new Elysia({ prefix: '/api/v1' })
  .use(authRoutes)
  .use(onboardingRoutes);

describe('User Registration Only (OTP Verification & Direct Login)', () => {
  const userEmail = `reg_user_${Date.now()}@campus7.edu`;
  const userPassword = 'Campus7UserPass123!';
  const userFullName = 'Sam Student';

  let otpId: string;
  let userId: string;
  let userToken: string;

  it('Step 1: User enters email and requests registration OTP', async () => {
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

  it('Step 2: User enters the 6-digit OTP received via Email/SMS', async () => {
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

  it('Step 3: User completes registration (Password + Full Name + Verified OTP)', async () => {
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
    expect(json.data.token).toBeDefined();
    expect(json.data.status).toBe('active');

    userId = json.data.userId;
    userToken = json.data.token;
  });

  it('Step 4: User logs in using registered credentials (No 2FA required)', async () => {
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

    // Refresh token with latest login session
    userToken = json.data.token;
  });

  it('Step 5: User accesses protected onboarding status endpoint (/me/onboarding)', async () => {
    const req = new Request('http://localhost/api/v1/me/onboarding', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const res = await app.handle(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.userId).toBe(userId);
    expect(json.data.status).toBe('active');
  });
});
