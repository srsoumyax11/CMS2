export type UserRole = 'student' | 'faculty' | 'warden' | 'parent' | 'admin';
export type AccountStatus = 'registered' | 'pending_approval' | 'active' | 'rejected' | 'frozen' | 'archived';
/**
 * Screen-to-permission mapping driven by backend permissions array returned from `GET /api/v1/me/permissions`.
 * UI screens check required permissions dynamically against the runtime permissions set.
 */
export declare const SCREEN_PERMISSIONS: Record<string, string>;
/**
 * Checks if the user's runtime permissions list (retrieved from GET /api/v1/me/permissions)
 * contains the required permission code or wildcards.
 */
export declare function hasPermission(activePermissions: string[], requiredPermission: string): boolean;
//# sourceMappingURL=permissions.d.ts.map