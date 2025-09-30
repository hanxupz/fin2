import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);



const TransactionsByTypeGraph = ({ transactions }) => {
  // Filter for 'Corrente' account only
  const correnteTransactions = transactions.filter(t => t.account === 'Corrente');

  // Group by category and type, where type is determined by amount sign
  const grouped = {};
  correnteTransactions.forEach(({ category, amount }) => {
    if (!grouped[category]) grouped[category] = { income: 0, expense: 0 };
    if (amount > 0) grouped[category].income += amount;
    else grouped[category].expense += Math.abs(amount);
  });

  const categories = Object.keys(grouped);
  const incomeData = categories.map(cat => grouped[cat].income);
  const expenseData = categories.map(cat => grouped[cat].expense);

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Receitas (Corrente)',
        data: incomeData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        stack: 'Stack 0',
      },
      {
        label: 'Despesas (Corrente)',
        data: expenseData,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        stack: 'Stack 0',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Receitas e Despesas por Categoria (Conta Corrente)' },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  return <Bar data={data} options={options} />;
};

export default TransactionsByTypeGraph;
