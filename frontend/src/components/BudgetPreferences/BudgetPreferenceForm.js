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
  LinearProgress
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
  assignedCategories = []
}) => {
  const [localName, setLocalName] = useState(name);
  const [localPercentage, setLocalPercentage] = useState(percentage);
  const [localCategories, setLocalCategories] = useState(categories);

  // Sync local state with props
  useEffect(() => {
    setLocalName(name);
    setLocalPercentage(percentage);
    setLocalCategories(categories);
  }, [name, percentage, categories]);

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

  // Validation
  const isValid = useMemo(() => {
    const nameValid = localName && localName.trim().length > 0;
    const percentageValid = localPercentage && 
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
    setLocalCategories([]);
    if (onReset) {
      onReset();
    }
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setLocalCategories(typeof value === 'string' ? value.split(',') : value);
  };

  const percentageError = localPercentage && 
    (parseFloat(localPercentage) <= 0 || parseFloat(localPercentage) > remainingPercentage);

  return (
    <Paper elevation={2} sx={(t) => ({ ...surfaceBoxSx(t), p: 3 })}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {editingId ? 'Edit Budget Preference' : 'Add Budget Preference'}
      </Typography>
      
      {remainingPercentage < 100 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Available percentage: {remainingPercentage.toFixed(2)}%
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
          error={localName !== '' && localName.trim().length === 0}
          helperText={localName !== '' && localName.trim().length === 0 ? "Name is required" : ""}
        />

        <TextField
          fullWidth
          label="Percentage (%)"
          type="number"
          value={localPercentage}
          onChange={(e) => setLocalPercentage(e.target.value)}
          size="small"
          inputProps={{ 
            min: "0.01", 
            max: remainingPercentage.toString(), 
            step: "0.01" 
          }}
          error={percentageError}
          helperText={
            percentageError 
              ? `Percentage must be between 0.01 and ${remainingPercentage.toFixed(2)}%`
              : `Available: ${remainingPercentage.toFixed(2)}%`
          }
        />

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
          {localCategories.length === 0 && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
              At least one category is required
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