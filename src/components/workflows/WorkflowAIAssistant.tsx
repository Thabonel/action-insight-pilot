
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const WorkflowAIAssistant: React.FC = () => {
  const [suggestions] = useState([
    {
      id: 1,
      type: 'optimization',
      title: 'Optimize Lead Nurture Timing',
      description: 'Your email sequences could improve 23% with better timing',
      confidence: 94,
      impact: 'high'
    },
    {
      id: 2,
      type: 'bottleneck',
      title: 'Social Media Bottleneck',
      description: 'Content approval is slowing your social workflows by 2.5 days',
      confidence: 87,
      impact: 'medium'
    },
    {
      id: 3,
      type: 'template',
      title: 'Product Launch Template',
      description: 'Ready-to-use workflow for your upcoming product launch',
      confidence: 92,
      impact: 'high'
    }
  ]);

  const [workflowInsights] = useState({
    totalWorkflows: 12,
    activeWorkflows: 8,
    avgEfficiency: 86,
    timesSaved: '14.2 hours/week',
    successRate: 94
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Workflow AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-3">Workflow Health</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-purple-600">Active</p>
              <p className="font-bold text-purple-900">{workflowInsights.activeWorkflows}/{workflowInsights.totalWorkflows}</p>
            </div>
            <div>
              <p className="text-purple-600">Efficiency</p>
              <p className="font-bold text-purple-900">{workflowInsights.avgEfficiency}%</p>
            </div>
            <div>
              <p className="text-purple-600">Time Saved</p>
              <p className="font-bold text-purple-900">{workflowInsights.timesSaved}</p>
            </div>
            <div>
              <p className="text-purple-600">Success Rate</p>
              <p className="font-bold text-purple-900">{workflowInsights.successRate}%</p>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Smart Suggestions</h4>
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              return (
                <div key={suggestion.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{suggestion.title}</span>
                        <Badge className={getImpactColor(suggestion.impact)}>
                          {suggestion.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{suggestion.confidence}% confidence</span>
                        <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                          Apply
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
        <div className="pt-4 border-t space-y-2">
          <Button size="sm" className="w-full" variant="outline">
            Create Smart Workflow
          </Button>
          <Button size="sm" className="w-full" variant="outline">
            Optimize All Workflows
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowAIAssistant;
