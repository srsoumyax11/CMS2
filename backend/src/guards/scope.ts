import { prisma } from '../config/prisma';

export class ScopeError extends Error {
  public statusCode = 403;
  constructor(message: string) {
    super(message);
    this.name = 'ScopeError';
  }
}

export interface UserContext {
  sub: string;
  roles?: string[];
  hostelId?: string;
}

/**
 * Ensures a student can only access their own resource, unless accessed by elevated personas (admin, warden, faculty, parent)
 */
export function verifyStudentScope(user: UserContext, targetStudentUserId: string): void {
  const isSelf = user.sub === targetStudentUserId;
  const isElevated = user.roles?.some((r) => ['admin', 'super_admin', 'warden', 'faculty', 'parent'].includes(r));

  if (!isSelf && !isElevated) {
    throw new ScopeError('Access denied: You are not authorized to view or modify this student resource.');
  }
}

/**
 * Ensures a warden can only access resources in their assigned hostel, unless admin
 */
export function verifyWardenHostelScope(user: UserContext, targetHostelId: string): void {
  const isAdmin = user.roles?.some((r) => ['admin', 'super_admin'].includes(r));
  const isAssignedWarden = user.roles?.includes('warden') && user.hostelId === targetHostelId;

  if (!isAdmin && !isAssignedWarden) {
    throw new ScopeError('Access denied: You can only manage hostel operations for your assigned hostel building.');
  }
}

/**
 * Ensures a parent can only access data for their verified and linked children
 */
export async function verifyParentChildScope(parentUserId: string, childUserId: string): Promise<void> {
  const isLinked = await prisma.student_guardians.findFirst({
    where: {
      student_id: childUserId,
      guardian_id: parentUserId,
    },
  });

  if (!isLinked) {
    throw new ScopeError('Access denied: Student is not linked to your parent account.');
  }
}
