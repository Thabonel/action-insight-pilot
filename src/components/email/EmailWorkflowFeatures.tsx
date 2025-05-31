
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Workflow, Zap, Target, Clock, TrendingUp, Users, Mail } from 'lucide-react';

const EmailWorkflowFeatures: React.FC = () => {
  const [workflows] = useState([
    {
      id: 1,
      name: 'Hot Lead Sequence',
      description: 'Automated follow-up for high-scoring leads',
      trigger: 'Lead score > 80',
      emails: 3,
      performance: 'Very High',
      conversionRate: 18.4,
      icon: Target
    },
    {
      id: 2,
      name: 'Time-Optimized Sends',
      description: 'Send emails at optimal times for each recipient',
      trigger: 'AI timing analysis',
      emails: 'All',
      performance: 'High',
      conversionRate: 34.2,
      icon: Clock
    },
    {
      id: 3,
      name: 'A/B Test Generator',
      description: 'Automatically creates and tests email variations',
      trigger: 'New campaign',
      emails: 'Varies',
      performance: 'High',
      conversionRate: 28.7,
      icon: TrendingUp
    },
    {
      id: 4,
      name: 'Nurture Path Creator',
      description: 'Builds sequences based on lead behavior',
      trigger: 'Engagement patterns',
      emails: '5-7',
      performance: 'Medium',
      conversionRate: 12.1,
      icon: Users
    }
  ]);

  const [quickActions] = useState([
    {
      action: 'Create sequence for hot leads',
      description: 'Build automated follow-up for high-scoring leads',
      estimatedImpact: '+25% conversion',
      icon: Target,
      color: 'bg-red-50 text-red-600'
    },
    {
      action: 'Optimize all send times with AI',
      description: 'Apply machine learning to all campaign timing',
      estimatedImpact: '+15% open rate',
      icon: Clock,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      action: 'Generate variations for testing',
      description: 'Create A/B test versions of top campaigns',
      estimatedImpact: '+20% performance',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600'
    },
    {
      action: 'Create nurture sequence from template',
      description: 'Use proven templates for lead nurturing',
      estimatedImpact: '+30% engagement',
      icon: Users,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      action: 'Track email ROI by campaign',
      description: 'Set up revenue attribution tracking',
      estimatedImpact: 'Clear ROI data',
      icon: Mail,
      color: 'bg-yellow-50 text-yellow-600'
    }
  ]);

  const [roiMetrics] = useState({
    totalRevenue: 145620,
    emailAttribution: 68,
    avgOrderValue: 450,
    customerLifetimeValue: 1250
  });

  const handleWorkflowActivate = (workflowId: number) => {
    behaviorTracker.trackAction('feature_use', 'email_workflow_activate', { workflowId });
  };

  const handleQuickAction = (action: string) => {
    behaviorTracker.trackAction('feature_use', 'email_quick_workflow', { action });
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'Very High': return { variant: 'default' as const, className: 'bg-green-600' };
      case 'High': return { variant: 'secondary' as const, className: 'bg-blue-600' };
      case 'Medium': return { variant: 'outline' as const, className: 'bg-yellow-600' };
      default: return { variant: 'destructive' as const, className: 'bg-red-600' };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Workflow className="h-5 w-5 text-indigo-600" />
          <span>Email Workflow Features</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ROI Metrics */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-indigo-900 mb-3">Email ROI Performance</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">
                ${roiMetrics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-indigo-700">Revenue Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">{roiMetrics.emailAttribution}%</div>
              <div className="text-xs text-indigo-700">Email Attribution</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">
                ${roiMetrics.avgOrderValue}
              </div>
              <div className="text-xs text-indigo-700">Avg Order Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-900">
                ${roiMetrics.customerLifetimeValue}
              </div>
              <div className="text-xs text-indigo-700">Customer LTV</div>
            </div>
          </div>
        </div>

        {/* Smart Workflows */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Smart Workflows</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow) => {
              const Icon = workflow.icon;
              return (
                <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{workflow.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {workflow.trigger}
                        </Badge>
                        <Badge {...getPerformanceBadge(workflow.performance)} className="text-xs">
                          {workflow.performance}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-sm text-gray-600">
                          {workflow.emails} emails • {workflow.conversionRate}% conversion
                        </span>
                        <Button 
                          size="sm" 
                          onClick={() => handleWorkflowActivate(workflow.id)}
                        >
                          Activate
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Quick Workflow Actions</h4>
          <div className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{action.action}</h5>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      {action.estimatedImpact}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button className="flex-1">
            <Workflow className="h-4 w-4 mr-2" />
            Create Custom Workflow
          </Button>
          <Button variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            AI Optimization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailWorkflowFeatures;
