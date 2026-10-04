export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  OUTPASS: {
    LIST: '/outpass',
    CREATE: '/outpass/new',
    DETAILS: (id: string) => `/outpass/${id}`,
  },
  COMPLAINTS: {
    LIST: '/complaints',
    CREATE: '/complaints/new',
    DETAILS: (id: string) => `/complaints/${id}`,
  },
  FEES: {
    SUMMARY: '/fees',
    PAYMENT: '/fees/pay',
  },
  ATTENDANCE: {
    OVERVIEW: '/attendance',
  },
  SOS: {
    ALERT: '/sos',
  },
  APPROVALS: {
    LIST: '/approvals',
  },
} as const;

export type RouteKeys = typeof ROUTES;
