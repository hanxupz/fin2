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

  // Each stack is a category, so we need a single bar with each stack segment representing a category
  const incomeStack = categories.map(cat => grouped[cat].income);
  const expenseStack = categories.map(cat => grouped[cat].expense);

  const data = {
    labels: ['Conta Corrente'],
    datasets: categories.map((cat, idx) => ({
      label: `Receita: ${cat}`,
      data: [grouped[cat].income],
      backgroundColor: `hsl(${(idx * 360) / categories.length}, 60%, 60%)`,
      stack: 'income',
    })).concat(
      categories.map((cat, idx) => ({
        label: `Despesa: ${cat}`,
        data: [grouped[cat].expense],
        backgroundColor: `hsl(${(idx * 360) / categories.length}, 80%, 70%)`,
        stack: 'expense',
      }))
    ),
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
