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
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
