export const layout = {
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
  minTouchTarget: 44,
  sidebarWidth: 240,
  breakpoints: {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  },
} as const;

export type Layout = typeof layout;
