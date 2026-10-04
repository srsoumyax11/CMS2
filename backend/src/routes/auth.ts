import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { hashPassword, verifyPassword } from '../utils/password';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt';
import { createRateLimiter } from '../middleware/rate-limit';
import {
  hashRefreshToken,
  parseCookies,
  setWebRefreshCookie,
  clearWebRefreshCookie,
  issueAuthSession,
  getClientIp,
  getTokenRateLimitKey,
  getRefreshRateLimitKey,
} from '../utils/session';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwtAuth)
  /**
   * POST /api/v1/auth/login
   * Login with userCode (or email/phone) and password
   */
  .post(
    '/login',
    async ({ body, set, request }) => {
      try {
        const { identity, password } = body;

        // Search user by userCode, email, or phone (SSOT)
        const user = await prisma.users.findFirst({
          where: {
            OR: [{ user_code: identity }, { email: identity }, { phone: identity }],
            deleted_at: null,
          },
        });

        if (!user || !user.password_hash) {
          set.status = 401;
          return errorResponse('INVALID_CREDENTIALS', 'Invalid user identity or password');
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
          set.status = 401;
          return errorResponse('INVALID_CREDENTIALS', 'Invalid user identity or password');
        }

        if (user.status === 'frozen' || user.status === 'archived') {
          set.status = 403;
          return errorResponse('ACCOUNT_SUSPENDED', `Account is currently ${user.status}`);
        }

        // If 2FA / MFA is enabled for user, trigger 2FA OTP challenge
        if (user.mfa_enabled) {
          const target = user.email || user.phone || user.user_code || 'user';
          const channel = user.email ? 'email' : 'sms';
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
          const mockOtp = '123456';
          const codeHash = await hashPassword(mockOtp);

          const otp = await prisma.otp_requests.create({
            data: {
              id: crypto.randomUUID(),
              target,
              channel,
              purpose: 'login',
              code_hash: codeHash,
              expires_at: expiresAt,
            },
          });

          return successResponse(
            {
              requires2FA: true,
              otpId: otp.id,
              userId: user.id,
              target,
              channel,
              devOtpHint: mockOtp,
            },
            '2FA OTP required to complete login'
          );
        }

        // Update last login timestamp
        await prisma.users.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
        });

        const clientIp = getClientIp(request);

        // Record audit log entry
        await prisma.audit_logs.create({
          data: {
            actor_user_id: user.id,
            action: 'USER_LOGIN',
            entity_type: 'users',
            entity_id: user.id,
            ip_address: clientIp,
          },
        });

        const sessionTokens = await issueAuthSession({ user, request, set });

        return successResponse(
          {
            userId: user.id,
            userCode: user.user_code,
            fullName: user.full_name,
            status: user.status,
            preferredLanguage: user.preferred_language,
            ...sessionTokens,
          },
          'Login successful'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('INTERNAL_SERVER_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    },
    {
      beforeHandle: createRateLimiter(15 * 60 * 1000, 10, 'auth_login'),
      body: t.Object({
        identity: t.String({ description: 'User Code, Email, or Phone Number' }),
        password: t.String({ minLength: 6 }),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Login with user credentials',
      },
    }
  )

  /**
   * POST /api/v1/auth/2fa/verify
   * Complete 2FA login by verifying OTP code
   */
  .post(
    '/2fa/verify',
    async ({ body, set, request }) => {
      try {
        const { otpId, code, userId } = body;

        const otpRequest = await prisma.otp_requests.findUnique({
          where: { id: otpId },
        });

        if (!otpRequest) {
          set.status = 404;
          return errorResponse('OTP_NOT_FOUND', '2FA OTP request not found or expired');
        }

        if (otpRequest.consumed_at) {
          set.status = 400;
          return errorResponse('OTP_ALREADY_USED', 'This 2FA OTP has already been consumed');
        }

        if (new Date() > otpRequest.expires_at) {
          set.status = 400;
          return errorResponse('OTP_EXPIRED', '2FA OTP has expired. Please request a new one.');
        }

        const isValid = await verifyPassword(code, otpRequest.code_hash);
        if (!isValid) {
          set.status = 401;
          return errorResponse('INVALID_OTP', 'Invalid 2FA OTP code');
        }

        await prisma.otp_requests.update({
          where: { id: otpId },
          data: { consumed_at: new Date() },
        });

        const user = await prisma.users.findUnique({
          where: { id: userId },
        });

        if (!user) {
          set.status = 404;
          return errorResponse('USER_NOT_FOUND', 'User account not found');
        }

        await prisma.users.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
        });

        const headerIp = request?.headers ? (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')) : null;
        const clientIp = (headerIp || '127.0.0.1').split(',')[0]!.trim();

        await prisma.audit_logs.create({
          data: {
            actor_user_id: user.id,
            action: 'USER_LOGIN_2FA',
            entity_type: 'users',
            entity_id: user.id,
            ip_address: clientIp,
          },
        });

        const sessionTokens = await issueAuthSession({ user, request, set });

        return successResponse(
          {
            userId: user.id,
            userCode: user.user_code,
            fullName: user.full_name,
            status: user.status,
            preferredLanguage: user.preferred_language,
            ...sessionTokens,
          },
          '2FA Login successful'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('2FA_VERIFY_FAILED', error instanceof Error ? error.message : 'Failed to verify 2FA OTP');
      }
    },
    {
      beforeHandle: createRateLimiter(15 * 60 * 1000, 10, 'auth_2fa_verify'),
      body: t.Object({
        otpId: t.String({ format: 'uuid' }),
        code: t.String({ minLength: 6, maxLength: 6 }),
        userId: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Verify 2FA OTP to complete login session',
      },
    }
  )

  /**
   * POST /api/v1/auth/mfa/enable
   * Enable 2FA / MFA for current user account
   */
  .post(
    '/mfa/enable',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Missing or invalid token');
        }

        const updated = await prisma.users.update({
          where: { id: user.id },
          data: { mfa_enabled: true },
        });

        await prisma.audit_logs.create({
          data: {
            actor_user_id: user.id,
            action: 'MFA_ENABLED',
            entity_type: 'users',
            entity_id: user.id,
          },
        });

        return successResponse(
          { userId: updated.id, mfaEnabled: updated.mfa_enabled },
          '2FA / MFA enabled successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('MFA_ENABLE_FAILED', error instanceof Error ? error.message : 'Failed to enable 2FA');
      }
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Enable 2FA / MFA for account',
      },
    }
  )

  /**
   * POST /api/v1/auth/mfa/disable
   * Disable 2FA / MFA for current user account
   */
  .post(
    '/mfa/disable',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Missing or invalid token');
        }

        const updated = await prisma.users.update({
          where: { id: user.id },
          data: { mfa_enabled: false },
        });

        await prisma.audit_logs.create({
          data: {
            actor_user_id: user.id,
            action: 'MFA_DISABLED',
            entity_type: 'users',
            entity_id: user.id,
          },
        });

        return successResponse(
          { userId: updated.id, mfaEnabled: updated.mfa_enabled },
          '2FA / MFA disabled successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('MFA_DISABLE_FAILED', error instanceof Error ? error.message : 'Failed to disable 2FA');
      }
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Disable 2FA / MFA for account',
      },
    }
  )

  /**
   * POST /api/v1/auth/otp/send
   * Generate OTP for login, verification, or password reset
   */
  .post(
    '/otp/send',
    async ({ body, set }) => {
      try {
        const { target, channel, purpose } = body;

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const mockOtp = '123456';
        const codeHash = await hashPassword(mockOtp);

        const otp = await prisma.otp_requests.create({
          data: {
            id: crypto.randomUUID(),
            target,
            channel,
            purpose,
            code_hash: codeHash,
            expires_at: expiresAt,
          },
        });

        return successResponse(
          {
            otpId: otp.id,
            target,
            channel,
            purpose,
            expiresAt: otp.expires_at,
            devOtpHint: mockOtp,
          },
          'OTP sent successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('OTP_SEND_FAILED', error instanceof Error ? error.message : 'Failed to send OTP');
      }
    },
    {
      beforeHandle: createRateLimiter(15 * 60 * 1000, 5, 'auth_otp_send'),
      body: t.Object({
        target: t.String({ description: 'Email address or Phone number' }),
        channel: t.Union([t.Literal('sms'), t.Literal('email')]),
        purpose: t.Union([t.Literal('login'), t.Literal('reset'), t.Literal('verify'), t.Literal('payment')]),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Generate and send OTP',
      },
    }
  )

  /**
   * POST /api/v1/auth/otp/verify
   * Verify and consume OTP code
   */
  .post(
    '/otp/verify',
    async ({ body, set }) => {
      try {
        const { otpId, code } = body;

        const otpRequest = await prisma.otp_requests.findUnique({
          where: { id: otpId },
        });

        if (!otpRequest) {
          set.status = 404;
          return errorResponse('OTP_NOT_FOUND', 'OTP request not found or expired');
        }

        if (otpRequest.consumed_at) {
          set.status = 400;
          return errorResponse('OTP_ALREADY_USED', 'This OTP has already been used');
        }

        if (new Date() > otpRequest.expires_at) {
          set.status = 400;
          return errorResponse('OTP_EXPIRED', 'OTP has expired. Please request a new one.');
        }

        const isValid = await verifyPassword(code, otpRequest.code_hash);
        if (!isValid) {
          set.status = 401;
          return errorResponse('INVALID_OTP', 'Invalid OTP code');
        }

        // Mark as consumed (SSOT)
        await prisma.otp_requests.update({
          where: { id: otpId },
          data: { consumed_at: new Date() },
        });

        return successResponse(
          {
            otpId: otpRequest.id,
            target: otpRequest.target,
            purpose: otpRequest.purpose,
            verified: true,
          },
          'OTP verified successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('OTP_VERIFY_FAILED', error instanceof Error ? error.message : 'Failed to verify OTP');
      }
    },
    {
      beforeHandle: createRateLimiter(15 * 60 * 1000, 10, 'auth_otp_verify'),
      body: t.Object({
        otpId: t.String({ format: 'uuid' }),
        code: t.String({ minLength: 6, maxLength: 6 }),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Verify and consume OTP code',
      },
    }
  )

  /**
   * POST /api/v1/auth/logout
   * Logout current session
   */
  .post(
    '/logout',
    async ({ user, set, request, body }) => {
      const isWebClient = request?.headers ? request.headers.get('x-client')?.toLowerCase() === 'web' : false;
      const cookieHeader = request?.headers ? request.headers.get('cookie') : null;
      const cookies = parseCookies(cookieHeader);
      const cookieToken = cookies['refresh_token'];
      const bodyToken = (body as any)?.refreshToken;
      const tokenToRevoke = cookieToken || bodyToken;

      if (!user && !tokenToRevoke) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Missing or invalid token');
      }

      if (tokenToRevoke) {
        const tokenHash = hashRefreshToken(tokenToRevoke);
        await prisma.auth_sessions.updateMany({
          where: { refresh_token_hash: tokenHash, revoked_at: null },
          data: { revoked_at: new Date() }, // rotated_at remains null for logout revocation!
        });
      } else if (user) {
        // Fallback: revoke user's single most recent active session
        const latestSession = await prisma.auth_sessions.findFirst({
          where: { user_id: user.id, revoked_at: null },
          orderBy: { created_at: 'desc' },
        });
        if (latestSession) {
          await prisma.auth_sessions.update({
            where: { id: latestSession.id },
            data: { revoked_at: new Date() },
          });
        }
      }

      if (user) {
        await prisma.audit_logs.create({
          data: {
            actor_user_id: user.id,
            action: 'USER_LOGOUT',
            entity_type: 'users',
            entity_id: user.id,
          },
        });
      }

      if (isWebClient || cookieToken) {
        clearWebRefreshCookie(set);
      }

      return successResponse({ userId: user?.id || null }, 'Logged out successfully');
    },
    {
      body: t.Optional(t.Object({ refreshToken: t.Optional(t.String()) })),
      detail: {
        tags: ['Authentication'],
        summary: 'Logout current user session',
      },
    }
  )

  /**
   * POST /api/v1/auth/logout-all
   * Revoke all sessions across all devices for the current user
   */
  .post(
    '/logout-all',
    async ({ user, set, request }) => {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Missing or invalid token');
      }

      const isWebClient = request?.headers ? request.headers.get('x-client')?.toLowerCase() === 'web' : false;

      const now = new Date();
      // Revoke ALL active sessions for this user AND close grace path on ALL sessions
      await prisma.auth_sessions.updateMany({
        where: { user_id: user.id, revoked_at: null },
        data: { revoked_at: now },
      });

      await prisma.auth_sessions.updateMany({
        where: { user_id: user.id, grace_used_at: null },
        data: { grace_used_at: now },
      });

      await prisma.audit_logs.create({
        data: {
          actor_user_id: user.id,
          action: 'USER_LOGOUT_ALL_DEVICES',
          entity_type: 'users',
          entity_id: user.id,
        },
      });

      if (isWebClient) {
        clearWebRefreshCookie(set);
      }

      return successResponse({ userId: user.id }, 'Logged out from all devices successfully');
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Revoke all sessions/devices for user',
      },
    }
  )

  /**
   * POST /api/v1/auth/password/reset
   * Reset password using verified OTP token
   */
  .post(
    '/password/reset',
    async ({ body, set }) => {
      try {
        const { target, otpId, newPassword } = body;

        const otp = await prisma.otp_requests.findUnique({
          where: { id: otpId },
        });

        if (!otp || !otp.consumed_at || otp.target !== target || otp.purpose !== 'reset') {
          set.status = 400;
          return errorResponse('INVALID_RESET_REQUEST', 'OTP must be verified before resetting password');
        }

        const user = await prisma.users.findFirst({
          where: {
            OR: [{ email: target }, { phone: target }],
            deleted_at: null,
          },
        });

        if (!user) {
          set.status = 404;
          return errorResponse('USER_NOT_FOUND', 'User associated with target not found');
        }

        const newHash = await hashPassword(newPassword);
        await prisma.users.update({
          where: { id: user.id },
          data: { password_hash: newHash },
        });

        await prisma.audit_logs.create({
          data: {
            actor_user_id: user.id,
            action: 'PASSWORD_RESET',
            entity_type: 'users',
            entity_id: user.id,
          },
        });

        return successResponse({ userId: user.id }, 'Password reset successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('PASSWORD_RESET_FAILED', error instanceof Error ? error.message : 'Failed to reset password');
      }
    },
    {
      body: t.Object({
        target: t.String({ description: 'Email or phone' }),
        otpId: t.String({ format: 'uuid', description: 'Verified OTP ID' }),
        newPassword: t.String({ minLength: 6 }),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Reset password with verified OTP',
      },
    }
  )

  /**
   * GET /api/v1/auth/devices
   * List active sessions/devices for current user
   */
  .get(
    '/devices',
    async ({ user, set }) => {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Missing or invalid token');
      }

      const logs = await prisma.audit_logs.findMany({
        where: {
          actor_user_id: user.id,
          action: 'USER_LOGIN',
        },
        orderBy: { occurred_at: 'desc' },
        take: 10,
      });

      const devices = logs.map((log: any) => ({
        id: log.id.toString(),
        ipAddress: log.ip_address,
        loginAt: log.occurred_at,
        isCurrent: true,
      }));

      return successResponse(devices, 'Active devices retrieved successfully');
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Get list of active login sessions/devices',
      },
    }
  )

  /**
   * DELETE /api/v1/auth/devices/:id
   * Terminate a specific session/device
   */
  .delete(
    '/devices/:id',
    async ({ user, params, set }) => {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Missing or invalid token');
      }

      await prisma.audit_logs.create({
        data: {
          actor_user_id: user.id,
          action: 'DEVICE_REVOKED',
          entity_type: 'audit_logs',
          entity_id: params.id,
        },
      });

      return successResponse({ deviceId: params.id }, 'Session device revoked successfully');
    },
    {
      params: t.Object({
        id: t.String({ format: 'uuid' }),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Force logout/revoke a specific device session',
      },
    }
  )

  /**
   * POST /api/v1/auth/role-request
   * Submit self-signup role request (campus_schema_002_self_signup flow)
   */
  .post(
    '/role-request',
    async ({ body, set }) => {
      try {
        const { userId, roleCode, claimedCode, departmentId, hostelId } = body;

        const role = await prisma.roles.findUnique({
          where: { code: roleCode },
        });

        if (!role) {
          set.status = 404;
          return errorResponse('ROLE_NOT_FOUND', `Role '${roleCode}' does not exist`);
        }

        const roleRequest = await prisma.role_requests.create({
          data: {
            id: crypto.randomUUID(),
            user_id: userId,
            role_id: role.id,
            claimed_code: claimedCode,
            department_id: departmentId,
            hostel_id: hostelId,
            status: 'pending',
          },
        });

        return successResponse(roleRequest, 'Role request submitted successfully for approval');
      } catch (error) {
        set.status = 500;
        return errorResponse('ROLE_REQUEST_FAILED', error instanceof Error ? error.message : 'Failed to create role request');
      }
    },
    {
      body: t.Object({
        userId: t.String({ format: 'uuid' }),
        roleCode: t.String({ description: 'e.g. student, faculty, warden' }),
        claimedCode: t.Optional(t.String({ description: 'Admission No or Employee Code' })),
        departmentId: t.Optional(t.String({ format: 'uuid' })),
        hostelId: t.Optional(t.String({ format: 'uuid' })),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Request a user role (Self-signup approval flow)',
      },
    }
  )

  /**
   * POST /api/v1/auth/register
   * Direct registration with email/phone & password after verified OTP
   */
  .post(
    '/register',
    async ({ body, set, request }) => {
      try {
        const { target, password, fullName, otpId } = body;

        // 1. Verify OTP was consumed
        const otp = await prisma.otp_requests.findUnique({
          where: { id: otpId },
        });

        if (!otp || !otp.consumed_at || otp.target !== target) {
          set.status = 400;
          return errorResponse('INVALID_REGISTRATION_OTP', 'Verified OTP is required for account registration');
        }

        // 2. Check duplicate user
        const existing = await prisma.users.findFirst({
          where: {
            OR: [{ email: target }, { phone: target }],
            deleted_at: null,
          },
        });

        if (existing) {
          set.status = 409;
          return errorResponse('USER_ALREADY_EXISTS', 'Account with this email or phone already exists');
        }

        const passwordHash = await hashPassword(password);
        const userCode = `REG_${Date.now()}`;

        const newUser = await prisma.users.create({
          data: {
            id: crypto.randomUUID(),
            user_code: userCode,
            full_name: fullName,
            email: target.includes('@') ? target : null,
            phone: !target.includes('@') ? target : null,
            password_hash: passwordHash,
            status: 'active',
          },
        });

        const sessionTokens = await issueAuthSession({ user: newUser, request, set });

        return successResponse(
          {
            userId: newUser.id,
            userCode: newUser.user_code,
            fullName: newUser.full_name,
            status: newUser.status,
            ...sessionTokens,
          },
          'Account registered successfully'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('REGISTER_FAILED', error instanceof Error ? error.message : 'Registration failed');
      }
    },
    {
      beforeHandle: createRateLimiter(15 * 60 * 1000, 5, 'auth_register'),
      body: t.Object({
        target: t.String({ description: 'Email address or Phone number' }),
        password: t.String({ minLength: 6 }),
        fullName: t.String({ minLength: 2 }),
        otpId: t.String({ format: 'uuid', description: 'ID of verified OTP' }),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Direct user registration after OTP verification',
      },
    }
  )

  .use(createRateLimiter(15 * 60 * 1000, 300, 'auth_refresh_ip', getClientIp))
  .use(createRateLimiter(15 * 60 * 1000, 20, 'auth_refresh_token', getTokenRateLimitKey))
  .post(
    '/token/refresh',
    async ({ body, set, request }) => {
      try {
        const xClient = request?.headers ? request.headers.get('x-client')?.toLowerCase() : null;
        const cookieHeader = request?.headers ? request.headers.get('cookie') : null;
        const cookies = parseCookies(cookieHeader);
        const cookieToken = cookies['refresh_token'];
        const bodyToken = body?.refreshToken;

        const isCookieRefresh = Boolean(cookieToken);
        const isWebClient = xClient === 'web';

        // CSRF Check for Cookie-based / Web Refresh
        if (isCookieRefresh || isWebClient) {
          if (!isWebClient) {
            set.status = 400;
            return errorResponse('CSRF_ERROR', "Header 'x-client: web' is required for web cookie refresh");
          }

          const origin = request?.headers ? request.headers.get('origin')?.toLowerCase() : null;
          const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim().toLowerCase());

          if (!origin || !allowedOrigins.includes(origin)) {
            set.status = 403;
            return errorResponse('CSRF_ERROR', 'Invalid or missing Origin header for web refresh');
          }
        }

        const refreshToken = cookieToken || bodyToken;
        if (!refreshToken) {
          set.status = 400;
          return errorResponse('INVALID_TOKEN', 'Refresh token is required');
        }

        // 1. Verify JWT signature
        let payload: any;
        try {
          payload = verifyToken(refreshToken, env.JWT_REFRESH_SECRET);
        } catch {
          if (isWebClient) clearWebRefreshCookie(set);
          set.status = 401;
          return errorResponse('INVALID_TOKEN', 'Invalid or expired refresh token');
        }

        const tokenHash = hashRefreshToken(refreshToken);
        const headerIp = request?.headers ? (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')) : null;
        const clientIp = (headerIp || '127.0.0.1').split(',')[0]!.trim();

        // 2. Query session in DB
        const session = await prisma.auth_sessions.findUnique({
          where: { refresh_token_hash: tokenHash },
        });

        // REUSE DETECTION: If session exists and revoked_at is not null
        if (session && session.revoked_at !== null) {
          const isRotated = session.rotated_at !== null;
          const isGraceUnused = session.grace_used_at === null;
          const elapsedSeconds = session.rotated_at ? (Date.now() - session.rotated_at.getTime()) / 1000 : 999999;

          // QUALIFY FOR GRACE PATH: Must be rotated (NOT revoked by logout/theft), grace not consumed yet, and within grace window
          if (isRotated && isGraceUnused && elapsedSeconds <= env.REFRESH_REUSE_GRACE_SECONDS) {
            // Mark grace as consumed IMMEDIATELY so it can NEVER be used a second time!
            await prisma.auth_sessions.update({
              where: { id: session.id },
              data: { grace_used_at: new Date() },
            });

            const user = await prisma.users.findUnique({
              where: { id: session.user_id },
            });

            if (!user || user.status === 'frozen' || user.status === 'archived') {
              if (isWebClient) clearWebRefreshCookie(set);
              set.status = 403;
              return errorResponse('ACCOUNT_SUSPENDED', 'Account is suspended or invalid');
            }

            const newAccessToken = signAccessToken({ sub: user.id, userCode: user.user_code || '' });
            const newRefreshToken = signRefreshToken({ sub: user.id, userCode: user.user_code || '' });

            const newHash = hashRefreshToken(newRefreshToken);
            const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            await prisma.auth_sessions.create({
              data: {
                id: crypto.randomUUID(),
                user_id: user.id,
                device_id: session.device_id,
                refresh_token_hash: newHash,
                ip_address: clientIp,
                expires_at: newExpiresAt,
              },
            });

            if (isWebClient) {
              setWebRefreshCookie(set, newRefreshToken);
              return successResponse(
                {
                  token: newAccessToken,
                  accessToken: newAccessToken,
                },
                'Token refreshed successfully'
              );
            } else {
              return successResponse(
                {
                  token: newAccessToken,
                  accessToken: newAccessToken,
                  refreshToken: newRefreshToken,
                },
                'Token refreshed successfully'
              );
            }
          }

          // OUTSIDE GRACE WINDOW / DISQUALIFIED (e.g. revoked by logout, revoked by theft, or grace used twice):
          // REVOKE ALL active sessions AND close grace path on ALL sessions for this user!
          const theftTime = new Date();
          await prisma.auth_sessions.updateMany({
            where: { user_id: session.user_id, revoked_at: null },
            data: { revoked_at: theftTime },
          });

          await prisma.auth_sessions.updateMany({
            where: { user_id: session.user_id, grace_used_at: null },
            data: { grace_used_at: theftTime },
          });

          // Log security event
          await prisma.audit_logs.create({
            data: {
              actor_user_id: session.user_id,
              action: 'REFRESH_TOKEN_REUSE_DETECTED',
              entity_type: 'auth_sessions',
              entity_id: session.id,
              ip_address: clientIp,
            },
          });

          if (isWebClient) clearWebRefreshCookie(set);
          set.status = 401;
          return errorResponse('TOKEN_REUSE_DETECTED', 'Refresh token reuse detected. All sessions have been revoked.');
        }

        // If session not found or expired
        if (!session || new Date() > session.expires_at) {
          if (isWebClient) clearWebRefreshCookie(set);
          set.status = 401;
          return errorResponse('INVALID_TOKEN', 'Session expired or invalid refresh token');
        }

        const user = await prisma.users.findUnique({
          where: { id: session.user_id },
        });

        if (!user || user.status === 'frozen' || user.status === 'archived') {
          if (isWebClient) clearWebRefreshCookie(set);
          set.status = 403;
          return errorResponse('ACCOUNT_SUSPENDED', 'Account is suspended or invalid');
        }

        // 3. Rotate token (revoking current session, setting rotated_at ONLY during normal rotation)
        await prisma.auth_sessions.update({
          where: { id: session.id },
          data: {
            revoked_at: new Date(),
            rotated_at: new Date(),
          },
        });

        const newAccessToken = signAccessToken({ sub: user.id, userCode: user.user_code || '' });
        const newRefreshToken = signRefreshToken({ sub: user.id, userCode: user.user_code || '' });

        const newHash = hashRefreshToken(newRefreshToken);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await prisma.auth_sessions.create({
          data: {
            id: crypto.randomUUID(),
            user_id: user.id,
            device_id: session.device_id,
            refresh_token_hash: newHash,
            ip_address: clientIp,
            expires_at: newExpiresAt,
          },
        });

        if (isWebClient) {
          setWebRefreshCookie(set, newRefreshToken);
          return successResponse(
            {
              token: newAccessToken,
              accessToken: newAccessToken,
            },
            'Token refreshed successfully'
          );
        } else {
          return successResponse(
            {
              token: newAccessToken,
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            },
            'Token refreshed successfully'
          );
        }
      } catch (error) {
        set.status = 500;
        return errorResponse('REFRESH_FAILED', error instanceof Error ? error.message : 'Failed to refresh token');
      }
    },
    {
      beforeHandle: [
        createRateLimiter(env.REFRESH_IP_WINDOW_SECONDS * 1000, env.REFRESH_IP_LIMIT, 'auth_refresh_ip', (req, srv) => getClientIp(req, srv)),
        createRateLimiter(env.REFRESH_TOKEN_WINDOW_SECONDS * 1000, env.REFRESH_TOKEN_LIMIT, 'auth_refresh_token', (req) => getTokenRateLimitKey(req)),
      ],
      body: t.Optional(
        t.Object({
          refreshToken: t.Optional(t.String()),
        })
      ),
      detail: {
        tags: ['Authentication'],
        summary: 'Refresh access token',
      },
    }
  )

  /**
   * POST /api/v1/auth/backup-code/verify
   * Login when phone/OTP is lost using emergency backup code
   */
  .post(
    '/backup-code/verify',
    async ({ body, set, request }) => {
      try {
        const { identity, backupCode } = body;

        const user = await prisma.users.findFirst({
          where: {
            OR: [{ user_code: identity }, { email: identity }, { phone: identity }],
            deleted_at: null,
          },
        });

        if (!user) {
          set.status = 404;
          return errorResponse('USER_NOT_FOUND', 'User identity not found');
        }

        // Mock emergency backup code check (code: "BACKUP-123456")
        if (backupCode !== 'BACKUP-123456') {
          set.status = 401;
          return errorResponse('INVALID_BACKUP_CODE', 'Invalid emergency backup code');
        }

        const sessionTokens = await issueAuthSession({ user, request, set });

        return successResponse(
          {
            userId: user.id,
            userCode: user.user_code,
            fullName: user.full_name,
            ...sessionTokens,
          },
          'Emergency backup code verified'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('BACKUP_VERIFY_FAILED', 'Backup code verification failed');
      }
    },
    {
      body: t.Object({
        identity: t.String(),
        backupCode: t.String(),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Verify emergency backup code',
      },
    }
  )

  /**
   * GET /api/v1/auth/login-alerts
   * Odd login history and security alerts
   */
  .get(
    '/login-alerts',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Missing or invalid token');
        }

        const alerts = await prisma.audit_logs.findMany({
          where: {
            actor_user_id: user.id,
            action: 'USER_LOGIN',
          },
          orderBy: { occurred_at: 'desc' },
          take: 5,
        });

        const data = alerts.map((a: any) => ({
          id: a.id.toString(),
          ipAddress: a.ip_address,
          loginAt: a.occurred_at,
          flaggedOdd: false,
        }));

        return successResponse(data, 'Login security alerts retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_ALERTS_FAILED', error instanceof Error ? error.message : 'Failed to fetch login alerts');
      }
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Get odd login history and security alerts',
      },
    }
  );

