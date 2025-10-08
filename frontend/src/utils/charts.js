// Number formatting utility for charts
export const formatChartNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  // Round to avoid floating point precision issues
  const rounded = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  
  // Check if the number is a whole number (no decimals needed)
  const isWholeNumber = Math.abs(rounded - Math.floor(rounded)) < Math.pow(10, -(decimals + 1));
  
  // Use Portuguese locale formatting
  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: isWholeNumber ? 0 : decimals,
    maximumFractionDigits: decimals
  }).format(rounded);
};

// Currency formatting utility for charts
export const formatChartCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0€';
  }
  
  // Round to avoid floating point precision issues
  const rounded = Math.round(value * 100) / 100;
  
  // Check if the number is a whole number (no decimals needed)
  const isWholeNumber = Math.abs(rounded - Math.floor(rounded)) < 0.001;
  
  // Use Portuguese locale formatting
  const formatted = new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: isWholeNumber ? 0 : 2,
    maximumFractionDigits: 2
  }).format(rounded);
  
  return formatted + '€';
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
