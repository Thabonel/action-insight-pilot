
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface PerformancePredictionsProps {
  nextMonth: {
    revenue: number;
    confidence: number;
    leads: number;
    campaigns: number;
  };
  quarterlyForecast: {
    revenue: number;
    growth: number;
    confidence: number;
  };
}

const PerformancePredictions: React.FC<PerformancePredictionsProps> = ({
  nextMonth,
  quarterlyForecast
}) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Performance Predictions</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Next Month Forecast</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">Revenue</span>
              <span className="font-bold text-blue-900">${nextMonth.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Leads</span>
              <span className="font-bold text-blue-900">{nextMonth.leads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Campaigns</span>
              <span className="font-bold text-blue-900">{nextMonth.campaigns}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Confidence</span>
              <Badge variant="outline">{nextMonth.confidence}%</Badge>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h5 className="font-medium text-green-900 mb-2">Quarterly Outlook</h5>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-green-700">Projected Revenue</span>
              <span className="font-bold text-green-900">${quarterlyForecast.revenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Growth Rate</span>
              <span className="font-bold text-green-900">{quarterlyForecast.growth}%</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-700">Confidence</span>
              <Badge variant="outline">{quarterlyForecast.confidence}%</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformancePredictions;
