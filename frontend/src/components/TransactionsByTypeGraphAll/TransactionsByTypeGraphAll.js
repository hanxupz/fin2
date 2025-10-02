import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const accountLabels = { 'Corrente': 'Corrente', 'Poupança': 'Poupança', 'Investimento': 'Investimento' };

const TransactionsByTypeGraphAll = ({ transactions, categoryColors }) => {
  const theme = useTheme();
  const grouped = { 'Corrente': {}, 'Poupança': {}, 'Investimento': {} };
  transactions.forEach(({ account, category, amount }) => {
    if (account === 'Corrente') grouped['Corrente'][category] = (grouped['Corrente'][category] || 0) + amount;
    else if (account === 'Investimento') grouped['Investimento'][category] = (grouped['Investimento'][category] || 0) + amount;
    if (account === 'Poupança Física' || account === 'Poupança Objectivo') grouped['Poupança'][category] = (grouped['Poupança'][category] || 0) + amount;
  });

  const accounts = ['Corrente', 'Poupança', 'Investimento'];
  const categories = Array.from(new Set(transactions.map(t => t.category)));
  const basePalette = theme.palette.charts.category;
  const paletteMap = categories.reduce((acc, cat, idx) => ({ ...acc, [cat]: (categoryColors && categoryColors[cat]) || basePalette[idx % basePalette.length] }), {});

  const datasets = categories.length ? categories.map(cat => ({
    label: cat,
    data: accounts.map(acc => grouped[acc]?.[cat] || 0),
    backgroundColor: paletteMap[cat],
    stack: 'total',
    borderWidth: 1,
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
    hoverBorderColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
    borderRadius: 4,
  })) : [{ label: 'No Data', data: [0,0,0], backgroundColor: theme.palette.divider, stack: 'total', borderWidth: 0 }];

  let min = 0, max = 0;
  if (categories.length) {
    const accountSums = accounts.map(acc => {
      const vals = categories.map(cat => grouped[acc]?.[cat] || 0);
      return { sumNeg: vals.filter(v => v < 0).reduce((a,b)=>a+b,0), sumPos: vals.filter(v => v > 0).reduce((a,b)=>a+b,0) };
    });
    min = Math.min(0, ...accountSums.map(s => s.sumNeg));
    max = Math.max(0, ...accountSums.map(s => s.sumPos));
    if (min === max) { min = min > 0 ? 0 : min * 1.2; max = max < 0 ? 0 : max * 1.2; }
  }

  const data = { labels: accounts.map(acc => accountLabels[acc]), datasets };
  const labelColor = theme.palette.text.primary;
  const gridColor = theme.palette.divider;

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Total por Categoria (Todas as Contas)', color: labelColor },
      tooltip: {
        callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.x}` },
        titleColor: labelColor,
        bodyColor: labelColor,
        backgroundColor: theme.palette.background.paper,
      }
    },
    scales: {
      x: { stacked: true, beginAtZero: true, min, max, title: { display: true, text: 'Valor', color: labelColor }, ticks: { color: labelColor }, grid: { color: gridColor } },
      y: { stacked: true, ticks: { color: labelColor }, grid: { color: gridColor } },
    },
    maintainAspectRatio: false,
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', height: 400, p: 2 }}>
      <Bar data={data} options={options} />
    </Paper>
  );
};

export default TransactionsByTypeGraphAll;
