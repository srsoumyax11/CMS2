import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

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

        // Update last login timestamp
        await prisma.users.update({
          where: { id: user.id },
          data: { last_login_at: new Date() },
        });

        const token = `mock_jwt_token_${user.id}`;
        const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

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

        return successResponse(
          {
            userId: user.id,
            userCode: user.user_code,
            fullName: user.full_name,
            status: user.status,
            preferredLanguage: user.preferred_language,
            token,
          },
          'Login successful'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('INTERNAL_SERVER_ERROR', error instanceof Error ? error.message : 'Unknown error');
      }
    },
    {
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
    async ({ user, set }) => {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Missing or invalid token');
      }

      await prisma.audit_logs.create({
        data: {
          actor_user_id: user.id,
          action: 'USER_LOGOUT',
          entity_type: 'users',
          entity_id: user.id,
        },
      });

      return successResponse({ userId: user.id }, 'Logged out successfully');
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Logout current user session',
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

      const devices = logs.map((log) => ({
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
  );
