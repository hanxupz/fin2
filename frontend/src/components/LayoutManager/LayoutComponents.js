import React from 'react';
import { Box, Paper, Typography, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { sectionContainerSx } from '../../theme/primitives';

const LayoutSection = ({ 
  sectionId, 
  components, 
  children, 
  sx = {},
  ...props 
}) => {
  if (!components || components.length === 0) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3,
        ...sx 
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

const LayoutComponent = ({ 
  componentId,
  isVisible,
  title,
  description,
  children,
  onFabClick,
  fabIcon = <AddIcon />,
  showFab = false,
  requiresControlDate = false,
  controlDate,
  sx = {},
  ...props 
}) => {
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Don't render if requires control date but none provided
  if (requiresControlDate && !controlDate) {
    return null;
  }

  return (
    <Box 
      sx={{ 
        position: 'relative',
        minHeight: '200px', // Minimum height to prevent layout shift
        ...sx 
      }} 
      {...props}
    >
      <Box 
        component={Paper} 
        elevation={3} 
        sx={(t) => ({ 
          ...sectionContainerSx(t), 
          p: 3, 
          borderRadius: 4,
          height: '100%', // Ensure full height
          display: 'flex',
          flexDirection: 'column'
        })}
      >
        {(title || description) && (
          <>
            {title && (
              <Typography variant="h5" fontWeight={600}>
                {title}
              </Typography>
            )}
            {description && (
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ mt: title ? -0.5 : 0, mb: 2 }}
              >
                {description}
              </Typography>
            )}
          </>
        )}
        {children}
      </Box>
      
      {showFab && onFabClick && (
        <Fab 
          size="small" 
          color="primary" 
          onClick={onFabClick}
          sx={{ position: 'absolute', top: 24, right: 24, zIndex: 1 }}
        >
          {fabIcon}
        </Fab>
      )}
    </Box>
  );
};

export { LayoutSection, LayoutComponent };