// Central shared styling primitives for consistent surfaces & spacing
export const surfaceBoxSx = (theme) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: 2,
  p: 2,
  boxShadow: theme.shadows[1],
});

export const sectionContainerSx = (theme) => ({
  mb: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  // Glass morphism effect
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)', // Safari support
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.3)'}`,
  borderRadius: 2,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    : '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
});

export const amountColor = (theme, value) => (value >= 0 ? theme.palette.success.main : theme.palette.error.main);

export const fabSx = (theme) => ({
  boxShadow: theme.shadows[6],
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.mode === 'light' ? theme.palette.common.white : theme.palette.text.primary,
  '&:hover': {
    boxShadow: theme.shadows[10],
    opacity: 0.9,
  },
});
