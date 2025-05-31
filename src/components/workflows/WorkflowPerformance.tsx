
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

const WorkflowPerformance: React.FC = () => {
  const performanceMetrics = [
    {
      metric: 'Workflow Efficiency',
      value: '87%',
      change: '+12%',
      trend: 'up',
      description: 'Average across all active workflows'
    },
    {
      metric: 'Time Saved',
      value: '23.4h',
      change: '+5.2h',
      trend: 'up',
      description: 'Per week through automation'
    },
    {
      metric: 'Conversion Rate',
      value: '18.3%',
      change: '-2.1%',
      trend: 'down',
      description: 'Across all workflow conversions'
    },
    {
      metric: 'Cost per Lead',
      value: '$12.45',
      change: '0%',
      trend: 'neutral',
      description: 'Average cost through workflows'
    }
  ];

  const topPerformers = [
    {
      name: 'Holiday Campaign',
      efficiency: 94,
      conversions: 89,
      impact: 'high'
    },
    {
      name: 'Content Amplification',
      efficiency: 91,
      conversions: 67,
      impact: 'high'
    },
    {
      name: 'Lead Scoring Test',
      efficiency: 89,
      conversions: 12,
      impact: 'medium'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-orange-600" />
          <span>Performance Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
          <div className="space-y-3">
            {performanceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{metric.metric}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{metric.value}</p>
                  <p className={`text-xs ${getTrendColor(metric.trend)}`}>{metric.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Top Performing Workflows</h4>
          <div className="space-y-2">
            {topPerformers.map((workflow, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium text-sm">{workflow.name}</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-600">
                      {workflow.efficiency}% efficient
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600">
                      {workflow.conversions} conversions
                    </span>
                  </div>
                </div>
                <Badge className={getImpactColor(workflow.impact)}>
                  {workflow.impact} impact
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">AI Insights</h4>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• Your best workflows run Tuesday-Thursday</li>
            <li>• Email steps show 23% higher engagement than social</li>
            <li>• Workflows with 5-7 steps perform 18% better</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowPerformance;
