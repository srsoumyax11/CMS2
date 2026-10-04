import { ROLES, Role } from './roles';

export const PERMISSIONS = {
  APPROVE_OUTPASS: [ROLES.WARDEN, ROLES.ADMIN],
  MANAGE_COMPLAINTS: [ROLES.WARDEN, ROLES.FACULTY, ROLES.ADMIN],
  VIEW_ALL_ATTENDANCE: [ROLES.FACULTY, ROLES.ADMIN],
  TRIGGER_EMERGENCY_SOS: [ROLES.STUDENT, ROLES.WARDEN, ROLES.FACULTY, ROLES.ADMIN],
} as const;

export function hasPermission(role: Role, allowedRoles: readonly Role[]): boolean {
  return allowedRoles.includes(role);
}
