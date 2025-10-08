import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useBudgetPreferences = (token) => {
  const [budgetPreferences, setBudgetPreferences] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState({
    budget_preferences: [],
    total_percentage: 0,
    is_complete: false,
    missing_percentage: 100,
    overlapping_categories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBudgetPreferences = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const summary = await apiService.getBudgetPreferences(token);
      setBudgetSummary(summary);
      setBudgetPreferences(summary.budget_preferences || []);
    } catch (err) {
      console.error('Failed to fetch budget preferences:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createBudgetPreference = useCallback(async (budgetPreferenceData) => {
    if (!token) return;
    
    try {
      const newBudgetPreference = await apiService.createBudgetPreference(budgetPreferenceData, token);
      
      // Refresh the full summary after creation to get updated totals
      await fetchBudgetPreferences();
      
      return newBudgetPreference;
    } catch (err) {
      console.error('Failed to create budget preference:', err);
      setError(err.message);
      throw err;
    }
  }, [token, fetchBudgetPreferences]);

  const updateBudgetPreference = useCallback(async (id, budgetPreferenceData) => {
    if (!token) return;
    
    try {
      const updatedBudgetPreference = await apiService.updateBudgetPreference(id, budgetPreferenceData, token);
      
      // Refresh the full summary after update to get updated totals
      await fetchBudgetPreferences();
      
      return updatedBudgetPreference;
    } catch (err) {
      console.error('Failed to update budget preference:', err);
      setError(err.message);
      throw err;
    }
  }, [token, fetchBudgetPreferences]);

  const deleteBudgetPreference = useCallback(async (id) => {
    if (!token) return;
    
    try {
      await apiService.deleteBudgetPreference(id, token);
      
      // Refresh the summary after deletion
      await fetchBudgetPreferences();
      
      return { success: true };
    } catch (err) {
      console.error('Failed to delete budget preference:', err);
      setError(err.message);
      throw err;
    }
  }, [token, fetchBudgetPreferences]);

  const validateBudgetPreferences = useCallback(async () => {
    if (!token) return;
    
    try {
      const validation = await apiService.validateBudgetPreferences(token);
      setBudgetSummary(validation);
      return validation;
    } catch (err) {
      console.error('Failed to validate budget preferences:', err);
      setError(err.message);
      throw err;
    }
  }, [token]);

  // Fetch budget preferences on mount and when token changes
  useEffect(() => {
    fetchBudgetPreferences();
  }, [fetchBudgetPreferences]);

  return {
    budgetPreferences,
    budgetSummary,
    loading,
    error,
    createBudgetPreference,
    updateBudgetPreference,
    deleteBudgetPreference,
    validateBudgetPreferences,
    refetch: fetchBudgetPreferences
  };
};