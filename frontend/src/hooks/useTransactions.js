import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useTransactions = (token) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Cache transactions for 30 seconds to avoid unnecessary refetches
  const fetchTransactions = useCallback(async (forceRefresh = false) => {
    if (!token) return;
    
    // Check if we should use cached data
    const now = Date.now();
    const cacheTimeout = 30000; // 30 seconds
    if (!forceRefresh && lastFetch && (now - lastFetch) < cacheTimeout) {
      return; // Use cached data
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getAllTransactions(token);
      setTransactions(data);
      setLastFetch(now);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, lastFetch]);

  const createTransaction = useCallback(async (transaction) => {
    try {
      const newTransaction = await apiService.createTransaction(transaction, token);
      setTransactions(prev => [newTransaction, ...prev]);
      setLastFetch(Date.now()); // Update cache timestamp
      return newTransaction;
    } catch (err) {
      console.error('Failed to create transaction:', err);
      setError(err.message);
      throw err;
    }
  }, [token]);

  const updateTransaction = useCallback(async (id, transaction) => {
    try {
      const updatedTransaction = await apiService.updateTransaction(id, transaction, token);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      setLastFetch(Date.now()); // Update cache timestamp
      return updatedTransaction;
    } catch (err) {
      console.error('Failed to update transaction:', err);
      setError(err.message);
      throw err;
    }
  }, [token]);

  const deleteTransaction = useCallback(async (id) => {
    try {
      await apiService.deleteTransaction(id, token);
      setTransactions(prev => prev.filter(t => t.id !== id));
      setLastFetch(Date.now()); // Update cache timestamp
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      setError(err.message);
      throw err;
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
  };
};
