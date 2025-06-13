
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InsightsPanelProps {
  insights: {
    topFeatures: string[];
    recommendations: string[];
  };
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  const activityData = [
    { feature: 'Campaigns', usage: insights.topFeatures.filter(f => f === 'campaigns').length * 10 || 5 },
    { feature: 'Content', usage: insights.topFeatures.filter(f => f === 'content').length * 10 || 8 },
    { feature: 'Social', usage: insights.topFeatures.filter(f => f === 'social').length * 10 || 12 },
    { feature: 'Email', usage: insights.topFeatures.filter(f => f === 'email').length * 10 || 15 },
    { feature: 'Analytics', usage: insights.topFeatures.filter(f => f === 'analytics').length * 10 || 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">AI Recommendations</h3>
        <div className="space-y-3">
          {insights.recommendations.length > 0 ? (
            insights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-700">{rec}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Keep using the platform to get personalized recommendations!</p>
          )}
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
