import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  IconButton,
  LinearProgress,
  Tooltip,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RemoveIcon from '@mui/icons-material/Remove';
import { surfaceBoxSx } from '../../theme/primitives';


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

    // Calculate net totals per category for 'Corrente' account
    const categoryNetTotals = {};
    currentControlDateTransactions
      .filter(t => t.account === 'Corrente')
      .forEach(t => {
        if (!categoryNetTotals[t.category]) {
          categoryNetTotals[t.category] = 0;
        }
        categoryNetTotals[t.category] += t.amount;
      });

    // Calculate total budget (sum of positive net amounts from categories in 'Corrente' account)
    const totalBudget = Object.values(categoryNetTotals)
      .filter(netTotal => netTotal > 0)
      .reduce((sum, netTotal) => sum + netTotal, 0);

    // Calculate spending and budget for each preference
    const preferencesWithBudget = budget_preferences.map(preference => {
      const budgetAmount = totalBudget * (preference.percentage / 100);
      
      // Calculate actual spending (sum of negative amounts in preference categories from 'Corrente' account only)
      const actualSpending = Math.abs(
        currentControlDateTransactions
          .filter(t => 
            t.account === 'Corrente' && 
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

  // Skeleton loading state that maintains layout
  if (loading) {
    return (
      <Paper 
        elevation={2} 
        sx={(t) => ({ 
          ...surfaceBoxSx(t), 
          p: 3,
          minHeight: '400px', // Fixed minimum height
        })}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Budget Preferences
        </Typography>
        <Box sx={{ height: '48px', mb: 2 }}>
          <LinearProgress />
        </Box>
        {/* Skeleton cards to maintain layout */}
        <Stack spacing={1}>
          {[1, 2, 3].map((n) => (
            <Card 
              key={`skeleton-${n}`}
              elevation={1}
              sx={{ 
                height: '100px',
                backgroundColor: (t) => t.palette.action.hover,
              }}
            />
          ))}
        </Stack>
      </Paper>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '400px', // Fixed minimum height
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Overall Budget Status */}
      <Box sx={{ 
        mb: 2,
        minHeight: '48px', // Fixed height for status section
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 0.5,
          height: '32px' // Fixed height for status bar
        }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Budget Allocation
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            minWidth: '80px', // Fixed width for percentage area
            justifyContent: 'flex-end'
          }}>
            <Typography variant="body2" fontWeight={600}>
              {total_percentage?.toFixed(1) || 0}%
            </Typography>
            <Box sx={{ width: '20px', display: 'flex', alignItems: 'center' }}>
              {is_complete ? (
                <CheckCircleIcon color="success" fontSize="small" />
              ) : (
                <WarningIcon color="warning" fontSize="small" />
              )}
            </Box>
          </Box>
        </Box>

        {/* No Budget Data Alert */}
        {controlDate && budgetTracking.totalBudget === 0 && budget_preferences.length > 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              No budget data available for {new Date(controlDate).toLocaleDateString()}. 
              Add transactions to 'Corrente' account where categories have positive net totals to establish a budget.
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
        <Stack spacing={1}>
          {budgetTracking.preferencesWithBudget.map((preference) => (
            <Card 
              key={preference.id}
              elevation={1} 
              sx={(t) => ({
                border: `1px solid ${t.palette.divider}`,
                minHeight: '100px', // Fixed minimum height
                transition: 'none', // Disable animations that might cause layout shifts
              })}
            >
              <CardContent sx={{ 
                py: 1, 
                px: 2, 
                '&:last-child': { pb: 1 },
                height: '100%', // Ensure consistent height
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  justifyContent: 'space-between',
                  height: '100%'
                }}>
                  {/* Left side: Title, Categories, and Budget Info */}
                  <Box sx={{ 
                    flex: 1, 
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Title row with name, percentage, and status */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 0.25,
                      height: '32px' // Fixed height for title row
                    }}>
                      <Typography 
                        variant="body1" 
                        fontWeight={600} 
                        sx={{ 
                          color: 'text.primary',
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {preference.name}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        minWidth: '120px', // Fixed width for status area
                        justifyContent: 'flex-end'
                      }}>
                        <Typography 
                          variant="body2" 
                          color="primary.main" 
                          fontWeight={600}
                          sx={{ minWidth: '50px', textAlign: 'right' }}
                        >
                          {preference.percentage?.toFixed(1)}%
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color={preference.isOverBudget ? 'error.main' : 'success.main'}
                          fontWeight={600}
                          sx={{ 
                            minWidth: '60px', 
                            textAlign: 'right',
                            visibility: preference.budgetAmount !== undefined ? 'visible' : 'hidden'
                          }}
                        >
                          €{preference.budgetAmount?.toFixed(0) || '0'}
                        </Typography>
                      </Box>
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
                    
                    {/* Categories and budget info in one compact line */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {preference.categories?.length || 0} categories
                      </Typography>
                      {preference.budgetAmount !== undefined && (
                        <>
                          <Typography variant="caption" color="text.secondary">•</Typography>
                          <Typography variant="caption" color="error.main" fontWeight={500}>
                            €{preference.actualSpending.toFixed(0)} spent
                          </Typography>
                          <Typography variant="caption" color="text.secondary">•</Typography>
                          <Typography 
                            variant="caption" 
                            color={preference.isOverBudget ? 'error.main' : 'success.main'}
                            fontWeight={500}
                          >
                            €{Math.abs(preference.variance).toFixed(0)} {preference.isOverBudget ? 'over' : 'left'}
                          </Typography>
                        </>
                      )}
                    </Box>

                    {/* Compact Budget Progress Bar */}
                    {preference.budgetAmount !== undefined && (
                      <Box sx={{ mt: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, preference.budgetAmount > 0 ? (preference.actualSpending / preference.budgetAmount) * 100 : 0)}
                          color={preference.isOverBudget ? 'error' : preference.actualSpending / preference.budgetAmount > 0.8 ? 'warning' : 'success'}
                          sx={{ height: 4, borderRadius: 1 }}
                        />
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