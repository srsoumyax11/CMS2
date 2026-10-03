import { Elysia } from 'elysia';
import { prisma } from '../config/prisma';
import { errorResponse } from '../utils/response';
import { verifyToken } from '../utils/jwt';

export interface AuthUser {
  id: string;
  userCode: string;
  fullName: string;
  status: string;
  roles: string[];
}

/**
 * Derives current authenticated user from Bearer Token header (Global scope across plugin routes)
 * Fixes SEC-001 by enforcing real signed JWT verification
 */
export const jwtAuth = new Elysia({ name: 'jwtAuth' })
  .derive({ as: 'global' }, async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null as AuthUser | null };
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return { user: null as AuthUser | null };
    }

    const payload = verifyToken(token);
    if (!payload || payload.type !== 'access' || !payload.sub) {
      return { user: null as AuthUser | null };
    }

    try {
      const user = await prisma.users.findUnique({
        where: { id: payload.sub },
        include: {
          user_roles_user_roles_user_idTousers: {
            include: {
              roles: true,
            },
          },
        },
      });

      if (user && ['active', 'registered', 'pending_approval'].includes(user.status) && !user.deleted_at) {
        const roles = user.user_roles_user_roles_user_idTousers.map((ur: any) => ur.roles.code);
        const authUser: AuthUser = {
          id: user.id,
          userCode: user.user_code || '',
          fullName: user.full_name,
          status: user.status,
          roles,
        };
        return { user: authUser };
      }
    } catch (err) {
      return { user: null as AuthUser | null };
    }

    return { user: null as AuthUser | null };
  });

/**
 * Role-based guard helper
 */
export const requireRoles = (allowedRoles: string[]) => {
  return (app: Elysia) =>
    app.use(jwtAuth).onBeforeHandle(({ user, set }) => {
      if (!user) {
        set.status = 401;
        return errorResponse('UNAUTHORIZED', 'Authentication token is missing or invalid');
      }

      const hasRole = allowedRoles.some((role) => user.roles.includes(role));
      if (!hasRole) {
        set.status = 403;
        return errorResponse('FORBIDDEN', `Access restricted to roles: ${allowedRoles.join(', ')}`);
      }
    });
};
