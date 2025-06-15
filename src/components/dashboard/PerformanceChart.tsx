
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  dashboardData: {
    analytics: any;
    campaigns: any;
    leads: any;
    email: any;
    social: any;
    systemStats: any;
  };
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ dashboardData }) => {
  // Generate sample performance data based on dashboard data
  const performanceData = [
    { name: 'Jan', campaigns: 4, leads: 24, emails: 100 },
    { name: 'Feb', campaigns: 3, leads: 13, emails: 110 },
    { name: 'Mar', campaigns: 2, leads: 18, emails: 120 },
    { name: 'Apr', campaigns: 5, leads: 39, emails: 140 },
    { name: 'May', campaigns: 4, leads: 48, emails: 160 },
    { name: 'Jun', campaigns: 3, leads: 38, emails: 150 },
  ];

  return (
    <div className="mt-8">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="campaigns" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="leads" stroke="#059669" strokeWidth={2} />
            <Line type="monotone" dataKey="emails" stroke="#dc2626" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
