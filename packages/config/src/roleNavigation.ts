export interface NavItemConfig {
  id: string;
  labelKey: string;
  icon: string;
  route: string;
  permission?: string;
}

export interface DashboardCardConfig {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  icon: string;
  route: string;
  permission?: string;
}

export interface RoleConfig {
  navItems: NavItemConfig[];
  dashboardCards: DashboardCardConfig[];
}

export const roleNavigationMap: Record<string, RoleConfig> = {
  student: {
    navItems: [
      { id: 'home', labelKey: 'nav.home', icon: 'home', route: '/(dashboard)' },
      { id: 'notices', labelKey: 'nav.notices', icon: 'bell', route: '/(dashboard)/notices', permission: 'read:notice' },
      { id: 'outpass', labelKey: 'nav.outpass', icon: 'log-out', route: '/(dashboard)/outpass', permission: 'read:outpass' },
      { id: 'complaints', labelKey: 'nav.complaints', icon: 'alert-circle', route: '/(dashboard)/complaints', permission: 'read:complaint' },
      { id: 'attendance', labelKey: 'nav.attendance', icon: 'calendar', route: '/(dashboard)/attendance', permission: 'read:attendance' },
      { id: 'fees', labelKey: 'nav.fees', icon: 'dollar-sign', route: '/(dashboard)/fees', permission: 'read:fee' },
    ],
    dashboardCards: [
      { id: 'notices', titleKey: 'dashboard.noticesTitle', descriptionKey: 'dashboard.noticesDesc', icon: 'bell', route: '/(dashboard)/notices', permission: 'read:notice' },
      { id: 'outpass', titleKey: 'dashboard.outpassTitle', descriptionKey: 'dashboard.outpassDesc', icon: 'log-out', route: '/(dashboard)/outpass', permission: 'read:outpass' },
      { id: 'complaints', titleKey: 'dashboard.complaintsTitle', descriptionKey: 'dashboard.complaintsDesc', icon: 'alert-circle', route: '/(dashboard)/complaints', permission: 'read:complaint' },
      { id: 'attendance', titleKey: 'dashboard.attendanceTitle', descriptionKey: 'dashboard.attendanceDesc', icon: 'calendar', route: '/(dashboard)/attendance', permission: 'read:attendance' },
      { id: 'fees', titleKey: 'dashboard.feesTitle', descriptionKey: 'dashboard.feesDesc', icon: 'dollar-sign', route: '/(dashboard)/fees', permission: 'read:fee' },
      { id: 'sos', titleKey: 'dashboard.sosTitle', descriptionKey: 'dashboard.sosDesc', icon: 'alert-octagon', route: '/(dashboard)/sos' },
    ],
  },
  warden: {
    navItems: [
      { id: 'home', labelKey: 'nav.home', icon: 'home', route: '/(dashboard)' },
      { id: 'outpass_inbox', labelKey: 'nav.outpassInbox', icon: 'inbox', route: '/(dashboard)/warden/outpass', permission: 'approve:outpass' },
      { id: 'sos_live', labelKey: 'nav.sosLive', icon: 'shield-alert', route: '/(dashboard)/warden/sos', permission: 'read:sos' },
      { id: 'complaints_board', labelKey: 'nav.complaintsBoard', icon: 'clipboard', route: '/(dashboard)/warden/complaints', permission: 'manage:complaint' },
    ],
    dashboardCards: [
      { id: 'outpass_inbox', titleKey: 'dashboard.outpassInboxTitle', descriptionKey: 'dashboard.outpassInboxDesc', icon: 'inbox', route: '/(dashboard)/warden/outpass', permission: 'approve:outpass' },
      { id: 'sos_live', titleKey: 'dashboard.sosLiveTitle', descriptionKey: 'dashboard.sosLiveDesc', icon: 'shield-alert', route: '/(dashboard)/warden/sos', permission: 'read:sos' },
      { id: 'complaints_board', titleKey: 'dashboard.complaintsBoardTitle', descriptionKey: 'dashboard.complaintsBoardDesc', icon: 'clipboard', route: '/(dashboard)/warden/complaints', permission: 'manage:complaint' },
    ],
  },
  faculty: {
    navItems: [
      { id: 'home', labelKey: 'nav.home', icon: 'home', route: '/(dashboard)' },
      { id: 'attendance_session', labelKey: 'nav.attendanceSession', icon: 'qr-code', route: '/(dashboard)/faculty/attendance', permission: 'mark:attendance' },
      { id: 'timetable', labelKey: 'nav.timetable', icon: 'clock', route: '/(dashboard)/faculty/timetable', permission: 'read:timetable' },
    ],
    dashboardCards: [
      { id: 'attendance_session', titleKey: 'dashboard.attendanceSessionTitle', descriptionKey: 'dashboard.attendanceSessionDesc', icon: 'qr-code', route: '/(dashboard)/faculty/attendance', permission: 'mark:attendance' },
      { id: 'timetable', titleKey: 'dashboard.timetableTitle', descriptionKey: 'dashboard.timetableDesc', icon: 'clock', route: '/(dashboard)/faculty/timetable', permission: 'read:timetable' },
    ],
  },
  parent: {
    navItems: [
      { id: 'home', labelKey: 'nav.home', icon: 'home', route: '/(dashboard)' },
      { id: 'child_link', labelKey: 'nav.childLink', icon: 'users', route: '/(dashboard)/parent/link' },
      { id: 'fees', labelKey: 'nav.fees', icon: 'dollar-sign', route: '/(dashboard)/parent/fees' },
      { id: 'outpass_alerts', labelKey: 'nav.outpassAlerts', icon: 'bell', route: '/(dashboard)/parent/outpass' },
    ],
    dashboardCards: [
      { id: 'child_link', titleKey: 'dashboard.childLinkTitle', descriptionKey: 'dashboard.childLinkDesc', icon: 'users', route: '/(dashboard)/parent/link' },
      { id: 'fees', titleKey: 'dashboard.feesTitle', descriptionKey: 'dashboard.feesDesc', icon: 'dollar-sign', route: '/(dashboard)/parent/fees' },
      { id: 'outpass_alerts', titleKey: 'dashboard.outpassAlertsTitle', descriptionKey: 'dashboard.outpassAlertsDesc', icon: 'bell', route: '/(dashboard)/parent/outpass' },
    ],
  },
  admin: {
    navItems: [
      { id: 'home', labelKey: 'nav.home', icon: 'home', route: '/(dashboard)' },
      { id: 'approvals', labelKey: 'nav.approvals', icon: 'check-square', route: '/(dashboard)/admin/approvals', permission: 'manage:approvals' },
      { id: 'notices', labelKey: 'nav.notices', icon: 'file-text', route: '/(dashboard)/admin/notices', permission: 'manage:notices' },
    ],
    dashboardCards: [
      { id: 'approvals', titleKey: 'dashboard.approvalsTitle', descriptionKey: 'dashboard.approvalsDesc', icon: 'check-square', route: '/(dashboard)/admin/approvals', permission: 'manage:approvals' },
      { id: 'notices', titleKey: 'dashboard.noticesTitle', descriptionKey: 'dashboard.noticesDesc', icon: 'file-text', route: '/(dashboard)/admin/notices', permission: 'manage:notices' },
    ],
  },
};

export function getNavigationForRole(role: string): RoleConfig {
  return roleNavigationMap[role] || roleNavigationMap.student;
}
