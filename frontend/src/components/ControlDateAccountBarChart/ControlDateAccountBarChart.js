import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Accepts data: [ { control_date, accountA, accountB, ... } ]
const ControlDateAccountBarChart = ({ data }) => {
  const theme = useTheme();
  if (!data || data.length === 0) {
    return <Paper style={{ padding: 24, textAlign: 'center' }}>No data available</Paper>;
  }


  // Full account list from App.js
  const allAccounts = [
    "Corrente", "Poupança Física", "Poupança Objectivo", "Shareworks", "Etoro",
    "Cartão Refeição", "Nexo", "Crédito", "Dívida", "Investimento"
  ];


  // Sort control_dates from oldest to most recent
  const controlDates = data
    .map(d => d.control_date)
    .sort((a, b) => new Date(a) - new Date(b));

  // Reorder data to match sorted controlDates
  const sortedData = controlDates.map(date => data.find(d => d.control_date === date));

  // Calculate min and max for each control_date (sum of all accounts)
  const minMaxPerDate = sortedData.map(d => {
    const values = allAccounts.map(acc => d[acc] || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    return { min: Math.min(...values), max: Math.max(...values), sum };
  });
  const globalMin = Math.min(...minMaxPerDate.map(m => m.min));
  const globalMax = Math.max(...minMaxPerDate.map(m => m.sum));

  // Color palette from theme
  const paletteBase = theme.palette.charts.category;
  // Build datasets for Chart.js, always show all accounts
  const datasets = allAccounts.map((acc, idx) => ({
    label: acc,
    data: sortedData.map(d => d[acc] || 0),
    backgroundColor: paletteBase[idx % paletteBase.length],
    stack: 'accounts',
    borderWidth: 1,
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
    hoverBorderColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
    borderRadius: 2,
  }));

  const chartData = {
    labels: controlDates,
    datasets,
  };

  const labelColor = theme.palette.text.primary;
  const gridColor = theme.palette.divider;

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.x}` },
        titleColor: labelColor,
        bodyColor: labelColor,
        backgroundColor: theme.palette.background.paper,
      },
    },
    scales: {
      x: { stacked: true, grid: { color: gridColor }, ticks: { color: labelColor }, min: globalMin, max: globalMax },
      y: { stacked: true, grid: { color: gridColor }, ticks: { color: labelColor } },
    },
    maintainAspectRatio: false,
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', height: 600, p: 2 }}>
      <Bar data={chartData} options={options} />
    </Paper>
  );
};

export default ControlDateAccountBarChart;
