import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

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

  const data = {
    labels: ['Conta Corrente'],
    datasets: categories.map((cat, idx) => {
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
    }),
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
        min: Math.min(0, ...categories.map(cat => grouped[cat])),
        max: Math.max(0, ...categories.map(cat => grouped[cat])),
        title: { display: true, text: 'Valor' },
      },
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
