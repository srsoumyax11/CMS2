export type UserRole = 'student' | 'faculty' | 'warden' | 'parent' | 'admin';

export type AccountStatus =
  | 'registered'
  | 'pending_approval'
  | 'active'
  | 'rejected'
  | 'frozen'
  | 'archived';

/**
 * Screen-to-permission mapping driven by backend permissions array returned from `GET /api/v1/me/permissions`.
 * UI screens check required permissions dynamically against the runtime permissions set.
 */
export const SCREEN_PERMISSIONS: Record<string, string> = {
  outpassApply: 'outpass.apply',
  outpassApprove: 'outpass.approve',
  attendanceLaunch: 'attendance.launch',
  attendanceDispute: 'attendance.dispute',
  roomAllocation: 'rooms.allocate',
  feesPayment: 'children.payments.initiate',
  userGovernance: 'admin.users.manage',
  safetyCases: 'safety.cases.view',
};

/**
 * Checks if the user's runtime permissions list (retrieved from GET /api/v1/me/permissions)
 * contains the required permission code or wildcards.
 */
export function hasPermission(activePermissions: string[], requiredPermission: string): boolean {
  if (!activePermissions || activePermissions.length === 0) {
    return false;
  }
  if (activePermissions.includes('*')) {
    return true;
  }
  return activePermissions.includes(requiredPermission);
}
