
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

  // Get all account keys
  const accountKeys = Object.keys(data[0]).filter(k => k !== 'control_date');
  const controlDates = data.map(d => d.control_date);

  // Color palette from theme
  const palette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#81d4fa', '#ffd54f', '#ce93d8', '#ffab91', '#a5d6a7', '#f48fb1', '#b39ddb', '#ffcc80'
  ];

  // Build datasets for Chart.js
  const datasets = accountKeys.map((acc, idx) => ({
    label: acc,
    data: data.map(d => d[acc] || 0),
    backgroundColor: palette[idx % palette.length],
    stack: 'accounts',
    borderWidth: 1,
  }));

  const chartData = {
    labels: controlDates,
    datasets,
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: theme.palette.text.primary },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.x}`;
          }
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.primary },
      },
      y: {
        stacked: true,
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.primary },
      },
    },
  };

  return (
    <Paper elevation={3} style={{ padding: 24, marginTop: 16 }}>
      <Bar data={chartData} options={options} height={400} />
    </Paper>
  );
};

export default ControlDateAccountBarChart;
