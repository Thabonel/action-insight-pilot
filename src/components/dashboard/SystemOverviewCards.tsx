
import React from 'react';
import MetricCard from './MetricCard';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';

const SystemOverviewCards: React.FC = () => {
  const { metrics } = useSystemMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </div>
  );
};

export default SystemOverviewCards;
