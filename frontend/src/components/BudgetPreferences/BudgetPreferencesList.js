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
    <Paper elevation={2} sx={(t) => ({ ...surfaceBoxSx(t), p: 3 })}>
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
        <Grid container spacing={2}>
          {budget_preferences.map((preference) => (
            <Grid item xs={12} sm={6} md={4} key={preference.id}>
              <Card 
                elevation={1} 
                sx={(t) => ({
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `1px solid ${t.palette.divider}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: t.shadows[3]
                  }
                })}
              >
                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                      {preference.name}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color="primary.main" 
                      fontWeight={700}
                      sx={{ ml: 1 }}
                    >
                      {preference.percentage?.toFixed(1)}%
                    </Typography>
                  </Box>

                  {/* Categories */}
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Categories ({preference.categories?.length || 0}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {preference.categories?.map((category) => (
                      <Chip
                        key={category}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{CATEGORY_EMOJIS[category] || '📁'}</span>
                            <span>{category}</span>
                          </Box>
                        }
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.75rem',
                          height: 24
                        }}
                      />
                    )) || []}
                  </Box>

                  {/* Percentage Bar */}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Budget Share
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((preference.percentage / 100) * 100, 100)}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        mt: 0.5,
                        backgroundColor: (theme) => theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{ pt: 0, justifyContent: 'flex-end' }}>
                  <Tooltip title="Edit budget preference">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(preference)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete budget preference">
                    <IconButton
                      size="small"
                      onClick={() => onDelete(preference.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Budget Summary Stats */}
      {budget_preferences.length > 0 && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: (t) => t.palette.grey[50], borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Budget Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Total Preferences
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {budget_preferences.length}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Categories Assigned
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {budget_preferences.reduce((sum, bp) => sum + (bp.categories?.length || 0), 0)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Allocated
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {total_percentage?.toFixed(1)}%
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Typography 
                variant="body2" 
                fontWeight={600}
                color={is_complete ? "success.main" : "warning.main"}
              >
                {is_complete ? "Complete" : "Incomplete"}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default BudgetPreferencesList;