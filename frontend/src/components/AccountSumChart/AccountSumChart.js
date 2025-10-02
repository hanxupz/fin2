import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AccountSumChart = ({ transactions, controlDate }) => {
  const theme = useTheme();

  const grouped = {};
  let poupancaSum = 0;
  transactions.forEach(({ account, amount }) => {
    if (account === 'Poupança Física' || account === 'Poupança Objectivo') {
      poupancaSum += amount;
    } else {
      if (!grouped[account]) grouped[account] = 0;
      grouped[account] += amount;
    }
  });

  if (poupancaSum !== 0) {
    grouped['Poupança'] = poupancaSum;
    delete grouped['Poupança Física'];
    delete grouped['Poupança Objectivo'];
  }

  const accounts = Object.keys(grouped);
  const values = accounts.map(acc => grouped[acc]);
  const labelColor = theme.palette.text.primary;
  const gridColor = theme.palette.divider;
  const palette = theme.palette.charts.category;

  const data = {
    labels: accounts,
    datasets: [
      {
        label: 'Sum by Account',
        data: values,
        backgroundColor: accounts.map((_, i) => palette[i % palette.length]),
        borderColor: accounts.map(() => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'),
        hoverBorderColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Sum of Values by Account', color: labelColor },
      tooltip: {
        callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.x}` },
        titleColor: labelColor,
        bodyColor: labelColor,
        backgroundColor: theme.palette.background.paper,
      }
    },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: 'Sum', color: labelColor }, ticks: { color: labelColor }, grid: { color: gridColor } },
      y: { ticks: { color: labelColor }, grid: { color: gridColor } },
    },
    maintainAspectRatio: false,
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', height: 400, p: 2 }}>
      <Bar data={data} options={options} />
    </Paper>
  );
};

export default AccountSumChart;
