export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#1a1a1a' }, // clean black/dark gray
          secondary: { main: '#64748b' }, // sophisticated blue-gray
          background: {
            default: '#fafbfc',
            paper: 'rgba(255, 255, 255, 0.8)',
          },
          text: {
            primary: '#1a1a1a',
            secondary: '#64748b',
          },
          calendar: {
            weekdayBg: 'rgba(255, 255, 255, 0.9)',
            weekdayText: '#1a1a1a',
            dayBg: 'rgba(255, 255, 255, 0.6)',
            dayText: '#374151',
            todayBg: '#1a1a1a',
            todayText: '#ffffff',
            transactionBg: 'rgba(26, 26, 26, 0.05)',
            transactionText: '#1a1a1a',
          },
        }
      : {
          primary: { main: '#ffffff' }, // clean white for dark mode
          secondary: { main: '#94a3b8' }, // light blue-gray
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
          ? 'linear-gradient(135deg,#1a1a1a,#374151)'
          : 'linear-gradient(135deg,#334155,#0f172a)',
      danger: 'linear-gradient(135deg,#ef4444,#dc2626)',
      accent:
        mode === 'light'
          ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
          : 'linear-gradient(135deg,#818cf8,#6366f1)',
    },
    charts: {
      // High-contrast categorical palette (12 colors) chosen for accessibility & distinction
      category:
        mode === 'dark'
          ? [
              '#60A5FA', // blue 400
              '#F87171', // red 400
              '#34D399', // emerald 400
              '#FBBF24', // amber 400
              '#C084FC', // violet 300
              '#F472B6', // pink 400
              '#2DD4BF', // teal 400
              '#FB923C', // orange 400
              '#A78BFA', // violet 400
              '#4ADE80', // green 400
              '#FB7185', // rose 400
              '#93C5FD', // blue 300
            ]
          : [
              '#2563EB', // blue 600
              '#DC2626', // red 600
              '#059669', // emerald 600
              '#D97706', // amber 600
              '#7C3AED', // violet 600
              '#DB2777', // pink 600
              '#0D9488', // teal 600
              '#EA580C', // orange 600
              '#9333EA', // purple 600
              '#16A34A', // green 600
              '#E11D48', // rose 600
              '#1E40AF', // blue 800
            ],
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
