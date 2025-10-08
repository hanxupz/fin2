import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Chip,
  MenuItem,
  Box,
  Alert,
  LinearProgress,
  Slider,
  InputAdornment
} from '@mui/material';
import { surfaceBoxSx } from '../../theme/primitives';
import { CATEGORIES } from '../../constants';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const BudgetPreferenceForm = ({
  name,
  setName,
  percentage,
  setPercentage,
  categories,
  setCategories,
  onSubmit,
  onReset,
  editingId,
  budgetSummary,
  assignedCategories = [],
  transactions = [],
  controlDate = null
}) => {
  const [localName, setLocalName] = useState(name);
  const [localPercentage, setLocalPercentage] = useState(percentage);
  const [localCategories, setLocalCategories] = useState(categories);
  
  // State for amount (derived from percentage)
  const [localAmount, setLocalAmount] = useState('');

  // Calculate total available budget
  const totalBudget = useMemo(() => {
    if (!controlDate || !transactions.length) {
      return 0;
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
    return Object.values(categoryNetTotals)
      .filter(netTotal => netTotal > 0)
      .reduce((sum, netTotal) => sum + netTotal, 0);
  }, [controlDate, transactions]);

  // Sync local state with props
  useEffect(() => {
    setLocalName(name);
    setLocalPercentage(percentage);
    setLocalCategories(categories);
    
    // Calculate amount based on percentage when props change
    if (percentage && totalBudget > 0) {
      const calculatedAmount = (totalBudget * (parseFloat(percentage) / 100));
      setLocalAmount(calculatedAmount.toFixed(2));
    }
  }, [name, percentage, categories, totalBudget]);

  // Handle slider change (works with percentage values)
  const handleSliderChange = (event, newValue) => {
    const percentageValue = newValue.toString();
    setLocalPercentage(percentageValue);
    if (totalBudget > 0) {
      const calculatedAmount = (totalBudget * (newValue / 100));
      setLocalAmount(calculatedAmount.toFixed(2));
    } else {
      setLocalAmount('');
    }
  };

  // Handle direct percentage input
  const handlePercentageInputChange = (value) => {
    setLocalPercentage(value);
    if (value && totalBudget > 0) {
      const calculatedAmount = (totalBudget * (parseFloat(value) / 100));
      setLocalAmount(calculatedAmount.toFixed(2));
    } else {
      setLocalAmount('');
    }
  };

  // Handle direct amount input
  const handleAmountInputChange = (value) => {
    setLocalAmount(value);
    if (value && totalBudget > 0) {
      const calculatedPercentage = (parseFloat(value) / totalBudget) * 100;
      setLocalPercentage(calculatedPercentage.toFixed(2));
    } else {
      setLocalPercentage('');
    }
  };

  // Calculate available categories (not assigned to other budget preferences)
  const availableCategories = useMemo(() => {
    const currentlyAssigned = editingId 
      ? assignedCategories.filter(cat => !categories.includes(cat))
      : assignedCategories;
    
    return CATEGORIES.filter(category => !currentlyAssigned.includes(category));
  }, [assignedCategories, categories, editingId]);

  // Calculate remaining percentage
  const remainingPercentage = useMemo(() => {
    const currentTotal = budgetSummary?.total_percentage || 0;
    const currentPreferencePercentage = editingId && percentage ? parseFloat(percentage) : 0;
    const availablePercentage = 100 - currentTotal + currentPreferencePercentage;
    return Math.max(0, availablePercentage);
  }, [budgetSummary?.total_percentage, percentage, editingId]);

  // Calculate remaining amount
  const remainingAmount = useMemo(() => {
    return totalBudget * (remainingPercentage / 100);
  }, [totalBudget, remainingPercentage]);

  // Validation
  const isValid = useMemo(() => {
    const nameValid = localName && localName.trim().length > 0;
    const percentageValid = localPercentage !== '' && 
      parseFloat(localPercentage) > 0 && 
      parseFloat(localPercentage) <= remainingPercentage;
    const categoriesValid = localCategories && localCategories.length > 0;
    
    return nameValid && percentageValid && categoriesValid;
  }, [localName, localPercentage, localCategories, remainingPercentage]);

  const handleSubmit = () => {
    if (isValid) {
      onSubmit({
        name: localName.trim(),
        percentage: parseFloat(localPercentage),
        categories: localCategories
      });
    }
  };

  const handleReset = () => {
    setLocalName('');
    setLocalPercentage('');
    setLocalAmount('');
    setLocalCategories([]);
    if (onReset) {
      onReset();
    }
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setLocalCategories(typeof value === 'string' ? value.split(',') : value);
  };

  const percentageError = localPercentage !== '' && 
    (parseFloat(localPercentage) <= 0 || parseFloat(localPercentage) > remainingPercentage);
  
  const amountError = localAmount !== '' && 
    (parseFloat(localAmount) <= 0 || parseFloat(localAmount) > remainingAmount);

  return (
    <Paper elevation={2} sx={(t) => ({ ...surfaceBoxSx(t), p: 3 })}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {editingId ? 'Edit Budget Preference' : 'Add Budget Preference'}
      </Typography>
      
      {remainingPercentage < 100 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Available allocation: {remainingPercentage.toFixed(2)}%
          {totalBudget > 0 && (
            <> (€{remainingAmount.toFixed(2)} of €{totalBudget.toFixed(2)} total budget)</>
          )}
        </Alert>
      )}
      
      {budgetSummary?.overlapping_categories?.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Categories assigned to multiple preferences: {budgetSummary.overlapping_categories.join(', ')}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Budget Preference Name"
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          size="small"
          placeholder="e.g., Essential Expenses, Entertainment"
          error={Boolean(localName !== '' && localName.trim().length === 0)}
          helperText={localName !== '' && localName.trim().length === 0 ? "Name is required" : ""}
        />

        {/* Budget Allocation Slider */}
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Budget Allocation
          </Typography>
          
          {totalBudget > 0 ? (
            <>
              {/* Slider */}
              <Box sx={{ px: 1, mb: 3 }}>
                <Slider
                  value={parseFloat(localPercentage) || 0}
                  onChange={handleSliderChange}
                  min={0}
                  max={remainingPercentage}
                  step={0.1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value.toFixed(1)}%`}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: remainingPercentage / 2, label: `${(remainingPercentage / 2).toFixed(1)}%` },
                    { value: remainingPercentage, label: `${remainingPercentage.toFixed(1)}%` }
                  ]}
                  sx={{
                    '& .MuiSlider-valueLabel': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              </Box>

              {/* Current Values Display */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 2, 
                mb: 2,
                p: 2,
                backgroundColor: 'action.hover',
                borderRadius: 1
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary.main" fontWeight={600}>
                    {localPercentage ? parseFloat(localPercentage).toFixed(1) : '0.0'}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Percentage
                  </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                  =
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    €{localAmount ? parseFloat(localAmount).toFixed(2) : '0.00'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                </Box>
              </Box>

              {/* Direct Input Fields */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Percentage (%)"
                  type="number"
                  value={localPercentage}
                  onChange={(e) => handlePercentageInputChange(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  inputProps={{ 
                    min: "0", 
                    max: remainingPercentage.toString(), 
                    step: "0.1" 
                  }}
                  error={Boolean(percentageError)}
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={localAmount}
                  onChange={(e) => handleAmountInputChange(e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                  }}
                  inputProps={{ 
                    min: "0", 
                    max: remainingAmount.toString(), 
                    step: "0.01" 
                  }}
                  error={Boolean(amountError)}
                />
              </Box>

              {/* Helper Text */}
              {(percentageError || amountError) ? (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {percentageError 
                    ? `Percentage must be between 0 and ${remainingPercentage.toFixed(2)}%`
                    : `Amount must be between €0 and €${remainingAmount.toFixed(2)}`
                  }
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Available: {remainingPercentage.toFixed(2)}% (€{remainingAmount.toFixed(2)} of €{totalBudget.toFixed(2)} total budget)
                </Typography>
              )}
            </>
          ) : (
            <Alert severity="info">
              <Typography variant="body2">
                No budget data available for current control date. Add positive transactions to 'Corrente' account to enable budget allocation.
              </Typography>
            </Alert>
          )}
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel>Categories</InputLabel>
          <Select
            multiple
            value={localCategories}
            onChange={handleCategoryChange}
            input={<OutlinedInput label="Categories" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {availableCategories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
          
          {/* Select All / Clear All Actions */}
          {availableCategories.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                size="small"
                variant="text"
                onClick={() => setLocalCategories([...availableCategories])}
                disabled={localCategories.length === availableCategories.length}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Select All ({availableCategories.length})
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => setLocalCategories([])}
                disabled={localCategories.length === 0}
                sx={{ textTransform: 'none', fontSize: '0.75rem' }}
              >
                Clear All
              </Button>
            </Box>
          )}
          
          {localCategories.length === 0 && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              At least one category is required
            </Typography>
          )}
          
          {/* Show helpful message when all categories are selected */}
          {localCategories.length === availableCategories.length && availableCategories.length > 0 && (
            <Typography variant="caption" color="success.main" sx={{ mt: 0.5, ml: 1.5 }}>
              ✅ All available categories selected ({availableCategories.length} categories)
            </Typography>
          )}
        </FormControl>

        {/* Budget Summary Progress */}
        {budgetSummary && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Budget Allocation Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {budgetSummary.total_percentage?.toFixed(2) || 0}% / 100%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(budgetSummary.total_percentage || 0, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: (theme) => theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: (theme) =>
                    (budgetSummary.total_percentage || 0) >= 100
                      ? theme.palette.success.main
                      : theme.palette.primary.main,
                },
              }}
            />
            {budgetSummary.is_complete && (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                ✅ Budget allocation complete!
              </Typography>
            )}
            {!budgetSummary.is_complete && budgetSummary.missing_percentage > 0 && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
                Missing {budgetSummary.missing_percentage?.toFixed(2)}% to complete budget
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isValid}
            sx={{ flex: 1 }}
          >
            {editingId ? "Update" : "Add"} Budget Preference
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            color="secondary"
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default BudgetPreferenceForm;