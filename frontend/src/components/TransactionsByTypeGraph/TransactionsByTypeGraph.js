import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TransactionsByTypeGraph = ({ transactions, categoryColors }) => {
  const theme = useTheme();
  const correnteTransactions = transactions.filter(t => t.account === 'Corrente');


  // Group by category, sum all amounts (can be negative or positive)
  const grouped = {};
  correnteTransactions.forEach(({ category, amount }) => {
    if (!grouped[category]) grouped[category] = 0;
    grouped[category] += amount;
  });

  const categories = Object.keys(grouped);
  const labelColor = theme.palette.text.primary;
  const palette = categoryColors || categories.reduce((acc, cat, idx) => ({ ...acc, [cat]: theme.palette.charts.category[idx % theme.palette.charts.category.length] }), {});

  // If no categories, show a dummy dataset to avoid chartjs errors
  const datasets = categories.length > 0 ? categories.map((cat) => ({
    label: cat,
    data: [grouped[cat]],
    backgroundColor: palette[cat],
    stack: 'total',
  })) : [{ label: 'No Data', data: [0], backgroundColor: theme.palette.divider, stack: 'total' }];

  // Calculate min/max for x axis as the sum of all negative and positive values
  let min = 0, max = 0;
  if (categories.length > 0) {
    const values = categories.map(cat => grouped[cat]);
    const sumNeg = values.filter(v => v < 0).reduce((a, b) => a + b, 0);
    const sumPos = values.filter(v => v > 0).reduce((a, b) => a + b, 0);
    min = Math.min(0, sumNeg);
    max = Math.max(0, sumPos);
    if (min === max) {
      // If all values are the same, expand the range a bit
      min = min > 0 ? 0 : min * 1.2;
      max = max < 0 ? 0 : max * 1.2;
    }
  }

  const data = {
    labels: ['Corrente'],
    datasets,
  };

  const options = {
    indexAxis: 'y', // horizontal bar
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Total por Categoria (Corrente)', color: labelColor },
      tooltip: {
        callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.x}` },
        titleColor: labelColor,
        bodyColor: labelColor,
        backgroundColor: theme.palette.background.paper,
      }
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        min,
        max,
        title: { display: true, text: 'Valor', color: labelColor },
        ticks: { color: labelColor },
        grid: { color: theme.palette.divider },
      },
      y: {
        stacked: true,
        ticks: { color: labelColor },
        grid: { color: theme.palette.divider },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', height: 220, p: 2 }}>
      <Bar data={data} options={options} />
    </Paper>
  );
};

export default TransactionsByTypeGraph;
