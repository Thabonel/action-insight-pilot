
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SystemMetric } from '@/types/metrics';
import { getColorClasses } from '@/utils/metricUtils';

interface MetricCardProps {
  metric: SystemMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const Icon = metric.icon;
  const colorClasses = getColorClasses(metric.color);
  const [gradientFrom, gradientTo, textColor, bgColor] = colorClasses.split(' ');
  
  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-5`}></div>
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600 truncate">
            {metric.title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <Icon className={`h-4 w-4 ${textColor}`} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
            {metric.trend === 'up' && (
              <span className="text-green-500 font-bold">+</span>
            )}
            {metric.trend === 'loading' && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            )}
          </div>
          
          <p className="text-xs text-slate-500">{metric.change}</p>
          
          {/* Performance bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Performance</span>
              <span className="text-xs font-medium text-slate-600">{metric.performance}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} h-1.5 rounded-full transition-all duration-1000`}
                style={{ width: `${metric.performance}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
