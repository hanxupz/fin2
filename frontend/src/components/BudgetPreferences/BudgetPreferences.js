import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useBudgetPreferences } from '../../hooks/useBudgetPreferences';
import BudgetPreferenceForm from './BudgetPreferenceForm';
import BudgetPreferencesList from './BudgetPreferencesList';

const BudgetPreferences = () => {
  const { token } = useAuth();
  const {
    budgetPreferences,
    budgetSummary,
    loading,
    error,
    createBudgetPreference,
    updateBudgetPreference,
    deleteBudgetPreference,
    refetch
  } = useBudgetPreferences(token);

  // Form state
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // UI state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  // Get all assigned categories for validation
  const assignedCategories = useMemo(() => {
    const allCategories = [];
    budgetPreferences.forEach(bp => {
      if (bp.categories) {
        allCategories.push(...bp.categories);
      }
    });
    return allCategories;
  }, [budgetPreferences]);

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar({ open: false, message: '', severity: 'info' });
  }, []);

  const resetForm = useCallback(() => {
    setName('');
    setPercentage('');
    setCategories([]);
    setEditingId(null);
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    try {
      if (editingId) {
        await updateBudgetPreference(editingId, formData);
        showSnackbar('Budget preference updated successfully!', 'success');
      } else {
        await createBudgetPreference(formData);
        showSnackbar('Budget preference created successfully!', 'success');
      }
      resetForm();
    } catch (err) {
      showSnackbar(err.message || 'Failed to save budget preference', 'error');
    }
  }, [editingId, createBudgetPreference, updateBudgetPreference, showSnackbar, resetForm]);

  const handleEdit = useCallback((budgetPreference) => {
    setName(budgetPreference.name);
    setPercentage(budgetPreference.percentage.toString());
    setCategories(budgetPreference.categories || []);
    setEditingId(budgetPreference.id);
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
      <Typography variant="h5" fontWeight={600} gutterBottom>
        💰 Budget Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Allocate your spending across different categories to create a comprehensive budget plan
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form Section */}
        <Grid item xs={12} lg={4}>
          <BudgetPreferenceForm
            name={name}
            setName={setName}
            percentage={percentage}
            setPercentage={setPercentage}
            categories={categories}
            setCategories={setCategories}
            onSubmit={handleSubmit}
            onReset={resetForm}
            editingId={editingId}
            budgetSummary={budgetSummary}
            assignedCategories={assignedCategories}
          />
        </Grid>

        {/* List Section */}
        <Grid item xs={12} lg={8}>
          <BudgetPreferencesList
            budgetSummary={budgetSummary}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loading={loading}
          />
        </Grid>
      </Grid>

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