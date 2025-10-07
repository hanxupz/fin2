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
  // Premium glass morphism effect with subtle glow
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.03)'
    : 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  borderRadius: '16px',
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(255, 255, 255, 0.18)'}`,
  boxShadow: theme.palette.mode === 'dark'
    ? `
      0 8px 32px rgba(0, 0, 0, 0.3),
      0 1px 0 rgba(255, 255, 255, 0.05) inset,
      0 0 0 1px rgba(255, 255, 255, 0.05) inset,
      0 0 20px rgba(255, 255, 255, 0.02)
    `
    : `
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 1px 0 rgba(255, 255, 255, 0.2) inset,
      0 0 0 1px rgba(255, 255, 255, 0.1) inset,
      0 0 20px rgba(255, 255, 255, 0.1)
    `,
  // Subtle gradient borders
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, ${
      theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(255, 255, 255, 0.4)'
    }, transparent)`,
    borderRadius: '16px 16px 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '1px',
    height: '100%',
    background: `linear-gradient(180deg, ${
      theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.15)' 
        : 'rgba(255, 255, 255, 0.4)'
    }, transparent, ${
      theme.palette.mode === 'dark' 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(255, 255, 255, 0.15)'
    })`,
    borderRadius: '16px 0 0 16px',
  },
  // Subtle hover glow effect
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? `
        0 8px 32px rgba(0, 0, 0, 0.3),
        0 1px 0 rgba(255, 255, 255, 0.08) inset,
        0 0 0 1px rgba(255, 255, 255, 0.08) inset,
        0 0 30px rgba(255, 255, 255, 0.04)
      `
      : `
        0 8px 32px rgba(0, 0, 0, 0.12),
        0 1px 0 rgba(255, 255, 255, 0.25) inset,
        0 0 0 1px rgba(255, 255, 255, 0.15) inset,
        0 0 30px rgba(255, 255, 255, 0.15)
      `,
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
