
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Zap, Play, Pause, Settings, Share2, Calendar, Target, TrendingUp } from 'lucide-react';

const SocialWorkflowAutomation: React.FC = () => {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Cross-Platform Posting',
      description: 'Automatically optimize and post to all platforms',
      isActive: true,
      lastRun: '2 hours ago',
      success: 94,
      actions: ['Optimize content', 'Schedule posts', 'Track performance']
    },
    {
      id: 2,
      name: 'Top Content Repurposing',
      description: 'Repurpose high-performing content weekly',
      isActive: true,
      lastRun: '1 day ago',
      success: 89,
      actions: ['Find top posts', 'Create variations', 'Schedule reposts']
    },
    {
      id: 3,
      name: 'Engagement Response',
      description: 'Auto-engage with high-value interactions',
      isActive: false,
      lastRun: '3 days ago',
      success: 76,
      actions: ['Monitor mentions', 'Like relevant posts', 'Follow key accounts']
    }
  ]);

  const quickActions = [
    {
      title: 'Post to All Platforms',
      description: 'AI-optimized posting with platform variations',
      icon: Share2,
      color: 'blue',
      confidence: 96
    },
    {
      title: 'Schedule Optimal Week',
      description: 'Fill next week with AI-suggested content',
      icon: Calendar,
      color: 'green',
      confidence: 91
    },
    {
      title: 'Repurpose Top Performer',
      description: 'Create variations of your best content',
      icon: TrendingUp,
      color: 'purple',
      confidence: 88
    },
    {
      title: 'Boost Underperforming',
      description: 'Optimize and repost low-engagement content',
      icon: Target,
      color: 'orange',
      confidence: 82
    }
  ];

  const recentRuns = [
    {
      workflow: 'Cross-Platform Posting',
      status: 'Success',
      time: '2 hours ago',
      details: 'Posted to 4 platforms, 12.3% avg engagement'
    },
    {
      workflow: 'Top Content Repurposing',
      status: 'Success',
      time: '1 day ago',
      details: 'Repurposed 3 posts, scheduled for this week'
    },
    {
      workflow: 'Performance Analysis',
      status: 'Running',
      time: '30 minutes ago',
      details: 'Analyzing last week\'s performance data'
    }
  ];

  const toggleWorkflow = (id: number) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id 
        ? { ...workflow, isActive: !workflow.isActive }
        : workflow
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-600';
      case 'Running': return 'text-blue-600';
      case 'Failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Automation Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-24 flex-col justify-center p-4"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`h-5 w-5 text-${action.color}-600`} />
                    <span className="font-medium">{action.title}</span>
                    <Badge variant="secondary">{action.confidence}%</Badge>
                  </div>
                  <p className="text-sm text-gray-600 text-center">{action.description}</p>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={workflow.isActive}
                      onCheckedChange={() => toggleWorkflow(workflow.id)}
                    />
                    <div>
                      <h3 className="font-medium">{workflow.name}</h3>
                      <p className="text-sm text-gray-600">{workflow.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{workflow.success}% success</Badge>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Last Run</p>
                    <p className="font-medium">{workflow.lastRun}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="font-medium">{workflow.success}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Actions</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {workflow.actions.map((action, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {action}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Run Now
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Automation Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRuns.map((run, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    run.status === 'Success' ? 'bg-green-500' :
                    run.status === 'Running' ? 'bg-blue-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{run.workflow}</p>
                    <p className="text-sm text-gray-600">{run.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${getStatusColor(run.status)}`}>{run.status}</p>
                  <p className="text-sm text-gray-600">{run.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">94%</p>
              <p className="text-sm text-gray-600">Automation Success</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">12.3h</p>
              <p className="text-sm text-gray-600">Time Saved Weekly</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">156</p>
              <p className="text-sm text-gray-600">Posts Automated</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">18%</p>
              <p className="text-sm text-gray-600">Engagement Increase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialWorkflowAutomation;
