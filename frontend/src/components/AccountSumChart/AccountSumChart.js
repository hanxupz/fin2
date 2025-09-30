import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const AccountSumChart = ({ transactions }) => {
  const theme = useTheme();

  // Group by account, sum all amounts
  const grouped = {};
  transactions.forEach(({ account, amount }) => {
    if (!grouped[account]) grouped[account] = 0;
    grouped[account] += amount;
  });

  const accounts = Object.keys(grouped);
  const values = accounts.map(acc => grouped[acc]);
  const labelColor = theme.palette.text.primary;

  // Chart data
  const data = {
    labels: accounts,
    datasets: [
      {
        label: 'Sum by Account',
        data: values,
        backgroundColor: '#1976d2',
      },
    ],
  };

  // Chart options
  const options = {
    indexAxis: 'y', // horizontal bar
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Sum of Values by Account',
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
        beginAtZero: true,
        title: { display: true, text: 'Sum', color: labelColor },
        ticks: { color: labelColor },
        grid: { color: labelColor },
      },
      y: {
        ticks: { color: labelColor },
        grid: { color: labelColor },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ background: theme.palette.background.paper, color: labelColor, borderRadius: 8, padding: 16 }}>
      <Paper elevation={3} sx={{ width: '100%', height: 200, p: 2 }}>
        <Bar data={data} options={options} />
      </Paper>
    </div>
  );
};

export default AccountSumChart;
