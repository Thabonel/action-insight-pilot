
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface Workflow {
  id: number;
  name: string;
  description: string;
  confidence: number;
  estimatedTime: string;
  action: string;
}

const ContentWorkflowFeatures: React.FC = () => {
  const [workflows] = useState<Workflow[]>([
    {
      id: 1,
      name: "Create Similar to Top Performer",
      description: "Generate content based on your best performing piece",
      confidence: 96,
      estimatedTime: "15 mins",
      action: "create_similar"
    },
    {
      id: 2,
      name: "Repurpose High-Performing Content",
      description: "Transform successful content into different formats",
      confidence: 89,
      estimatedTime: "10 mins",
      action: "repurpose"
    },
    {
      id: 3,
      name: "Schedule for Optimal Times",
      description: "Auto-schedule content for your best performing times",
      confidence: 92,
      estimatedTime: "5 mins",
      action: "schedule_optimal"
    },
    {
      id: 4,
      name: "A/B Test Content Variations",
      description: "Create variations for testing different approaches",
      confidence: 85,
      estimatedTime: "20 mins",
      action: "ab_test"
    }
  ]);

  const [automations] = useState([
    {
      name: "Content-to-Social Workflow",
      status: "active",
      description: "Automatically create social posts from blog content",
      runs: 24,
      success: 92
    },
    {
      name: "SEO Optimization Check",
      status: "active", 
      description: "Auto-analyze and suggest SEO improvements",
      runs: 18,
      success: 87
    },
    {
      name: "Performance Alert System",
      status: "active",
      description: "Notify when content performance changes significantly",
      runs: 156,
      success: 95
    }
  ]);

  const [recentActions] = useState([
    {
      action: "Created 'Lead Generation Tips' based on top performer",
      time: "2 hours ago",
      success: true,
      result: "94% predicted engagement"
    },
    {
      action: "Scheduled 3 posts for optimal times this week",
      time: "5 hours ago", 
      success: true,
      result: "23% better timing"
    },
    {
      action: "Repurposed case study into social content",
      time: "1 day ago",
      success: true,
      result: "156 shares generated"
    }
  ]);

  const handleWorkflowStart = (workflow: Workflow) => {
    behaviorTracker.trackAction('feature_use', 'content_workflow_start', {
      workflowId: workflow.id,
      workflowName: workflow.name,
      action: workflow.action
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Content Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow) => {
              return (
                <Card
                  key={workflow.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleWorkflowStart(workflow)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {workflow.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {workflow.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {workflow.confidence}% confidence
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {workflow.estimatedTime}
                            </span>
                          </div>
                          <Button size="sm">Start</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Automations */}
        <Card>
          <CardHeader>
            <CardTitle>Active Automations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {automations.map((automation, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{automation.name}</h4>
                  <Badge 
                    variant={automation.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {automation.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{automation.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{automation.runs} runs</span>
                  <span className="text-green-600">{automation.success}% success</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Workflow Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActions.map((action, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 mb-1">{action.action}</p>
                    <p className="text-xs text-gray-500 mb-2">{action.time}</p>
                    <div className="bg-green-50 rounded px-2 py-1">
                      <span className="text-xs text-green-700">
                        Result: {action.result}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Content Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-xs">Duplicate Best</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-xs">Schedule Batch</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-xs">Cross-Post</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <span className="text-xs">Boost Top</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentWorkflowFeatures;
