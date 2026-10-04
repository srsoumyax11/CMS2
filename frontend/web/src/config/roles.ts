export const ROLES = {
  STUDENT: 'STUDENT',
  WARDEN: 'WARDEN',
  FACULTY: 'FACULTY',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
