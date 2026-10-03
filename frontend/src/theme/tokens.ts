// Master Design System Tokens per Genesis (frontend/design.md)
// Quietly confident, Indigo (#6366F1) accent, 6px button/input radius, 12px card radius, #FAFAFA background

export const Tokens = {
  colors: {
    // Brand Core & Interactive Accents
    primary: '#6366F1',           // Indigo - CTAs, active states, links, interactive highlights
    primaryHover: '#4F46E5',      // Darker indigo
    secondary: '#20970B',         // Brand highlight green
    neutral: '#9C9C9C',           // Muted text, placeholders, timestamps, disabled states

    // Backward Compatibility & Ink Aliases
    ink: '#0A0A0A',               // Genesis Text Primary
    canvas: '#FFFFFF',            // Surface white
    softCloud: '#F4F4F6',         // Soft surface gray
    hairline: '#E8E8EC',          // Border gray
    hairlineSoft: '#F0F0F4',
    charcoal: '#6B6B6B',
    ash: '#9C9C9C',
    mute: '#6B6B6B',
    stone: '#9C9C9C',

    // Surfaces & Backgrounds
    background: '#FAFAFA',        // Page background, light warm gray
    bgLight: '#FAFAFA',
    bgDark: '#0A0A0C',
    surface: '#FFFFFF',           // Cards, panels, modals, nav backdrop
    surfaceLight: '#FFFFFF',
    surfaceDark: '#141416',
    surfaceSoftLight: '#F4F4F6',
    surfaceSoftDark: '#1E1E22',

    // Text Hierarchy
    textPrimary: '#0A0A0A',       // Headings, body text, primary labels — near-black
    textSecondary: '#6B6B6B',     // Descriptions, metadata, secondary labels
    textMuted: '#9C9C9C',         // Muted text
    textDark: '#0A0A0A',
    textLight: '#FAFAFA',
    textInverted: '#FFFFFF',

    // Borders & Hairlines
    border: '#E8E8EC',            // Card borders, dividers, input borders — subtle
    borderLight: '#E8E8EC',
    borderDark: '#2C2C30',
    borderActive: '#6366F1',

    // Semantic Status
    success: '#10B981',           // Published status, confirmations, positive indicators
    warning: '#F59E0B',           // Pending states, caution banners
    error: '#EF4444',             // Destructive actions, validation errors, rejected status
    sale: '#EF4444',
    accentOrange: '#F59E0B',
    accentYellow: '#F59E0B',
    accentRed: '#EF4444',
    accentPurple: '#8B5CF6',
    accentTeal: '#14B8A6',
    accentPink: '#EC4899',
  },

  radii: {
    none: 0,
    xs: 4,          // Tags, chips, badges, inline code (4px)
    sm: 4,          // Tags, chips, badges (4px)
    md: 6,          // Buttons, inputs, selects (6px)
    lg: 8,          // Metadata cards, dropdowns, panels (8px)
    xl: 12,         // Kit preview cards, search bar, featured sections (12px)
    pill: 9999,     // Avatars, status dots, pill badges (9999px)
    full: 9999,     // Avatars & circular icons (9999px)
  },

  borderWidths: {
    none: 0,
    thin: 1,
    flat: 1,
    thick: 2,
  },

  spacing: {
    base: 4,        // 4px base unit
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    section: 64,    // Section spacing (64px desktop / 32px mobile)
  },

  typography: {
    display: { fontSize: 72, fontWeight: '700' as const, lineHeight: 78, letterSpacing: -0.04 },
    headline: { fontSize: 60, fontWeight: '700' as const, lineHeight: 66, letterSpacing: -0.03 },
    displayCampaign: { fontSize: 44, fontWeight: '700' as const, lineHeight: 50, letterSpacing: -0.03 },
    headingXl: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38, letterSpacing: -0.02 },
    headingLg: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30, letterSpacing: -0.01 },
    headingMd: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
    bodyMd: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    bodyStrong: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
    buttonLg: { fontSize: 16, fontWeight: '600' as const },
    buttonMd: { fontSize: 14, fontWeight: '600' as const },
    buttonSm: { fontSize: 13, fontWeight: '600' as const },
    linkMd: { fontSize: 15, fontWeight: '600' as const, color: '#6366F1' },
    captionMd: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
    captionSm: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
    utilityXs: { fontSize: 11, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    subtle: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    hoverCard: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 30,
      elevation: 4,
    },
    buttonGlow: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 4,
    },
  },
};
