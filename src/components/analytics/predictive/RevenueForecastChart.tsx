
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ForecastData {
  month: string;
  actual: number | null;
  predicted: number;
}

interface RevenueForecastChartProps {
  forecastData: ForecastData[];
}

const RevenueForecastChart: React.FC<RevenueForecastChartProps> = ({ forecastData }) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">6-Month Revenue Forecast</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={forecastData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#3B82F6" 
            strokeWidth={2} 
            name="Actual"
            connectNulls={false}
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="#8B5CF6" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            name="Predicted"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueForecastChart;
