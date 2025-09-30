import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ExpensesByTypeGraph = ({ expenses }) => {
  // Group expenses by type for the current control date
  const grouped = expenses.reduce((acc, expense) => {
    const { type, amount } = expense;
    acc[type] = (acc[type] || 0) + amount;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(grouped),
    datasets: [
      {
        label: 'Expenses by Type',
        data: Object.values(grouped),
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Expenses by Type' },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ExpensesByTypeGraph;
