import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useBudgetPreferences } from '../../hooks/useBudgetPreferences';
import BudgetPreferencesList from './BudgetPreferencesList';

const BudgetPreferences = ({ onOpenCreateDialog, onEdit, onDelete }) => {
  const { token } = useAuth();
  const {
    budgetPreferences,
    budgetSummary,
    loading,
    error,
    deleteBudgetPreference,
    refetch
  } = useBudgetPreferences(token);

  // UI state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar({ open: false, message: '', severity: 'info' });
  }, []);

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
      await deleteBudgetPreference(deleteDialog.id);
      showSnackbar('Budget preference deleted successfully!', 'success');
      setDeleteDialog({ open: false, id: null, name: '' });
    } catch (err) {
      showSnackbar(err.message || 'Failed to delete budget preference', 'error');
    }
  }, [deleteDialog.id, deleteBudgetPreference, showSnackbar]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, id: null, name: '' });
  }, []);

  return (
    <Box>
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BudgetPreferences;