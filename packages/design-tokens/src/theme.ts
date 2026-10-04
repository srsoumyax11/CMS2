import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radius } from './radius';

export const lightTheme = {
  isDark: false,
  colors: {
    surface: colors.gray[50],
    card: colors.white,
    text: colors.gray[900],
    textMuted: colors.gray[500],
    border: colors.gray[200],
    primary: colors.primary[600],
    primaryContrast: colors.white,
    success: colors.success.main,
    danger: colors.danger.main,
    warning: colors.warning.main,
    info: colors.info.main,
  },
  spacing,
  typography,
  radius,
} as const;

export const darkTheme = {
  isDark: true,
  colors: {
    surface: colors.gray[900],
    card: colors.gray[800],
    text: colors.gray[50],
    textMuted: colors.gray[400],
    border: colors.gray[700],
    primary: colors.primary[400],
    primaryContrast: colors.gray[900],
    success: colors.success.main,
    danger: colors.danger.main,
    warning: colors.warning.main,
    info: colors.info.main,
  },
  spacing,
  typography,
  radius,
} as const;

export type Theme = typeof lightTheme;
