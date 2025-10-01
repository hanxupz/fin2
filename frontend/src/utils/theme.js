export const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#a5d6a7' }, // pastel green
          secondary: { main: '#ce93d8' }, // pastel purple
          background: {
            default: '#fafafa',
            paper: '#ffffff',
          },
          text: {
            primary: '#333',
            secondary: '#666',
          },
          calendar: {
            weekdayBg: '#ffffff',
            weekdayText: '#6d9dc5',     // pastel blue
            dayBg: '#f5f5f5',
            dayText: '#333',
            todayBg: '#a5d6a7',         // pastel green
            todayText: '#ffffff',
            transactionBg: '#e8f5e8',   // light pastel green
            transactionText: '#2e7d32',
          },
        }
      : {
          primary: { main: '#81c784' }, // darker pastel green for dark mode
          secondary: { main: '#ba68c8' }, // darker pastel purple
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#ffffff',
            secondary: '#aaaaaa',
          },
          calendar: {
            weekdayBg: '#2c2c2c',
            weekdayText: '#81c784',     // pastel green
            dayBg: '#1e1e1e',
            dayText: '#ffffff',
            todayBg: '#81c784',         // pastel green
            todayText: '#000000',
            transactionBg: '#2e2e2e',   // darker gray
            transactionText: '#81c784', // pastel green
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
