import { useMemo, useCallback } from 'react';

/**
 * Performance optimization hook for expensive calculations
 * This hook memoizes commonly used calculations to prevent unnecessary recalculations
 */
export const usePerformanceOptimizations = ({
  transactions,
  filterCategory,
  filterAccount,
  filterDateFrom,
  filterDateTo,
  filterControlDate,
  configControlDate,
}) => {
  // Format local date helper (memoized)
  const formatLocalDate = useCallback((d) => {
    if (!d) return null;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Memoized filtered transactions for main components
  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter((t) => {
      const matchesCategory = filterCategory ? t.category === filterCategory : true;
      const matchesAccount = filterAccount ? t.account === filterAccount : true;
      const matchesDateFrom = filterDateFrom ? new Date(t.date) >= new Date(filterDateFrom) : true;
      const matchesDateTo = filterDateTo ? new Date(t.date) <= new Date(filterDateTo) : true;
      const matchesControlDate = filterControlDate
        ? (t.control_date === formatLocalDate(filterControlDate))
        : (configControlDate ? t.control_date === configControlDate : true);
      return matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo && matchesControlDate;
    });
  }, [transactions, filterCategory, filterAccount, filterDateFrom, filterDateTo, filterControlDate, configControlDate, formatLocalDate]);

  // Memoized all transactions filtered (for historical charts)
  const allTransactionsFiltered = useMemo(() => {
    return (transactions || []).filter((t) => {
      const matchesCategory = filterCategory ? t.category === filterCategory : true;
      const matchesAccount = filterAccount ? t.account === filterAccount : true;
      const matchesDateFrom = filterDateFrom ? new Date(t.date) >= new Date(filterDateFrom) : true;
      const matchesDateTo = filterDateTo ? new Date(t.date) <= new Date(filterDateTo) : true;
      return matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo;
    });
  }, [transactions, filterCategory, filterAccount, filterDateFrom, filterDateTo]);

  // Memoized transaction statistics
  const transactionStats = useMemo(() => {
    const total = filteredTransactions.length;
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const positiveTransactions = filteredTransactions.filter(t => t.amount > 0);
    const negativeTransactions = filteredTransactions.filter(t => t.amount < 0);
    
    return {
      total,
      totalAmount,
      positiveCount: positiveTransactions.length,
      negativeCount: negativeTransactions.length,
      positiveAmount: positiveTransactions.reduce((sum, t) => sum + t.amount, 0),
      negativeAmount: negativeTransactions.reduce((sum, t) => sum + t.amount, 0),
    };
  }, [filteredTransactions]);

  return {
    filteredTransactions,
    allTransactionsFiltered,
    transactionStats,
    formatLocalDate,
  };
};

export default usePerformanceOptimizations;