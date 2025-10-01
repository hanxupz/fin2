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

// Generate category color map
export const getCategoryColors = (categories, mode) => {
  const colors = mode === 'dark' 
    ? ['#ffb3ba', '#ffdfba', '#ffffba', '#baffc9', '#bae1ff', '#d4baff', '#ffb3d9']
    : ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
  
  const colorMap = {};
  categories.forEach((category, index) => {
    colorMap[category] = colors[index % colors.length];
  });
  
  return colorMap;
};
