export const theme = {
  colors: {
    background: '#0B0F19',       // Deep slate midnight blue
    surface: '#151B2C',          // Sleek card blue-slate
    surfaceLight: '#1F293D',     // Elevated card background
    primary: '#6366F1',          // Indigo primary
    primaryLight: '#818CF8',     // Light indigo for highlights
    secondary: '#10B981',        // Emerald success/price
    accent: '#F59E0B',           // Amber rating/warning
    danger: '#EF4444',           // Soft red
    textPrimary: '#F3F4F6',      // Premium off-white
    textSecondary: '#9CA3AF',    // Muted grey
    textMuted: '#6B7280',        // Dark grey/disabled
    border: '#1F293D',           // Subdued slate borders
    borderLight: 'rgba(255, 255, 255, 0.08)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    white: '#FFFFFF',
    black: '#000000',
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
    },
    h2: {
      fontSize: 22,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    bodySemibold: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  roundness: {
    sm: 8,
    md: 16,
    lg: 24,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 5,
    },
    strong: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};
