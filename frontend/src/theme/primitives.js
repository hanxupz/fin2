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
  position: 'relative',
  overflow: 'hidden',
  // Glass morphism effect - similar to .glass-card
  backgroundColor: 'rgba(255, 255, 255, 0.07)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: `
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 8px 4px rgba(255, 255, 255, 0.4)
  `,
  // Pseudo-elements for gradient borders using MUI sx
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '1px',
    height: '100%',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8), transparent, rgba(255, 255, 255, 0.3))',
  },
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
