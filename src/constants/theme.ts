// LanternLoom — DARK_PREMIUM preset with the brief's accent override.
// Rule #11b: the `name` field stays exactly as in the preset; only accents change.

export const theme = {
  name: 'dark-premium',

  colors: {
    bg: {
      deepest: '#05070C',
      primary: '#10141F',
      secondary: '#0B0E17',
      tertiary: '#1A2032',
      accent: '#3A4A6B',
    },
    accent: {
      primary: '#F2B134', // lantern amber
      primaryDark: '#E09A22',
      secondary: '#5FD3C4', // light-thread teal
      secondaryDark: '#3FB3A6',
      warm: '#F2B134',
      cool: '#5FD3C4',
      success: '#5FD3C4',
    },
    text: {
      primary: '#F5F1E6',
      secondary: 'rgba(245,241,230,0.50)',
      tertiary: 'rgba(245,241,230,0.32)',
      accent: '#F2B134',
      onAccent: '#10141F',
    },
    ui: {
      border: 'rgba(245,241,230,0.08)',
      borderStrong: 'rgba(245,241,230,0.16)',
      divider: 'rgba(245,241,230,0.06)',
      overlay: 'rgba(11,14,23,0.90)',
      glass: 'rgba(26,32,50,0.86)',
      glassSoft: 'rgba(26,32,50,0.72)',
      tile: 'rgba(58,74,107,0.42)',
      threadOff: '#3A4A6B',
    },
  },

  gradients: {
    amber: ['#F2B134', '#E09A22'],
    teal: ['#5FD3C4', '#3FB3A6'],
    thread: ['#F2B134', '#5FD3C4'],
    surface: ['#1A2032', '#10141F'],
    loader: ['rgba(5,7,12,0.95)', 'rgba(11,14,23,0.90)', 'rgba(16,20,31,0.96)'],
    menu: ['rgba(16,20,31,0.82)', 'rgba(16,20,31,0.60)', 'rgba(11,14,23,0.93)'],
    levels: ['rgba(11,14,23,0.86)', 'rgba(16,20,31,0.68)', 'rgba(11,14,23,0.94)'],
    board: ['rgba(11,14,23,0.90)', 'rgba(16,20,31,0.86)', 'rgba(11,14,23,0.95)'],
    result: ['#0B0E17', '#10141F', '#1A2032'],
    panel: ['rgba(16,20,31,0.90)', 'rgba(26,32,50,0.78)', 'rgba(11,14,23,0.94)'],
  },

  typography: {
    hero: { fontSize: 34, fontWeight: '800' as const, letterSpacing: 5 },
    title: { fontSize: 30, fontWeight: '900' as const, letterSpacing: 3 },
    section: { fontSize: 20, fontWeight: '800' as const, letterSpacing: 1.6 },
    stat: { fontSize: 22, fontWeight: '800' as const, letterSpacing: 0 },
    button: { fontSize: 17, fontWeight: '900' as const, letterSpacing: 1.4 },
    body: { fontSize: 15, fontWeight: '700' as const, letterSpacing: 1.2 },
    caption: { fontSize: 10, fontWeight: '600' as const, letterSpacing: 1.6 },
  },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },

  radius: { sm: 8, md: 14, lg: 18, xl: 22, xxl: 28, pill: 100 },

  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 8,
    },
    plate: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 16,
    },
    amber: {
      shadowColor: '#F2B134',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 22,
      elevation: 12,
    },
    teal: {
      shadowColor: '#5FD3C4',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 10,
    },
  },

  animation: {
    press: { tension: 300, friction: 12 },
    settle: { tension: 170, friction: 14 },
    entrance: { tension: 60, friction: 9 },
    star: { tension: 120, friction: 7 },
    plate: { tension: 52, friction: 8 },
  },
};

export type Theme = typeof theme;
export default theme;
