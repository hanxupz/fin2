import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Example data format:
// [
//   { control_date: '2025-09-01', accountA: 100, accountB: 200 },
//   { control_date: '2025-09-02', accountA: 150, accountB: 120 },
// ]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57", "#888888"];

function getAccountKeys(data) {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]).filter(key => key !== 'control_date');
}

const ControlDateAccountBarChart = ({ data }) => {
  const accountKeys = getAccountKeys(data);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
      >
        <XAxis type="number" />
        <YAxis dataKey="control_date" type="category" />
        <Tooltip />
        <Legend />
        {accountKeys.map((key, idx) => (
          <Bar key={key} dataKey={key} stackId="a" fill={COLORS[idx % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ControlDateAccountBarChart;
