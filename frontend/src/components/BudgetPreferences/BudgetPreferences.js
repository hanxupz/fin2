import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import BudgetPreferencesList from './BudgetPreferencesList';
import { surfaceBoxSx } from "../../theme/primitives";

const BudgetPreferences = React.memo(({ 
  budgetPreferences = [],
  budgetSummary = { budget_preferences: [], total_percentage: 0, is_complete: false, missing_percentage: 100, overlapping_categories: [] },
  loading = false,
  error = null,
  onEdit,
  onDelete,
  transactions = [],
  controlDate = null
}) => {

  // UI state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const handleDeleteClick = useCallback((id) => {
    const budgetPreference = budgetPreferences.find(bp => bp.id === id);
    setDeleteDialog({
      open: true,
      id,
      name: budgetPreference?.name || 'Unknown'
    });
  }, [budgetPreferences]);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      if (onDelete) {
        await onDelete(deleteDialog.id);
      }
      setDeleteDialog({ open: false, id: null, name: '' });
    } catch (err) {
      console.error('Failed to delete budget preference:', err);
    }
  }, [deleteDialog.id, onDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null, name: '' });
  }, []);

  return (
    <Box sx={(t) => ({ ...surfaceBoxSx(t), p: 2 })}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <BudgetPreferencesList
        budgetSummary={budgetSummary}
        onEdit={onEdit}
        onDelete={handleDeleteClick}
        loading={loading}
        transactions={transactions}
        controlDate={controlDate}
      />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the budget preference "{deleteDialog.name}"?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone. The categories will become available for assignment to other budget preferences.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
});

BudgetPreferences.displayName = 'BudgetPreferences';

export default BudgetPreferences;