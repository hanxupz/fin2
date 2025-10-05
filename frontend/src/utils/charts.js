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
