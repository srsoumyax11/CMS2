import { Elysia, t } from 'elysia';
import { prisma } from '../config/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { jwtAuth } from '../middleware/auth';

export const onboardingRoutes = new Elysia()
  .use(jwtAuth)

  /**
   * GET /api/v1/me/onboarding
   * Current onboarding status, next steps, open role and guardian requests
   */
  .get(
    '/me/onboarding',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const currentUser = await prisma.users.findUnique({
          where: { id: user.id },
        });

        if (!currentUser) {
          set.status = 404;
          return errorResponse('USER_NOT_FOUND', 'User profile not found');
        }

        const openRoleRequests = await prisma.role_requests.findMany({
          where: { user_id: user.id, status: { in: ['pending', 'needs_info'] } },
        });

        const openGuardianLinks = await prisma.guardian_link_requests.findMany({
          where: { guardian_user_id: user.id, status: { in: ['pending_student', 'pending_admin'] } },
        });

        let nextStep = 'complete_profile';
        if (currentUser.status === 'registered') {
          nextStep = openRoleRequests.length > 0 ? 'await_role_approval' : 'request_role';
        } else if (currentUser.status === 'active') {
          nextStep = 'active';
        }

        return successResponse(
          {
            userId: currentUser.id,
            status: currentUser.status,
            userCode: currentUser.user_code,
            nextStep,
            openRoleRequests,
            openGuardianLinks,
          },
          'Onboarding status retrieved'
        );
      } catch (error) {
        set.status = 500;
        return errorResponse('ONBOARDING_FETCH_FAILED', error instanceof Error ? error.message : 'Error fetching onboarding status');
      }
    },
    {
      detail: { tags: ['Signup & Onboarding'], summary: 'Get current user onboarding status and next steps' },
    }
  )

  /**
   * GET /api/v1/roles/requestable
   * List roles that can be requested during self-signup
   */
  .get(
    '/roles/requestable',
    async ({ set }) => {
      try {
        const rules = await prisma.role_approval_rules.findMany({
          where: { is_self_requestable: true },
          include: { roles_role_approval_rules_role_idToroles: true },
        });

        const roles = rules.map((r: any) => ({
          roleId: r.role_id,
          roleCode: r.roles_role_approval_rules_role_idToroles?.code,
          roleName: r.roles_role_approval_rules_role_idToroles?.name,
          approvalMode: r.approval_mode,
          needsEvidence: r.needs_evidence,
        }));

        return successResponse(roles, 'Requestable roles retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', error instanceof Error ? error.message : 'Error fetching requestable roles');
      }
    },
    {
      detail: { tags: ['Signup & Onboarding'], summary: 'List requestable user roles' },
    }
  )

  /**
   * GET /api/v1/me/roles
   * My active user roles
   */
  .get(
    '/me/roles',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const userRoles = await prisma.user_roles.findMany({
          where: {
            user_id: user.id,
            revoked_at: null,
          },
          include: { roles: true },
        });

        return successResponse(userRoles, 'User roles retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', error instanceof Error ? error.message : 'Error fetching roles');
      }
    },
    {
      detail: { tags: ['Signup & Onboarding'], summary: 'Get active roles for current user' },
    }
  )

  /**
   * POST /api/v1/me/active-role
   * Switch active operational role
   */
  .post(
    '/me/active-role',
    async ({ user, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const { roleCode } = body;
        const role = await prisma.roles.findUnique({ where: { code: roleCode } });

        if (!role) {
          set.status = 404;
          return errorResponse('ROLE_NOT_FOUND', 'Role code not found');
        }

        const activeRole = await prisma.user_roles.findFirst({
          where: {
            user_id: user.id,
            role_id: role.id,
            revoked_at: null,
          },
        });

        if (!activeRole) {
          set.status = 403;
          return errorResponse('ROLE_NOT_ASSIGNED', 'User does not possess this role');
        }

        return successResponse({ activeRole: role.code }, `Active role switched to ${role.name}`);
      } catch (error) {
        set.status = 500;
        return errorResponse('ROLE_SWITCH_FAILED', error instanceof Error ? error.message : 'Error switching active role');
      }
    },
    {
      body: t.Object({ roleCode: t.String() }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Switch active user role' },
    }
  )

  /**
   * GET /api/v1/me/permissions
   * Active permissions matrix
   */
  .get(
    '/me/permissions',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const perms = await prisma.user_roles.findMany({
          where: { user_id: user.id },
          include: { roles: { include: { role_permissions: { include: { permissions: true } } } } },
        });

        return successResponse(perms, 'Active permissions retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', error instanceof Error ? error.message : 'Error fetching permissions');
      }
    },
    {
      detail: { tags: ['Signup & Onboarding'], summary: 'Get permissions matrix for current user' },
    }
  )

  /**
   * POST /api/v1/me/contact-change
   * Request email or phone change with OTP verification
   */
  .post(
    '/me/contact-change',
    async ({ user, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const { type, newValue } = body;
        const otpId = crypto.randomUUID();

        await prisma.otp_requests.create({
          data: {
            id: otpId,
            target: newValue,
            channel: type === 'email' ? 'email' : 'sms',
            purpose: 'verify',
            code_hash: '$2b$10$e7W...mock',
            expires_at: new Date(Date.now() + 10 * 60 * 1000),
          },
        });

        return successResponse({ otpId, type, newValue, devOtp: '123456' }, 'OTP sent to new contact destination');
      } catch (error) {
        set.status = 500;
        return errorResponse('CONTACT_CHANGE_FAILED', error instanceof Error ? error.message : 'Error initiating contact change');
      }
    },
    {
      body: t.Object({
        type: t.Union([t.Literal('email'), t.Literal('phone')]),
        newValue: t.String(),
      }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Initiate email or phone change' },
    }
  )

  /**
   * POST /api/v1/me/contact-change/verify
   * Confirm email/phone update using verified OTP
   */
  .post(
    '/me/contact-change/verify',
    async ({ user, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const { type, newValue, otpCode } = body;

        if (otpCode !== '123456') {
          set.status = 400;
          return errorResponse('INVALID_OTP', 'Invalid OTP code provided');
        }

        const updateData = type === 'email' ? { email: newValue } : { phone: newValue };
        await prisma.users.update({
          where: { id: user.id },
          data: updateData,
        });

        return successResponse({ type, newValue }, 'Contact details updated successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('VERIFY_FAILED', error instanceof Error ? error.message : 'Error verifying contact change');
      }
    },
    {
      body: t.Object({
        type: t.Union([t.Literal('email'), t.Literal('phone')]),
        newValue: t.String(),
        otpCode: t.String(),
      }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Verify and apply email or phone change' },
    }
  )

  /**
   * GET & POST /api/v1/me/addresses
   */
  .get(
    '/me/addresses',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const list = await prisma.addresses.findMany({
          where: { user_id: user.id, deleted_at: null },
        });

        return successResponse(list, 'Addresses retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching addresses');
      }
    },
    { detail: { tags: ['Signup & Onboarding'], summary: 'List user addresses' } }
  )
  .post(
    '/me/addresses',
    async ({ user, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const { kind, line1, line2, pinCode } = body;

        // Ensure PIN code exists or insert
        await prisma.pin_codes.upsert({
          where: { pin_code: pinCode },
          create: { pin_code: pinCode, city: 'City Name', state: 'State Name' },
          update: {},
        });

        const address = await prisma.addresses.create({
          data: {
            id: crypto.randomUUID(),
            user_id: user.id,
            kind,
            line1,
            line2,
            pin_code: pinCode,
          },
        });

        return successResponse(address, 'Address created successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('CREATE_FAILED', error instanceof Error ? error.message : 'Error creating address');
      }
    },
    {
      body: t.Object({
        kind: t.String({ description: 'permanent | communication' }),
        line1: t.String(),
        line2: t.Optional(t.String()),
        pinCode: t.String({ minLength: 6, maxLength: 6 }),
      }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Add a new user address' },
    }
  )
  .patch(
    '/me/addresses/:id',
    async ({ user, params, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const updated = await prisma.addresses.update({
          where: { id: params.id },
          data: body,
        });

        return successResponse(updated, 'Address updated successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('UPDATE_FAILED', 'Error updating address');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      body: t.Object({
        line1: t.Optional(t.String()),
        line2: t.Optional(t.String()),
        kind: t.Optional(t.String()),
      }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Update an existing address' },
    }
  )
  .delete(
    '/me/addresses/:id',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        await prisma.addresses.update({
          where: { id: params.id },
          data: { deleted_at: new Date() },
        });

        return successResponse({ id: params.id }, 'Address deleted');
      } catch (error) {
        set.status = 500;
        return errorResponse('DELETE_FAILED', 'Error deleting address');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Soft delete an address' },
    }
  )

  /**
   * GET /api/v1/lookup/pin-codes/:pin
   */
  .get(
    '/lookup/pin-codes/:pin',
    async ({ params, set }) => {
      try {
        const pinData = await prisma.pin_codes.findUnique({
          where: { pin_code: params.pin },
        });

        if (!pinData) {
          return successResponse({ pinCode: params.pin, city: 'Default City', state: 'Default State' }, 'Mock PIN lookup result');
        }

        return successResponse(pinData, 'PIN code details retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('LOOKUP_FAILED', 'PIN lookup error');
      }
    },
    {
      params: t.Object({ pin: t.String() }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Lookup city and state from PIN code' },
    }
  )

  /**
   * GET & POST /api/v1/me/emergency-contacts
   */
  .get(
    '/me/emergency-contacts',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const contacts = await prisma.emergency_contacts.findMany({
          where: { user_id: user.id },
        });

        return successResponse(contacts, 'Emergency contacts retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching emergency contacts');
      }
    },
    { detail: { tags: ['Signup & Onboarding'], summary: 'List emergency contacts' } }
  )
  .post(
    '/me/emergency-contacts',
    async ({ user, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const contact = await prisma.emergency_contacts.create({
          data: {
            id: crypto.randomUUID(),
            user_id: user.id,
            name: body.name,
            relation: body.relation,
            phone: body.phone,
          },
        });

        return successResponse(contact, 'Emergency contact created');
      } catch (error) {
        set.status = 500;
        return errorResponse('CREATE_FAILED', 'Error creating emergency contact');
      }
    },
    {
      body: t.Object({
        name: t.String(),
        relation: t.String(),
        phone: t.String(),
      }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Add emergency contact' },
    }
  )
  .patch(
    '/me/emergency-contacts/:id',
    async ({ user, params, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const updated = await prisma.emergency_contacts.update({
          where: { id: params.id },
          data: body,
        });

        return successResponse(updated, 'Emergency contact updated');
      } catch (error) {
        set.status = 500;
        return errorResponse('UPDATE_FAILED', 'Error updating emergency contact');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      body: t.Object({
        name: t.Optional(t.String()),
        relation: t.Optional(t.String()),
        phone: t.Optional(t.String()),
      }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Update emergency contact' },
    }
  )
  .delete(
    '/me/emergency-contacts/:id',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        await prisma.emergency_contacts.delete({
          where: { id: params.id },
        });

        return successResponse({ id: params.id }, 'Emergency contact deleted');
      } catch (error) {
        set.status = 500;
        return errorResponse('DELETE_FAILED', 'Error deleting emergency contact');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Signup & Onboarding'], summary: 'Delete emergency contact' },
    }
  )

  /**
   * ROLE REQUESTS (User Side)
   */
  .post(
    '/role-requests',
    async ({ user, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const { roleCode, claimedCode, departmentId, hostelId, evidenceFileId } = body;
        const role = await prisma.roles.findUnique({ where: { code: roleCode } });

        if (!role) {
          set.status = 404;
          return errorResponse('ROLE_NOT_FOUND', `Role '${roleCode}' not found`);
        }

        const existing = await prisma.role_requests.findFirst({
          where: {
            user_id: user.id,
            role_id: role.id,
            status: { in: ['pending', 'needs_info'] },
          },
        });

        if (existing) {
          set.status = 409;
          return errorResponse('REQUEST_EXISTS', 'You already have an active pending role request for this role');
        }

        const req = await prisma.role_requests.create({
          data: {
            id: crypto.randomUUID(),
            user_id: user.id,
            role_id: role.id,
            claimed_code: claimedCode,
            department_id: departmentId,
            hostel_id: hostelId,
            evidence_file_id: evidenceFileId,
            status: 'pending',
          },
        });

        return successResponse(req, 'Role request created successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('CREATE_FAILED', error instanceof Error ? error.message : 'Error creating role request');
      }
    },
    {
      body: t.Object({
        roleCode: t.String(),
        claimedCode: t.Optional(t.String()),
        departmentId: t.Optional(t.String({ format: 'uuid' })),
        hostelId: t.Optional(t.String({ format: 'uuid' })),
        evidenceFileId: t.Optional(t.String({ format: 'uuid' })),
      }),
      detail: { tags: ['Role Requests'], summary: 'Submit a new role request' },
    }
  )
  .get(
    '/role-requests',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const requests = await prisma.role_requests.findMany({
          where: { user_id: user.id },
          include: { roles: true },
          orderBy: { created_at: 'desc' },
        });

        return successResponse(requests, 'Role requests retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching role requests');
      }
    },
    { detail: { tags: ['Role Requests'], summary: 'List my submitted role requests' } }
  )
  .get(
    '/role-requests/:id',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const request = await prisma.role_requests.findFirst({
          where: { id: params.id, user_id: user.id },
          include: { roles: true },
        });

        if (!request) {
          set.status = 404;
          return errorResponse('NOT_FOUND', 'Role request not found');
        }

        return successResponse(request, 'Role request details retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching role request');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Role Requests'], summary: 'Get details of a specific role request' },
    }
  )
  .patch(
    '/role-requests/:id',
    async ({ user, params, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const request = await prisma.role_requests.findFirst({
          where: { id: params.id, user_id: user.id },
        });

        if (!request) {
          set.status = 404;
          return errorResponse('NOT_FOUND', 'Role request not found');
        }

        const updated = await prisma.role_requests.update({
          where: { id: params.id },
          data: {
            claimed_code: body.claimedCode ?? request.claimed_code,
            evidence_file_id: body.evidenceFileId ?? request.evidence_file_id,
            status: request.status === 'needs_info' ? 'pending' : request.status,
          },
        });

        return successResponse(updated, 'Role request updated');
      } catch (error) {
        set.status = 500;
        return errorResponse('UPDATE_FAILED', 'Error updating role request');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      body: t.Object({
        claimedCode: t.Optional(t.String()),
        evidenceFileId: t.Optional(t.String({ format: 'uuid' })),
      }),
      detail: { tags: ['Role Requests'], summary: 'Update pending/needs_info role request' },
    }
  )
  .post(
    '/role-requests/:id/cancel',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const request = await prisma.role_requests.update({
          where: { id: params.id },
          data: { status: 'cancelled' },
        });

        return successResponse(request, 'Role request cancelled');
      } catch (error) {
        set.status = 500;
        return errorResponse('CANCEL_FAILED', 'Error cancelling role request');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Role Requests'], summary: 'Cancel role request' },
    }
  )

  /**
   * PARENT LINK FLOW (User/Student Side)
   */
  .post(
    '/guardian-links',
    async ({ user, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const { studentAdmissionNo, studentDob, relation } = body;

        const studentUser = await prisma.users.findFirst({
          where: { user_code: studentAdmissionNo },
          include: { students: true },
        });

        if (!studentUser || !studentUser.students) {
          set.status = 404;
          return errorResponse('STUDENT_NOT_FOUND', 'No student found matching this admission number');
        }

        const dobMatch = studentUser.students.date_of_birth
          ? new Date(studentUser.students.date_of_birth).toISOString().slice(0, 10) === studentDob
          : false;

        const linkReq = await prisma.guardian_link_requests.create({
          data: {
            id: crypto.randomUUID(),
            guardian_user_id: user.id,
            student_id: studentUser.id,
            relation,
            dob_matched: dobMatch,
            status: 'pending_student',
          },
        });

        return successResponse(linkReq, 'Guardian link request submitted to student for confirmation');
      } catch (error) {
        set.status = 500;
        return errorResponse('LINK_REQUEST_FAILED', error instanceof Error ? error.message : 'Error creating guardian link');
      }
    },
    {
      body: t.Object({
        studentAdmissionNo: t.String(),
        studentDob: t.String({ description: 'YYYY-MM-DD' }),
        relation: t.Union([t.Literal('father'), t.Literal('mother'), t.Literal('guardian'), t.Literal('other')]),
      }),
      detail: { tags: ['Parent Link Flow'], summary: 'Request link to a student' },
    }
  )
  .get(
    '/guardian-links',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const links = await prisma.guardian_link_requests.findMany({
          where: { guardian_user_id: user.id },
          include: { students: { include: { users: true } } },
        });

        return successResponse(links, 'Guardian link requests retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching guardian links');
      }
    },
    { detail: { tags: ['Parent Link Flow'], summary: 'List submitted parent link requests' } }
  )
  .delete(
    '/guardian-links/:id',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        await prisma.guardian_link_requests.delete({ where: { id: params.id } });
        return successResponse({ id: params.id }, 'Guardian link request cancelled');
      } catch (error) {
        set.status = 500;
        return errorResponse('DELETE_FAILED', 'Error cancelling guardian link request');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Parent Link Flow'], summary: 'Cancel guardian link request' },
    }
  )

  /**
   * STUDENT GUARDIAN CONFIRMATIONS
   */
  .get(
    '/me/guardian-requests',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const requests = await prisma.guardian_link_requests.findMany({
          where: { student_id: user.id, status: 'pending_student' },
          include: { users_guardian_link_requests_guardian_user_idTousers: true },
        });

        return successResponse(requests, 'Pending guardian link requests retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching guardian requests');
      }
    },
    { detail: { tags: ['Parent Link Flow'], summary: 'Student views incoming parent link requests' } }
  )
  .post(
    '/me/guardian-requests/:id/confirm',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const link = await prisma.guardian_link_requests.findUnique({
          where: { id: params.id },
        });

        if (!link || link.student_id !== user.id) {
          set.status = 404;
          return errorResponse('NOT_FOUND', 'Guardian request not found for student');
        }

        // 1. Mark link request approved
        await prisma.guardian_link_requests.update({
          where: { id: params.id },
          data: { status: 'approved', student_confirmed_at: new Date(), decided_by: user.id, decided_at: new Date() },
        });

        // 2. Insert into guardians & student_guardians
        await prisma.guardians.upsert({
          where: { user_id: link.guardian_user_id },
          create: { user_id: link.guardian_user_id },
          update: {},
        });

        await prisma.student_guardians.upsert({
          where: { student_id_guardian_id: { student_id: user.id, guardian_id: link.guardian_user_id } },
          create: { student_id: user.id, guardian_id: link.guardian_user_id, relation: link.relation },
          update: {},
        });

        // 3. Insert default consents
        const scopes = ['fees', 'attendance', 'results', 'outpass'];
        for (const s of scopes) {
          await prisma.guardian_consents.upsert({
            where: { student_id_guardian_id_scope: { student_id: user.id, guardian_id: link.guardian_user_id, scope: s } },
            create: { student_id: user.id, guardian_id: link.guardian_user_id, scope: s },
            update: {},
          });
        }

        // 4. Activate parent user if registered
        const parentRole = await prisma.roles.findUnique({ where: { code: 'parent' } });
        if (parentRole) {
          await prisma.user_roles.create({
            data: { user_id: link.guardian_user_id, role_id: parentRole.id, granted_by: user.id },
          });
        }

        await prisma.users.update({
          where: { id: link.guardian_user_id },
          data: { status: 'active' },
        });

        return successResponse({ id: params.id }, 'Guardian link confirmed successfully');
      } catch (error) {
        set.status = 500;
        return errorResponse('CONFIRM_FAILED', error instanceof Error ? error.message : 'Error confirming guardian link');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Parent Link Flow'], summary: 'Student confirms parent link request' },
    }
  )
  .post(
    '/me/guardian-requests/:id/reject',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        await prisma.guardian_link_requests.update({
          where: { id: params.id },
          data: { status: 'rejected', decided_by: user.id, decided_at: new Date() },
        });

        return successResponse({ id: params.id }, 'Guardian request rejected');
      } catch (error) {
        set.status = 500;
        return errorResponse('REJECT_FAILED', 'Error rejecting guardian link');
      }
    },
    {
      params: t.Object({ id: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Parent Link Flow'], summary: 'Student rejects parent link request' },
    }
  )
  .get(
    '/me/guardians',
    async ({ user, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const list = await prisma.student_guardians.findMany({
          where: { student_id: user.id },
          include: { guardians: { include: { users: true } } },
        });

        return successResponse(list, 'Linked guardians retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching linked guardians');
      }
    },
    { detail: { tags: ['Parent Link Flow'], summary: 'Student views linked parents' } }
  )
  .delete(
    '/me/guardians/:guardianId',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        await prisma.student_guardians.deleteMany({
          where: { student_id: user.id, guardian_id: params.guardianId },
        });

        return successResponse({ guardianId: params.guardianId }, 'Guardian unlinked');
      } catch (error) {
        set.status = 500;
        return errorResponse('DELETE_FAILED', 'Error unlinking guardian');
      }
    },
    {
      params: t.Object({ guardianId: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Parent Link Flow'], summary: 'Unlink parent' },
    }
  )
  .get(
    '/me/guardians/:guardianId/consents',
    async ({ user, params, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const consents = await prisma.guardian_consents.findMany({
          where: { student_id: user.id, guardian_id: params.guardianId },
        });

        return successResponse(consents, 'Guardian consent scopes retrieved');
      } catch (error) {
        set.status = 500;
        return errorResponse('FETCH_FAILED', 'Error fetching consents');
      }
    },
    {
      params: t.Object({ guardianId: t.String({ format: 'uuid' }) }),
      detail: { tags: ['Parent Link Flow'], summary: 'Get guardian data consents' },
    }
  )
  .put(
    '/me/guardians/:guardianId/consents',
    async ({ user, params, body, set }) => {
      try {
        if (!user) {
          set.status = 401;
          return errorResponse('UNAUTHORIZED', 'Authentication token required');
        }

        const { scopes } = body;

        // Reset existing consents and add enabled scopes
        await prisma.guardian_consents.deleteMany({
          where: { student_id: user.id, guardian_id: params.guardianId },
        });

        for (const s of scopes) {
          await prisma.guardian_consents.create({
            data: { student_id: user.id, guardian_id: params.guardianId, scope: s },
          });
        }

        return successResponse({ scopes }, 'Guardian consents updated');
      } catch (error) {
        set.status = 500;
        return errorResponse('UPDATE_FAILED', 'Error updating consents');
      }
    },
    {
      params: t.Object({ guardianId: t.String({ format: 'uuid' }) }),
      body: t.Object({ scopes: t.Array(t.String()) }),
      detail: { tags: ['Parent Link Flow'], summary: 'Update parent data sharing consents' },
    }
  );
