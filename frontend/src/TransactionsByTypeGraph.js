import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);



const TransactionsByTypeGraph = ({ transactions }) => {
  // Filter for 'Corrente' account only
  const correnteTransactions = transactions.filter(t => t.account === 'Corrente');

  // Group by category, sum all amounts (income and expense combined as absolute value)
  const grouped = {};
  correnteTransactions.forEach(({ category, amount }) => {
    if (!grouped[category]) grouped[category] = 0;
    grouped[category] += Math.abs(amount);
  });

  const categories = Object.keys(grouped);

  const data = {
    labels: ['Conta Corrente'],
    datasets: categories.map((cat, idx) => ({
      label: cat,
      data: [grouped[cat]],
      backgroundColor: `hsl(${(idx * 360) / categories.length}, 70%, 60%)`,
      stack: 'total',
      borderWidth: 1,
    })),
  };

  const options = {
    indexAxis: 'y', // horizontal bar
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Total por Categoria (Conta Corrente)' },
    },
    scales: {
      x: { stacked: true, beginAtZero: true },
      y: { stacked: true },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TransactionsByTypeGraph;
