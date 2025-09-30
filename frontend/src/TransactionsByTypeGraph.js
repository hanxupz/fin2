import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Paper from '@mui/material/Paper';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TransactionsByTypeGraph = ({ transactions }) => {
  // Filter for 'Corrente' account only
  const correnteTransactions = transactions.filter(t => t.account === 'Corrente');


  // Group by category, sum all amounts (can be negative or positive)
  const grouped = {};
  correnteTransactions.forEach(({ category, amount }) => {
    if (!grouped[category]) grouped[category] = 0;
    grouped[category] += amount;
  });

  const categories = Object.keys(grouped);

  // If no categories, show a dummy dataset to avoid chartjs errors
  const datasets = categories.length > 0 ? categories.map((cat, idx) => {
    const value = grouped[cat];
    const isPositive = value >= 0;
    return {
      label: cat,
      data: [value],
      backgroundColor: isPositive
        ? `hsl(${(idx * 360) / categories.length}, 70%, 60%)`
        : `hsl(${(idx * 360) / categories.length}, 80%, 40%)`,
      stack: 'total',
      borderWidth: 1,
    };
  }) : [{ label: 'No Data', data: [0], backgroundColor: '#eee', stack: 'total' }];

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
    labels: ['Conta Corrente'],
    datasets,
  };

  const options = {
    indexAxis: 'y', // horizontal bar
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Total por Categoria (Conta Corrente)' },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.x}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        min,
        max,
        title: { display: true, text: 'Valor' },
      },
      y: { stacked: true },
    },
    maintainAspectRatio: false,
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', height: 400, p: 2 }}>
      <Bar data={data} options={options} />
    </Paper>
  );
};

export default TransactionsByTypeGraph;
