
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PerformanceChart: React.FC = () => {
  const performanceData = [
    { name: 'Mon', campaigns: 4, leads: 24, emails: 12 },
    { name: 'Tue', campaigns: 3, leads: 18, emails: 15 },
    { name: 'Wed', campaigns: 6, leads: 32, emails: 20 },
    { name: 'Thu', campaigns: 8, leads: 45, emails: 18 },
    { name: 'Fri', campaigns: 5, leads: 28, emails: 22 },
    { name: 'Sat', campaigns: 2, leads: 15, emails: 8 },
    { name: 'Sun', campaigns: 1, leads: 12, emails: 5 },
  ];

  return (
    <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Weekly Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="campaigns" stroke="#2563eb" strokeWidth={2} />
          <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="emails" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
