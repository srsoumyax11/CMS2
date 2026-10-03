// Design System Tokens for Flat Design Aesthetics
// Strictly 2D, solid bright colors, no shadows, no gradients, clean geometric borders

export const Tokens = {
  colors: {
    // 4-6 Solid Bright Palette
    primary: '#2563EB',      // Solid Royal Blue
    primaryHover: '#1D4ED8',
    secondary: '#059669',    // Solid Emerald Green
    secondaryHover: '#047857',
    accentOrange: '#EA580C', // Solid Vibrant Orange
    accentRed: '#DC2626',    // Solid Emergency Red
    accentPurple: '#7C3AED', // Solid Deep Purple
    accentYellow: '#D97706', // Solid Amber

    // Neutral Surfaces (Light & Dark mode support)
    bgLight: '#F8FAFC',
    bgDark: '#0F172A',
    surfaceLight: '#FFFFFF',
    surfaceDark: '#1E293B',
    surfaceHighlightLight: '#EEF2FF',
    surfaceHighlightDark: '#1E1B4B',

    // Text & Borders
    textDark: '#0F172A',
    textLight: '#F8FAFC',
    textMuted: '#64748B',
    textInverted: '#FFFFFF',
    borderLight: '#CBD5E1',
    borderDark: '#334155',
    borderActive: '#2563EB',
  },

  radii: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    pill: 9999,
  },

  borderWidths: {
    none: 0,
    thin: 1,
    flat: 2,
    thick: 3,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    heroTitle: { fontSize: 36, fontWeight: '900' as const, lineHeight: 44 },
    sectionTitle: { fontSize: 24, fontWeight: '800' as const, lineHeight: 32 },
    cardTitle: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
    body: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    subtext: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
    button: { fontSize: 14, fontWeight: '700' as const },
    badge: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 1 },
  },

  // Flat Design Rule: No Shadows!
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
};
