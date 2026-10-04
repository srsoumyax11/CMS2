export const colors = {
  white: '#ffffff',
  black: '#000000',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  // Brand Palette
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  // Neutral Palette
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  // Semantic Colors
  success: {
    light: '#dcfce7',
    main: '#16a34a',
    dark: '#15803d',
  },
  warning: {
    light: '#fef3c7',
    main: '#d97706',
    dark: '#b45309',
  },
  danger: {
    light: '#fee2e2',
    main: '#dc2626',
    dark: '#b91c1c',
  },
  info: {
    light: '#e0f2fe',
    main: '#0284c7',
    dark: '#0369a1',
  },
} as const;

export type Colors = typeof colors;
