
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Insight } from './InsightsCards';

interface InsightsPanelProps {
  insights: Insight[];
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const activityData = [
    { feature: 'Campaigns', usage: insights.find(i => i.title === 'Campaigns')?.value || 5 },
    { feature: 'Content', usage: insights.find(i => i.title === 'Content Pieces')?.value || 8 },
    { feature: 'Social', usage: insights.find(i => i.title === 'Posts')?.value || 12 },
    { feature: 'Email', usage: insights.find(i => i.title === 'Emails Sent')?.value || 15 },
    { feature: 'Analytics', usage: 6 },
  ];

  const recommendations = [
    "Your email campaigns have 23% higher engagement than average",
    "Consider posting on social media during 2-4 PM for better reach",
    "Lead scoring shows 67% of prospects are sales-ready"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-slate-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Feature Usage</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="feature" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Bar dataKey="usage" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InsightsPanel;
