import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  Chip,
  IconButton,
  LinearProgress,
  Tooltip,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { surfaceBoxSx } from '../../theme/primitives';
import { CATEGORY_EMOJIS } from '../../constants';

const BudgetPreferencesList = ({
  budgetSummary,
  onEdit,
  onDelete,
  loading = false
}) => {
  const { 
    budget_preferences = [], 
    total_percentage = 0, 
    is_complete = false, 
    missing_percentage = 100,
    overlapping_categories = []
  } = budgetSummary || {};

  if (loading) {
    return (
      <Paper elevation={2} sx={(t) => ({ ...surfaceBoxSx(t), p: 3 })}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Budget Preferences
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Budget Preferences
      </Typography>

      {/* Overall Budget Status */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Overall Budget Allocation
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {total_percentage?.toFixed(2) || 0}% / 100%
            </Typography>
            {is_complete ? (
              <CheckCircleIcon color="success" fontSize="small" />
            ) : (
              <WarningIcon color="warning" fontSize="small" />
            )}
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(total_percentage || 0, 100)}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: (theme) => theme.palette.grey[200],
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: (theme) =>
                is_complete
                  ? theme.palette.success.main
                  : total_percentage > 100
                  ? theme.palette.error.main
                  : theme.palette.primary.main,
            },
          }}
        />

        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {is_complete ? (
            <Typography variant="caption" color="success.main">
              ✅ Budget allocation complete!
            </Typography>
          ) : missing_percentage > 0 ? (
            <Typography variant="caption" color="warning.main">
              Missing {missing_percentage?.toFixed(2)}% to complete budget
            </Typography>
          ) : (
            <Typography variant="caption" color="error.main">
              Budget exceeds 100% by {Math.abs(missing_percentage)?.toFixed(2)}%
            </Typography>
          )}
        </Box>
      </Box>

      {/* Validation Alerts */}
      {overlapping_categories.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Category Overlap Detected
          </Typography>
          <Typography variant="body2">
            These categories are assigned to multiple budget preferences: {overlapping_categories.join(', ')}
          </Typography>
        </Alert>
      )}

      {budget_preferences.length === 0 ? (
        <Alert severity="info">
          <Typography variant="body2">
            No budget preferences created yet. Add your first budget preference to get started with budget planning.
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={2}>
          {budget_preferences.map((preference) => (
            <Card 
              key={preference.id}
              elevation={1} 
              sx={(t) => ({
                border: `1px solid ${t.palette.divider}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: t.shadows[2]
                }
              })}
            >
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  {/* Left side: Title and Categories */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}>
                        {preference.name}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="primary.main" 
                        fontWeight={700}
                      >
                        {preference.percentage?.toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    {/* Categories as compact text */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {preference.categories?.length || 0} categories:
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.primary"
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          maxWidth: '300px'
                        }}
                      >
                        {preference.categories?.map((category, index) => (
                          `${CATEGORY_EMOJIS[category] || '📁'} ${category}`
                        )).join(' • ') || 'No categories'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right side: Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                    <Tooltip title="Edit budget preference">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(preference)}
                        color="primary"
                        sx={{ p: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete budget preference">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(preference.id)}
                        color="error"
                        sx={{ p: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default BudgetPreferencesList;