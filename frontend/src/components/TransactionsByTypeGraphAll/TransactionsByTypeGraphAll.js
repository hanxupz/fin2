import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const accountLabels = {
  'Corrente': 'Conta Corrente',
  'Poupança': 'Poupança',
  'Investimento': 'Investimento',
};

const TransactionsByTypeGraphAll = ({ transactions, categoryColors }) => {
  const theme = useTheme();
  // Group transactions by account and category, with special logic for Poupança
  const grouped = {
    'Corrente': {},
    'Poupança': {},
    'Investimento': {},
  };
  transactions.forEach(({ account, category, amount }) => {
    // Corrente and Investimento: use account field
    if (account === 'Corrente') {
      if (!grouped['Corrente'][category]) grouped['Corrente'][category] = 0;
      grouped['Corrente'][category] += amount;
    } else if (account === 'Investimento') {
      if (!grouped['Investimento'][category]) grouped['Investimento'][category] = 0;
      grouped['Investimento'][category] += amount;
    }
    // Poupança: include records where category is 'Poupança Física' or 'Poupança Objectivo'
    if (account === 'Poupança Física' || account === 'Poupança Objectivo') {
      if (!grouped['Poupança'][category]) grouped['Poupança'][category] = 0;
      grouped['Poupança'][category] += amount;
    }
  });

  // Only show Corrente, Poupança, Investimento
  const accounts = ['Corrente', 'Poupança', 'Investimento'];
  const categories = Array.from(new Set(transactions.map(t => t.category)));

  // Build datasets for each category, with values for each account
  const datasets = categories.length > 0 ? categories.map((cat) => {
    return {
      label: cat,
      data: accounts.map(acc => grouped[acc]?.[cat] || 0),
      backgroundColor: categoryColors && categoryColors[cat] ? categoryColors[cat] : '#888',
      stack: 'total',
    };
  }) : [{ label: 'No Data', data: [0, 0, 0], backgroundColor: '#eee', stack: 'total' }];

  // Calculate min/max for x axis
  let min = 0, max = 0;
  if (categories.length > 0) {
    const values = accounts.flatMap(acc => categories.map(cat => grouped[acc]?.[cat] || 0));
    const sumNeg = values.filter(v => v < 0).reduce((a, b) => a + b, 0);
    const sumPos = values.filter(v => v > 0).reduce((a, b) => a + b, 0);
    min = Math.min(0, sumNeg);
    max = Math.max(0, sumPos);
    if (min === max) {
      min = min > 0 ? 0 : min * 1.2;
      max = max < 0 ? 0 : max * 1.2;
    }
  }

  const data = {
    labels: accounts.map(acc => accountLabels[acc]),
    datasets,
  };

  const labelColor = theme.palette.text.primary;

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Total por Categoria (Todas as Contas)',
        color: labelColor,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.x}`;
          }
        },
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
        grid: { color: labelColor },
      },
      y: {
        stacked: true,
        ticks: { color: labelColor },
        grid: { color: labelColor },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ background: theme.palette.background.paper, color: labelColor, borderRadius: 8, padding: 16 }}>
      <Paper elevation={3} sx={{ width: '100%', height: 400, p: 2 }}>
        <Bar data={data} options={options} />
      </Paper>
    </div>
  );
};

export default TransactionsByTypeGraphAll;
