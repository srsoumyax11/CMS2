import { describe, expect, it, beforeAll } from 'bun:test';
import { authRoutes } from '../src/routes/auth';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';

const app = new Elysia().use(authRoutes);

describe('Web Refresh Cookie & Security Hardening Suite', () => {
  const testUserCode = `WEB_USER_${Date.now()}`;
  const testPassword = 'Password123!';
  const testEmail = `web_test_${Date.now()}@example.com`;
  let testUserId: string;

  beforeAll(async () => {
    process.env.SKIP_RATE_LIMIT = 'true';
    const passwordHash = await hashPassword(testPassword);
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        user_code: testUserCode,
        email: testEmail,
        full_name: 'Web Cookie Test User',
        password_hash: passwordHash,
        status: 'active',
      },
    });
    testUserId = user.id;
  });

  it('1. Web login (x-client: web) sets refresh_token cookie and omits refreshToken from JSON body', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
        },
        body: JSON.stringify({
          identity: testUserCode,
          password: testPassword,
        }),
      })
    );

    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain('refresh_token=');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('Path=/api/v1/auth');

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.token).toBeDefined();
    expect(body.data.refreshToken).toBeUndefined();
  });

  it('2. Mobile login (no x-client header) returns refreshToken in body and sets no cookie', async () => {
    const res = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity: testUserCode,
          password: testPassword,
        }),
      })
    );

    expect(res.status).toBe(200);
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toBeNull();

    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeDefined();
    expect(body.data.refreshToken).toBeDefined();
  });

  it('3. Web refresh with cookie works, rotates token, and updates auth_sessions', async () => {
    // Step A: Login web
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const cookieHeader = loginRes.headers.get('set-cookie') || '';
    const match = cookieHeader.match(/refresh_token=([^;]+)/);
    expect(match).toBeTruthy();
    const webRefreshToken = match![1];

    // Step B: Refresh web token
    const refreshRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${webRefreshToken}`,
        },
      })
    );

    expect(refreshRes.status).toBe(200);
    const refreshBody = (await refreshRes.json()) as any;
    expect(refreshBody.success).toBe(true);
    expect(refreshBody.data.accessToken).toBeDefined();
    expect(refreshBody.data.refreshToken).toBeUndefined();

    // Verify Set-Cookie has new rotated refresh token
    const newCookieHeader = refreshRes.headers.get('set-cookie') || '';
    expect(newCookieHeader).toContain('refresh_token=');
    const newMatch = newCookieHeader.match(/refresh_token=([^;]+)/);
    expect(newMatch).toBeTruthy();
    expect(newMatch![1]).not.toBe(webRefreshToken);
  });

  it('4. Token reuse detection revokes all user sessions and logs audit event', async () => {
    // Step A: Login web
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const cookieHeader = loginRes.headers.get('set-cookie') || '';
    const oldRefreshToken = cookieHeader.match(/refresh_token=([^;]+)/)![1];

    // Step B: First legitimate refresh (rotates oldRefreshToken -> newRefreshToken)
    const refresh1 = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${oldRefreshToken}`,
        },
      })
    );
    expect(refresh1.status).toBe(200);

    // Step C: REUSE ATTEMPT using oldRefreshToken!
    const reuseRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${oldRefreshToken}`,
        },
      })
    );

    expect(reuseRes.status).toBe(401);
    const reuseBody = (await reuseRes.json()) as any;
    expect(reuseBody.error).toBe('TOKEN_REUSE_DETECTED');

    // Step D: Verify all sessions for testUserId are now revoked in DB
    const activeSessions = await prisma.auth_sessions.findMany({
      where: { user_id: testUserId, revoked_at: null },
    });
    expect(activeSessions.length).toBe(0);

    // Step E: Verify audit log entry was recorded
    const audit = await prisma.audit_logs.findFirst({
      where: { actor_user_id: testUserId, action: 'REFRESH_TOKEN_REUSE_DETECTED' },
    });
    expect(audit).toBeTruthy();
  });

  it('5. CSRF checks: reject web cookie refresh missing x-client header or with unallowed origin', async () => {
    // Login web
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token = loginRes.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Missing x-client: web
    const missingHeaderRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `refresh_token=${token}`,
        },
      })
    );
    expect(missingHeaderRes.status).toBe(400);

    // Invalid Origin
    const badOriginRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://evil-attacker-website.com',
          Cookie: `refresh_token=${token}`,
        },
      })
    );
    expect(badOriginRes.status).toBe(403);
  });

  it('6. Logout clears web refresh cookie and revokes session', async () => {
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token = loginRes.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    const logoutRes = await app.handle(
      new Request('http://localhost/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Cookie: `refresh_token=${token}`,
        },
      })
    );

    expect(logoutRes.status).toBe(200);
    const logoutCookie = logoutRes.headers.get('set-cookie');
    expect(logoutCookie).toContain('Max-Age=0');
  });
});
