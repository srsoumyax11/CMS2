// Master Design System Tokens per frontend/design.md
// Editorial Contrast, Nike Black (#111111), Soft Cloud (#F5F5F5), Pill CTAs (30px pill radius), Flat 0 Elevation

export const Tokens = {
  colors: {
    // Brand Core
    ink: '#111111',           // Nike Black - Primary CTA, active filter, headlines, primary text
    canvas: '#FFFFFF',        // Pure White background
    softCloud: '#F5F5F5',     // Soft Cloud stage gray for product card backdrops & secondary pills
    hairline: '#CACACB',      // 1px solid dividers
    hairlineSoft: '#E5E5E5',  // Inset hairline borders
    charcoal: '#39393B',      // Secondary body copy
    ash: '#4B4B4D',           // Low-emphasis secondary border & text
    mute: '#707072',          // Category subtitles, metadata, footer link text
    stone: '#9E9EA0',         // Utility text

    // Semantic Accents
    primary: '#111111',       // Universal Black Primary
    primaryHover: '#000000',
    secondary: '#007D48',     // Success Green (#007D48)
    secondaryHover: '#006238',
    sale: '#D30005',          // Retail Discount Red text
    saleDeep: '#780700',
    success: '#007D48',       // Confirmation / In-stock green
    successBright: '#1EAA52',
    info: '#1151FF',          // Information link accent
    infoDeep: '#0034E3',
    accentOrange: '#EA580C',  // Alert state
    accentYellow: '#EAB308',  // Warning status accent
    accentRed: '#D30005',     // Alert / Sale
    accentPurple: '#BEAFFD',  // Collection accent
    accentTeal: '#0A7281',    // ACG Outdoor accent
    accentPink: '#ED1AA0',    // Collection accent

    // Surfaces & Modes
    bgLight: '#FFFFFF',
    bgDark: '#0B0B0C',
    surfaceLight: '#FFFFFF',
    surfaceDark: '#161618',
    surfaceSoftLight: '#F5F5F5',
    surfaceSoftDark: '#222225',

    // Text & Border Aliases
    textDark: '#111111',
    textLight: '#F5F5F5',
    textMuted: '#707072',
    textInverted: '#FFFFFF',
    borderLight: '#CACACB',
    borderSoft: '#E5E5E5',
    borderDark: '#333336',
    borderActive: '#111111',
  },

  radii: {
    none: 0,        // Flat 0px sharp corners for all containers, cards, imagery & footer
    sm: 18,         // Icon / avatar background containers
    md: 24,         // Search pill & input fields
    lg: 30,         // Universal CTA Pill (30px radius)
    pill: 30,       // Synonym for universal CTA pill (30px radius)
    full: 9999,     // Circular icon buttons & color swatch dots
  },

  borderWidths: {
    none: 0,
    thin: 1,
    flat: 2,
    thick: 3,
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,          // Base unit gutter / card gap
    md: 12,
    lg: 18,
    xl: 24,
    xxl: 30,
    section: 48,    // Universal vertical section rhythm
  },

  typography: {
    displayCampaign: { fontSize: 36, fontWeight: '900' as const, lineHeight: 42, letterSpacing: -0.5, textTransform: 'uppercase' as const },
    headingXl: { fontSize: 32, fontWeight: '800' as const, lineHeight: 38, letterSpacing: 0 },
    headingLg: { fontSize: 24, fontWeight: '800' as const, lineHeight: 30, letterSpacing: 0 },
    headingMd: { fontSize: 16, fontWeight: '700' as const, lineHeight: 22, letterSpacing: 0 },
    bodyMd: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodyStrong: { fontSize: 16, fontWeight: '700' as const, lineHeight: 24 },
    buttonLg: { fontSize: 24, fontWeight: '800' as const },
    buttonMd: { fontSize: 16, fontWeight: '700' as const },
    buttonSm: { fontSize: 14, fontWeight: '700' as const },
    linkMd: { fontSize: 16, fontWeight: '700' as const, lineHeight: 24, textDecorationLine: 'underline' as const },
    captionMd: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
    captionSm: { fontSize: 12, fontWeight: '600' as const, lineHeight: 18 },
    utilityXs: { fontSize: 9, fontWeight: '500' as const, lineHeight: 14 },
  },

  // Zero Elevation / No Shadows rule per design.md
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

