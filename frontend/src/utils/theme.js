export const getDesignTokens = (mode) => ({
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'none', // Disable transitions that might cause layout shift
        }
      }
    },
    MuiBox: {
      styleOverrides: {
        root: {
          transition: 'none', // Disable transitions that might cause layout shift
        }
      }
    }
  },
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#2f2f2f' }, // softer dark gray instead of near-black
          secondary: { main: '#6b7280' }, // gentle neutral gray-blue
          background: {
            default: '#ffffff', // true white for clean brightness
            paper: 'rgba(255, 255, 255, 0.95)', // slightly translucent paper
          },
          text: {
            primary: '#2f2f2f', // dark gray (not black) for comfort
            secondary: '#6b7280', // soft contrast for muted text
          },
          calendar: {
            weekdayBg: 'rgba(255, 255, 255, 0.95)',
            weekdayText: '#1f2937', // slate-800
            dayBg: 'rgba(250, 250, 250, 0.7)',
            dayText: '#374151',
            todayBg: '#2563EB', // bright blue accent
            todayText: '#ffffff',
            transactionBg: 'rgba(37, 99, 235, 0.05)', // light blue hint for events
            transactionText: '#1f2937',
          },
        }
      : {
          primary: { main: '#ffffff' },
          secondary: { main: '#94a3b8' },
          background: {
            default: '#0f172a',
            paper: 'rgba(30, 41, 59, 0.8)',
          },
          text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
          },
          calendar: {
            weekdayBg: 'rgba(30, 41, 59, 0.9)',
            weekdayText: '#f8fafc',
            dayBg: 'rgba(15, 23, 42, 0.6)',
            dayText: '#cbd5e1',
            todayBg: '#ffffff',
            todayText: '#0f172a',
            transactionBg: 'rgba(255, 255, 255, 0.05)',
            transactionText: '#f8fafc',
          },
        }),
    gradients: {
      primary:
        mode === 'light'
          ? 'linear-gradient(135deg, #e5e7eb, #f3f4f6)' // subtle gray-white blend
          : 'linear-gradient(135deg,#334155,#0f172a)',
      danger: 'linear-gradient(135deg,#ef4444,#dc2626)',
      accent:
        mode === 'light'
          ? 'linear-gradient(135deg,#818cf8,#a78bfa)' // lighter accent
          : 'linear-gradient(135deg,#818cf8,#6366f1)',
    },
    charts: {
      category:
        mode === 'dark'
          ? [
              '#60A5FA',
              '#F87171',
              '#34D399',
              '#FBBF24',
              '#C084FC',
              '#F472B6',
              '#2DD4BF',
              '#FB923C',
              '#A78BFA',
              '#4ADE80',
              '#FB7185',
              '#93C5FD',
            ]
          : [
              '#3B82F6', // blue 500
              '#EF4444', // red 500
              '#10B981', // emerald 500
              '#F59E0B', // amber 500
              '#8B5CF6', // violet 500
              '#EC4899', // pink 500
              '#14B8A6', // teal 500
              '#F97316', // orange 500
              '#A855F7', // purple 500
              '#22C55E', // green 500
              '#E11D48', // rose 600
              '#2563EB', // blue 600
            ],
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
