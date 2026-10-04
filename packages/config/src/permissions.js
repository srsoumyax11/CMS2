"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCREEN_PERMISSIONS = void 0;
exports.hasPermission = hasPermission;
/**
 * Screen-to-permission mapping driven by backend permissions array returned from `GET /api/v1/me/permissions`.
 * UI screens check required permissions dynamically against the runtime permissions set.
 */
exports.SCREEN_PERMISSIONS = {
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
function hasPermission(activePermissions, requiredPermission) {
    if (!activePermissions || activePermissions.length === 0) {
        return false;
    }
    if (activePermissions.includes('*')) {
        return true;
    }
    return activePermissions.includes(requiredPermission);
}
//# sourceMappingURL=permissions.js.map