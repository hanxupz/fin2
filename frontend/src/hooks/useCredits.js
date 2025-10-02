import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useCredits = (token) => {
  const [credits, setCredits] = useState([]);
  const [paymentsByCredit, setPaymentsByCredit] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCredits = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getCredits(token);
      setCredits(data);
      // Prefetch payments for credits that have a total_amount defined (likely needed for remaining calc)
      // Fire and forget; don't block the main credit load resolution
      Promise.all(
        data
          .filter(c => c.total_amount !== null && c.total_amount !== undefined)
          .map(async c => {
            try {
              const payments = await apiService.getCreditPayments(c.id, token);
              setPaymentsByCredit(prev => ({ ...prev, [c.id]: payments }));
            } catch (e) {
              // Silent per-credit failure; global error already handled
              console.warn('Prefetch payments failed for credit', c.id, e);
            }
          })
      );
    } catch (err) {
      console.error('Failed to fetch credits:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPayments = useCallback(async (creditId) => {
    if (!token) return;
    try {
      const payments = await apiService.getCreditPayments(creditId, token);
      setPaymentsByCredit(prev => ({ ...prev, [creditId]: payments }));
    } catch (err) {
      console.error('Failed to fetch credit payments:', err);
      setError(err.message);
    }
  }, [token]);

  const createCredit = useCallback(async (credit) => {
    try {
      const created = await apiService.createCredit(credit, token);
      setCredits(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const updateCredit = useCallback(async (id, credit) => {
    try {
      const updated = await apiService.updateCredit(id, credit, token);
      setCredits(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const deleteCredit = useCallback(async (id) => {
    try {
      await apiService.deleteCredit(id, token);
      setCredits(prev => prev.filter(c => c.id !== id));
      setPaymentsByCredit(prev => { const cp = { ...prev }; delete cp[id]; return cp; });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const createPayment = useCallback(async (payment) => {
    try {
      const created = await apiService.createCreditPayment(payment, token);
      setPaymentsByCredit(prev => ({
        ...prev,
        [payment.credit_id]: [created, ...(prev[payment.credit_id] || [])]
      }));
      return created;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const updatePayment = useCallback(async (paymentId, payment) => {
    try {
      const updated = await apiService.updateCreditPayment(paymentId, payment, token);
      const creditId = updated.credit_id || payment.credit_id; // ensure we have credit id
      setPaymentsByCredit(prev => ({
        ...prev,
        [creditId]: (prev[creditId] || []).map(p => p.id === paymentId ? updated : p)
      }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  const deletePayment = useCallback(async (paymentId, creditId) => {
    try {
      await apiService.deleteCreditPayment(paymentId, token);
      setPaymentsByCredit(prev => ({
        ...prev,
        [creditId]: (prev[creditId] || []).filter(p => p.id !== paymentId)
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [token]);

  useEffect(() => { fetchCredits(); }, [fetchCredits]);

  return {
    credits,
    paymentsByCredit,
    loading,
    error,
    fetchCredits,
    fetchPayments,
    createCredit,
    updateCredit,
    deleteCredit,
    createPayment,
    updatePayment,
    deletePayment
  };
};
