import { describe, expect, it, beforeAll } from 'bun:test';
import { authRoutes } from '../src/routes/auth';
import { Elysia } from 'elysia';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/utils/password';
import { cors } from '@elysiajs/cors';
import { env } from '../src/config/env';
import { signAccessToken } from '../src/utils/jwt';
import { getClientIp } from '../src/utils/session';

const corsOrigins = env.CORS_ORIGINS.split(',').map((s) => s.trim());
const app = new Elysia()
  .use(cors({ origin: corsOrigins, credentials: true }))
  .use(authRoutes);

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
    expect(setCookie).toContain('Max-Age=604800');

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

  it('4. Refresh race: token reuse INSIDE grace window (<= 15s) is accepted EXACTLY ONCE', async () => {
    // Step A: Web login
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token = loginRes.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Step B: Tab 1 refreshes (rotates token: sets revoked_at and rotated_at)
    const tab1Res = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token}`,
        },
      })
    );
    expect(tab1Res.status).toBe(200);

    // Step C: Tab 2 refreshes almost simultaneously with the SAME old token (1st grace usage)
    const tab2Res = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:8081',
          Cookie: `refresh_token=${token}`,
        },
      })
    );

    // Inside grace window, tab 2 succeeds (200 OK)
    expect(tab2Res.status).toBe(200);

    // Step D: Tab 3 attempts to use the SAME old token a SECOND time inside grace window
    const tab3Res = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token}`,
        },
      })
    );

    // Grace path is accepted EXACTLY ONCE. Second attempt fails with 401 TOKEN_REUSE_DETECTED
    expect(tab3Res.status).toBe(401);
    const tab3Body = (await tab3Res.json()) as any;
    expect(tab3Body.error).toBe('TOKEN_REUSE_DETECTED');
  });

  it('5. Grace hole test: token reuse right after LOGOUT is rejected (never qualifies for grace)', async () => {
    // Step A: Web login
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token = loginRes.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Step B: Logout user session (revokes session with rotated_at = null)
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

    // Step C: Attempt reuse IMMEDIATELY after logout (within 1 second)
    const reuseAfterLogout = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token}`,
        },
      })
    );

    // Revocation by logout sets rotated_at = null, so grace is DENIED!
    expect(reuseAfterLogout.status).toBe(401);
    const body = (await reuseAfterLogout.json()) as any;
    expect(body.error).toBe('TOKEN_REUSE_DETECTED');
  });

  it('6. Grace hole test: token reuse right after THEFT DETECTION is rejected (never qualifies for grace)', async () => {
    // Step A: Web login
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token = loginRes.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Step B: First legitimate refresh (rotates token)
    const ref1 = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token}`,
        },
      })
    );
    expect(ref1.status).toBe(200);

    // Step C: Backdate rotated_at to 30s ago (outside grace window) to trigger theft detection
    const { createHash } = await import('node:crypto');
    const tokenHash = createHash('sha256').update(token!).digest('hex');
    await prisma.auth_sessions.update({
      where: { refresh_token_hash: tokenHash },
      data: { rotated_at: new Date(Date.now() - 30000) },
    });

    // Trigger theft revocation
    const theftTrigger = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token}`,
        },
      })
    );
    expect(theftTrigger.status).toBe(401);

    // Step D: Attempt reuse of another token right after theft detection
    const reuseAfterTheft = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token}`,
        },
      })
    );

    // Theft revocation sets rotated_at = null on active sessions, so grace is DENIED!
    expect(reuseAfterTheft.status).toBe(401);
  });

  it('7. CSRF checks: accept Expo web dev origin (localhost:8081) and reject unallowed origin', async () => {
    // Login web
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token = loginRes.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Missing x-client: web header -> 400
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

    // Expo Web Dev Origin (http://localhost:8081) -> 200 OK + Credentials headers
    const expoDevRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:8081',
          Cookie: `refresh_token=${token}`,
        },
      })
    );
    expect(expoDevRes.status).toBe(200);
    expect(expoDevRes.headers.get('access-control-allow-credentials')).toBe('true');
    expect(expoDevRes.headers.get('access-control-allow-origin')).toBe('http://localhost:8081');

    // Unallowed origin (http://evil-attacker.com) -> Rejected (403)
    const badOriginRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://evil-attacker.com',
          Cookie: `refresh_token=${token}`,
        },
      })
    );
    expect(badOriginRes.status).toBe(403);
  });

  it('8. POST /auth/logout revokes ONLY the current session (leaves other sessions active)', async () => {
    // Session 1 (Tab A)
    const login1 = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token1 = login1.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Session 2 (Tab B)
    const login2 = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token2 = login2.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Logout Session 1
    const logoutRes = await app.handle(
      new Request('http://localhost/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Cookie: `refresh_token=${token1}`,
        },
      })
    );
    expect(logoutRes.status).toBe(200);
    const logoutCookie = logoutRes.headers.get('set-cookie');
    expect(logoutCookie).toContain('Max-Age=0');
    expect(logoutCookie).toContain('Path=/api/v1/auth');

    // Session 2 remains ACTIVE!
    const refreshSession2 = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token2}`,
        },
      })
    );
    expect(refreshSession2.status).toBe(200);
  });

  it('9. POST /auth/logout-all revokes ALL user sessions across all devices', async () => {
    // Create Session 1
    const login1 = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token1 = login1.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Create Session 2
    const login2 = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token2 = login2.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    const authHeader = `Bearer ${signAccessToken({ sub: testUserId })}`;

    // Call POST /auth/logout-all
    const logoutAllRes = await app.handle(
      new Request('http://localhost/auth/logout-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Authorization: authHeader,
        },
      })
    );

    expect(logoutAllRes.status).toBe(200);

    // Both Session 1 and Session 2 should now be revoked
    const activeSessions = await prisma.auth_sessions.findMany({
      where: { user_id: testUserId, revoked_at: null },
    });
    expect(activeSessions.length).toBe(0);
  });

  it('10. Rate limit key for /auth/token/refresh uses token hash + IP to avoid blocking campus NAT IPs', async () => {
    process.env.SKIP_RATE_LIMIT = 'false';
    process.env.ENABLE_TEST_RATE_LIMIT = 'true';

    // Different token hashes from the same IP (127.0.0.1) get separate rate limit keys
    let rateLimited = false;
    for (let i = 0; i < 25; i++) {
      const res = await app.handle(
        new Request('http://localhost/auth/token/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-client': 'web', Origin: 'http://localhost:3000', Cookie: 'refresh_token=token_hash_student_a' },
          body: JSON.stringify({ refreshToken: 'dummy_a' }),
        })
      );
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    expect(rateLimited).toBe(true);

    // Student B with a different refresh token on the SAME IP (127.0.0.1) is NOT blocked!
    const studentBRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web', Origin: 'http://localhost:3000', Cookie: 'refresh_token=token_hash_student_b' },
        body: JSON.stringify({ refreshToken: 'dummy_b' }),
      })
    );
    expect(studentBRes.status).not.toBe(429);

    process.env.SKIP_RATE_LIMIT = 'true';
    delete process.env.ENABLE_TEST_RATE_LIMIT;
  });

  it('11. Rotating fake cookies from one IP still hits the IP limit', async () => {
    process.env.SKIP_RATE_LIMIT = 'false';
    process.env.ENABLE_TEST_RATE_LIMIT = 'true';

    const requests = Array.from({ length: 305 }, (_, i) =>
      app.handle(
        new Request('http://localhost/auth/token/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client': 'web',
            Origin: 'http://localhost:3000',
            Cookie: `refresh_token=fake_cookie_ip_test_${i}`,
          },
          body: JSON.stringify({ refreshToken: `fake_body_${i}` }),
        })
      )
    );
    const responses = await Promise.all(requests);
    const has429 = responses.some((res) => res.status === 429);
    expect(has429).toBe(true);

    process.env.SKIP_RATE_LIMIT = 'true';
    delete process.env.ENABLE_TEST_RATE_LIMIT;
  });

  it('12. Proxy IP extraction: only trust x-forwarded-for when env TRUSTED_PROXY=true, otherwise use socket IP', async () => {
    // With TRUSTED_PROXY=false (default): x-forwarded-for header is IGNORED by getClientIp
    process.env.TRUSTED_PROXY = 'false';
    const req1 = new Request('http://localhost/auth/token/refresh', {
      headers: { 'x-forwarded-for': '203.0.113.195' },
    });
    expect(getClientIp(req1)).toBe('127.0.0.1');

    // With TRUSTED_PROXY=true: x-forwarded-for header IS TRUSTED by getClientIp
    process.env.TRUSTED_PROXY = 'true';
    const req2 = new Request('http://localhost/auth/token/refresh', {
      headers: { 'x-forwarded-for': '203.0.113.195, 10.0.0.1' },
    });
    expect(getClientIp(req2)).toBe('203.0.113.195');

    process.env.TRUSTED_PROXY = 'false';
  });

  it('13. Theft revocation closes grace path: session rotated 5s ago cannot use grace after theft detection', async () => {
    // Step 1: Web login to create Session A
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token1 = loginRes.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Step 2: Refresh token1 -> token2 issued. token1 is rotated (rotated_at set, grace_used_at is NULL)
    const refreshRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token1}`,
        },
      })
    );
    expect(refreshRes.status).toBe(200);

    // Step 3: Trigger theft detection by attempting 2 grace reuses or invalid reuse
    await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token1}`,
        },
      })
    );
    // Second reuse attempt triggers theft revocation -> revokes active sessions & sets grace_used_at = now on all sessions
    const theftRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token1}`,
        },
      })
    );
    expect(theftRes.status).toBe(401);

    // Step 4: Verify that grace path is completely closed on ALL sessions of this user
    const userSessions = await prisma.auth_sessions.findMany({
      where: { user_id: testUserId },
    });
    for (const session of userSessions) {
      expect(session.grace_used_at).not.toBeNull();
    }
  });

  it('14. Logout-all closes grace path: session rotated 5s ago cannot use grace after logout-all', async () => {
    // Step 1: Web login to create Session A
    const loginRes = await app.handle(
      new Request('http://localhost/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client': 'web' },
        body: JSON.stringify({ identity: testUserCode, password: testPassword }),
      })
    );
    const token1 = loginRes.headers.get('set-cookie')!.match(/refresh_token=([^;]+)/)![1];

    // Step 2: Refresh token1 -> token2 issued. token1 is rotated (rotated_at set, grace_used_at is NULL)
    const refreshRes = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token1}`,
        },
      })
    );
    expect(refreshRes.status).toBe(200);

    // Step 3: Call POST /auth/logout-all
    const authHeader = `Bearer ${signAccessToken({ sub: testUserId })}`;
    const logoutAllRes = await app.handle(
      new Request('http://localhost/auth/logout-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Authorization: authHeader,
        },
      })
    );
    expect(logoutAllRes.status).toBe(200);

    // Step 4: Attempt to use rotated token1 for grace after logout-all
    const graceAfterLogoutAll = await app.handle(
      new Request('http://localhost/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'web',
          Origin: 'http://localhost:3000',
          Cookie: `refresh_token=${token1}`,
        },
      })
    );
    // Grace is DENIED (401) because logout-all set grace_used_at = now!
    expect(graceAfterLogoutAll.status).toBe(401);
  });
});
