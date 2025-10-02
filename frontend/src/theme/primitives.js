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
});

export const chartPanelSx = (theme, height = 300) => ({
  width: '100%',
  height,
  p: 2,
  borderRadius: 2,
  backdropFilter: 'blur(4px)',
  backgroundColor: theme.palette.background.paper,
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
