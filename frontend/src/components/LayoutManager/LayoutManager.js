import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Stack,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MoveUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MoveDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';

const COMPONENT_DEFINITIONS = {
  accountSummary: {
    id: 'accountSummary',
    name: 'Account Overview',
    description: 'Financial snapshot for the current control period',
    defaultSection: 'main',
    requiresControlDate: true
  },
  calendar: {
    id: 'calendar',
    name: 'Transactions Calendar',
    description: 'Visual representation of spending patterns',
    defaultSection: 'left'
  },
  budgetPreferences: {
    id: 'budgetPreferences',
    name: 'Budget Preferences',
    description: 'Budget allocation across categories',
    defaultSection: 'left'
  },
  financialInsights: {
    id: 'financialInsights',
    name: 'Financial Insights',
    description: 'Charts and graphs showing spending trends',
    defaultSection: 'left',
    requiresControlDate: true
  },
  credits: {
    id: 'credits',
    name: 'Credits',
    description: 'Manage credits and track payments',
    defaultSection: 'right'
  },
  filters: {
    id: 'filters',
    name: 'Refine Your View',
    description: 'Filter transactions by various criteria',
    defaultSection: 'right'
  },
  transactionList: {
    id: 'transactionList',
    name: 'Transaction History',
    description: 'Complete record of all transactions',
    defaultSection: 'right'
  }
};

const SECTION_DEFINITIONS = {
  main: {
    id: 'main',
    name: 'Main Section',
    description: 'Full-width section at the top',
    color: '#2196F3'
  },
  left: {
    id: 'left',
    name: 'Left Panel',
    description: 'Larger left column (2/3 width)',
    color: '#4CAF50'
  },
  right: {
    id: 'right',
    name: 'Right Panel',
    description: 'Smaller right column (1/3 width)',
    color: '#FF9800'
  }
};

const ComponentCard = ({ component, section, index, isVisible, onToggleVisibility, onMoveUp, onMoveDown, onMoveToSection, canMoveUp, canMoveDown }) => {
  const theme = useTheme();
  const sectionColor = SECTION_DEFINITIONS[section]?.color || theme.palette.primary.main;
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMoveMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoveMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoveToSection = (targetSection) => {
    onMoveToSection(component.id, targetSection);
    handleMoveMenuClose();
  };

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 1, 
        opacity: isVisible ? 1 : 0.6,
        borderLeft: `4px solid ${sectionColor}`,
        transition: 'all 0.2s ease'
      }}
    >
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <DragIndicatorIcon color="action" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {component.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {component.description}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton 
              size="small" 
              onClick={onMoveUp}
              disabled={!canMoveUp}
              sx={{ opacity: canMoveUp ? 1 : 0.3 }}
            >
              <MoveUpIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={onMoveDown}
              disabled={!canMoveDown}
              sx={{ opacity: canMoveDown ? 1 : 0.3 }}
            >
              <MoveDownIcon />
            </IconButton>
            <IconButton size="small" onClick={handleMoveMenuOpen}>
              <SwapHorizIcon />
            </IconButton>
            <IconButton size="small" onClick={onToggleVisibility}>
              {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMoveMenuClose}
      >
        {Object.values(SECTION_DEFINITIONS)
          .filter(sec => sec.id !== section)
          .map(sec => (
            <MenuItem key={sec.id} onClick={() => handleMoveToSection(sec.id)}>
              <ListItemIcon>
                <MoveToInboxIcon />
              </ListItemIcon>
              <ListItemText primary={`Move to ${sec.name}`} />
            </MenuItem>
          ))}
      </Menu>
    </Card>
  );
};

const SectionPanel = ({ section, components, layout, onUpdateLayout }) => {
  const theme = useTheme();
  const sectionDef = SECTION_DEFINITIONS[section.id];
  
  const handleMoveComponent = (componentId, direction) => {
    const sectionComponents = layout[section.id] || [];
    const currentIndex = sectionComponents.findIndex(item => item.componentId === componentId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sectionComponents.length) return;
    
    const newSectionComponents = [...sectionComponents];
    [newSectionComponents[currentIndex], newSectionComponents[newIndex]] = 
    [newSectionComponents[newIndex], newSectionComponents[currentIndex]];
    
    onUpdateLayout({
      ...layout,
      [section.id]: newSectionComponents
    });
  };

  const handleToggleVisibility = (componentId) => {
    const sectionComponents = layout[section.id] || [];
    const updatedComponents = sectionComponents.map(item =>
      item.componentId === componentId 
        ? { ...item, isVisible: !item.isVisible }
        : item
    );
    
    onUpdateLayout({
      ...layout,
      [section.id]: updatedComponents
    });
  };

  const handleMoveToSection = (componentId, targetSectionId) => {
    // Find the component in current section
    const currentSectionComponents = layout[section.id] || [];
    const componentIndex = currentSectionComponents.findIndex(item => item.componentId === componentId);
    
    if (componentIndex === -1) return;
    
    const componentToMove = currentSectionComponents[componentIndex];
    
    // Remove from current section
    const newCurrentSection = [...currentSectionComponents];
    newCurrentSection.splice(componentIndex, 1);
    
    // Add to target section
    const targetSectionComponents = layout[targetSectionId] || [];
    const newTargetSection = [...targetSectionComponents, componentToMove];
    
    onUpdateLayout({
      ...layout,
      [section.id]: newCurrentSection,
      [targetSectionId]: newTargetSection
    });
  };

  const sectionComponents = layout[section.id] || [];

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        minHeight: 200,
        border: `2px solid ${sectionDef.color}`,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip 
          label={sectionDef.name} 
          size="small" 
          sx={{ 
            bgcolor: sectionDef.color, 
            color: 'white',
            fontWeight: 600
          }} 
        />
        <Typography variant="caption" color="text.secondary">
          {sectionDef.description}
        </Typography>
      </Box>
      
      <Box sx={{ minHeight: 100 }}>
        {sectionComponents.map((item, index) => {
          const component = COMPONENT_DEFINITIONS[item.componentId];
          if (!component) return null;
          
          return (
            <ComponentCard
              key={item.componentId}
              component={component}
              section={section.id}
              index={index}
              isVisible={item.isVisible}
              onToggleVisibility={() => handleToggleVisibility(item.componentId)}
              onMoveUp={() => handleMoveComponent(item.componentId, 'up')}
              onMoveDown={() => handleMoveComponent(item.componentId, 'down')}
              onMoveToSection={handleMoveToSection}
              canMoveUp={index > 0}
              canMoveDown={index < sectionComponents.length - 1}
            />
          );
        })}
        
        {sectionComponents.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 100,
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            No components in this section
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const LayoutManager = ({ open, onClose, layout, onUpdateLayout }) => {
  const [tempLayout, setTempLayout] = useState(layout);

  React.useEffect(() => {
    if (open) {
      setTempLayout(layout);
    }
  }, [open, layout]);

  const handleSave = () => {
    onUpdateLayout(tempLayout);
    onClose();
  };

  const handleReset = () => {
    // Reset to default layout
    const defaultLayout = {
      main: [
        { componentId: 'accountSummary', isVisible: true }
      ],
      left: [
        { componentId: 'calendar', isVisible: true },
        { componentId: 'budgetPreferences', isVisible: true },
        { componentId: 'financialInsights', isVisible: true }
      ],
      right: [
        { componentId: 'credits', isVisible: true },
        { componentId: 'filters', isVisible: true },
        { componentId: 'transactionList', isVisible: true }
      ]
    };
    setTempLayout(defaultLayout);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight={600}>
          Layout Manager
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customize your dashboard layout by moving components between sections and controlling their visibility
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3}>
          {Object.values(SECTION_DEFINITIONS).map(section => (
            <SectionPanel
              key={section.id}
              section={section}
              components={COMPONENT_DEFINITIONS}
              layout={tempLayout}
              onUpdateLayout={setTempLayout}
            />
          ))}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          Reset to Default
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Layout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LayoutManager;