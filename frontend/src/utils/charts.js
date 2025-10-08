// Number formatting utility for charts
export const formatChartNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00';
  }
  
  // Round to avoid floating point precision issues
  const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  // Use Portuguese locale formatting
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(rounded);
};

// Currency formatting utility for charts
export const formatChartCurrency = (value) => {
  return formatChartNumber(value, 2) + '€';
};

// Helper to format data for ControlDateAccountBarChart
export const getControlDateAccountBarData = (transactions) => {
  const grouped = {};
  
  transactions.forEach((t) => {
    if (!t.control_date || !t.account) return;
    
    const key = t.control_date;
    if (!grouped[key]) {
      grouped[key] = { control_date: key };
    }
    
    if (!grouped[key][t.account]) {
      grouped[key][t.account] = 0;
    }
    
    grouped[key][t.account] += t.amount;
  });
  
  return Object.values(grouped);
};
