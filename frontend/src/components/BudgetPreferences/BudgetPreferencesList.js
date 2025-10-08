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
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RemoveIcon from '@mui/icons-material/Remove';
import { surfaceBoxSx } from '../../theme/primitives';
import { CATEGORY_EMOJIS } from '../../constants';

const BudgetPreferencesList = ({
  budgetSummary,
  onEdit,
  onDelete,
  loading = false,
  transactions = [],
  controlDate = null
}) => {
  const { 
    budget_preferences = [], 
    total_percentage = 0, 
    is_complete = false, 
    missing_percentage = 100,
    overlapping_categories = []
  } = budgetSummary || {};

  // Calculate budget tracking information
  const budgetTracking = React.useMemo(() => {
    if (!controlDate || !transactions.length || !budget_preferences.length) {
      return { totalBudget: 0, preferencesWithBudget: budget_preferences };
    }

    // Filter transactions for current control date
    const currentControlDateTransactions = transactions.filter(t => 
      t.control_date && 
      new Date(t.control_date).toDateString() === new Date(controlDate).toDateString()
    );

    // Calculate total budget (sum of positive amounts from 'Corrente' account)
    const totalBudget = currentControlDateTransactions
      .filter(t => t.account === 'Corrente' && t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate spending and budget for each preference
    const preferencesWithBudget = budget_preferences.map(preference => {
      const budgetAmount = totalBudget * (preference.percentage / 100);
      
      // Calculate actual spending (sum of negative amounts in preference categories)
      const actualSpending = Math.abs(
        currentControlDateTransactions
          .filter(t => 
            preference.categories.includes(t.category) && 
            t.amount < 0
          )
          .reduce((sum, t) => sum + t.amount, 0)
      );

      const variance = budgetAmount - actualSpending;
      const variancePercentage = budgetAmount > 0 ? (variance / budgetAmount) * 100 : 0;
      const isOverBudget = actualSpending > budgetAmount;

      return {
        ...preference,
        budgetAmount,
        actualSpending,
        variance,
        variancePercentage,
        isOverBudget
      };
    });

    return { totalBudget, preferencesWithBudget };
  }, [controlDate, transactions, budget_preferences]);

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

        {/* Budget Overview */}
        {controlDate && budgetTracking.totalBudget > 0 && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Budget Overview for {new Date(controlDate).toLocaleDateString()}
              </Typography>
              <Tooltip title="Budget is calculated from positive transactions in 'Corrente' account. Spending is calculated from negative transactions in assigned categories.">
                <WarningIcon fontSize="small" color="action" />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                Total Available Budget (Corrente +):
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                €{budgetTracking.totalBudget.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="body2">
                Total Allocated Budget ({total_percentage.toFixed(1)}%):
              </Typography>
              <Typography variant="body2" fontWeight={600} color="info.main">
                €{(budgetTracking.totalBudget * (total_percentage / 100)).toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <Typography variant="body2">
                Total Actual Spending:
              </Typography>
              <Typography variant="body2" fontWeight={600} color="error.main">
                €{budgetTracking.preferencesWithBudget.reduce((sum, p) => sum + p.actualSpending, 0).toFixed(2)}
              </Typography>
            </Box>
            {total_percentage < 100 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="body2">
                  Unallocated Budget ({missing_percentage.toFixed(1)}%):
                </Typography>
                <Typography variant="body2" fontWeight={600} color="warning.main">
                  €{(budgetTracking.totalBudget * (missing_percentage / 100)).toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* No Budget Data Alert */}
        {controlDate && budgetTracking.totalBudget === 0 && budget_preferences.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              No budget data available for {new Date(controlDate).toLocaleDateString()}. 
              Add positive transactions to 'Corrente' account to establish a budget.
            </Typography>
          </Alert>
        )}
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
          {budgetTracking.preferencesWithBudget.map((preference) => (
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
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                  {/* Left side: Title, Categories, and Budget Info */}
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
                      {/* Budget Status Icon */}
                      {preference.budgetAmount !== undefined && (
                        <Tooltip title={
                          preference.isOverBudget 
                            ? `Over budget by €${Math.abs(preference.variance).toFixed(2)}` 
                            : preference.variance > 0 
                              ? `Under budget by €${preference.variance.toFixed(2)}`
                              : 'On budget'
                        }>
                          {preference.isOverBudget ? (
                            <TrendingUpIcon color="error" fontSize="small" />
                          ) : preference.variance > 0 ? (
                            <TrendingDownIcon color="success" fontSize="small" />
                          ) : (
                            <RemoveIcon color="info" fontSize="small" />
                          )}
                        </Tooltip>
                      )}
                    </Box>
                    
                    {/* Categories as compact text */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: preference.budgetAmount !== undefined ? 1 : 0 }}>
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

                    {/* Budget Tracking Information */}
                    {preference.budgetAmount !== undefined && (
                      <Box sx={{ mt: 1, p: 1, backgroundColor: 'action.hover', borderRadius: 0.5 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Budget
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="success.main">
                              €{preference.budgetAmount.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Spent
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="error.main">
                              €{preference.actualSpending.toFixed(2)}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              {preference.isOverBudget ? 'Over' : 'Remaining'}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight={600} 
                              color={preference.isOverBudget ? 'error.main' : 'success.main'}
                            >
                              €{Math.abs(preference.variance).toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        {/* Budget Usage Progress Bar */}
                        <Box sx={{ mt: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Budget Usage
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {preference.budgetAmount > 0 
                                ? `${((preference.actualSpending / preference.budgetAmount) * 100).toFixed(1)}%`
                                : '0%'
                              }
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, preference.budgetAmount > 0 ? (preference.actualSpending / preference.budgetAmount) * 100 : 0)}
                            color={preference.isOverBudget ? 'error' : preference.actualSpending / preference.budgetAmount > 0.8 ? 'warning' : 'success'}
                            sx={{ height: 6, borderRadius: 1 }}
                          />
                        </Box>
                      </Box>
                    )}
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