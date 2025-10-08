import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import { surfaceBoxSx } from '../../theme/primitives';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const TransactionsByTypeGraph = React.memo(({ transactions, categoryColors }) => {
  const theme = useTheme();
  
  // Memoize expensive calculations
  const chartData = React.useMemo(() => {
    const correnteTransactions = transactions.filter(t => t.account === 'Corrente');

    // Group by category, sum all amounts (can be negative or positive)
    const grouped = {};
    correnteTransactions.forEach(({ category, amount }) => {
      if (!grouped[category]) grouped[category] = 0;
      grouped[category] += amount;
    });

    const categories = Object.keys(grouped);
    return { grouped, categories };
  }, [transactions]);

  const { grouped, categories } = chartData;
  const labelColor = theme.palette.text.primary;
  const gridColor = theme.palette.divider;
  const paletteBase = theme.palette.charts.category;
  const palette = categoryColors || categories.reduce((acc, cat, idx) => ({ ...acc, [cat]: paletteBase[idx % paletteBase.length] }), {});

  // If no categories, show a dummy dataset to avoid chartjs errors
  const datasets = categories.length > 0 ? categories.map((cat) => ({
    label: cat,
    data: [grouped[cat]],
    backgroundColor: palette[cat],
    stack: 'total',
    borderWidth: 1,
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
    hoverBorderColor: theme.palette.mode === 'dark' ? '#fff' : '#000',
    borderRadius: 4,
  })) : [{ label: 'No Data', data: [0], backgroundColor: gridColor, stack: 'total', borderWidth: 0 }];

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
        grid: { color: gridColor },
      },
      y: {
        stacked: true,
        ticks: { color: labelColor },
        grid: { color: gridColor },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Paper elevation={3} sx={(t)=>({ ...surfaceBoxSx(t), p: 3, background: t.palette.background.paper, height : 220 })}>
      <Bar data={data} options={options} />
    </Paper>
  );
});

TransactionsByTypeGraph.displayName = 'TransactionsByTypeGraph';

export default TransactionsByTypeGraph;
