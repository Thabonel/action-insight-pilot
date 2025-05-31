
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Settings, MoreHorizontal } from 'lucide-react';

const ActiveWorkflows: React.FC = () => {
  const activeWorkflows = [
    {
      id: 1,
      name: 'Holiday Campaign',
      status: 'running',
      progress: 67,
      currentStep: 'Email Sequence',
      nextStep: 'Social Promotion',
      leads: 1247,
      conversions: 89,
      efficiency: 94
    },
    {
      id: 2,
      name: 'Product Demo Series',
      status: 'running',
      progress: 34,
      currentStep: 'Welcome Email',
      nextStep: 'Demo Invitation',
      leads: 523,
      conversions: 34,
      efficiency: 87
    },
    {
      id: 3,
      name: 'Content Amplification',
      status: 'paused',
      progress: 78,
      currentStep: 'Blog Distribution',
      nextStep: 'Social Sharing',
      leads: 892,
      conversions: 67,
      efficiency: 91
    },
    {
      id: 4,
      name: 'Lead Scoring Test',
      status: 'running',
      progress: 23,
      currentStep: 'Data Collection',
      nextStep: 'Score Assignment',
      leads: 345,
      conversions: 12,
      efficiency: 89
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeWorkflows.map((workflow) => (
            <div key={workflow.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">{workflow.name}</h4>
                  <Badge className={getStatusColor(workflow.status)}>
                    {workflow.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-1">
                  {workflow.status === 'running' ? (
                    <Button size="sm" variant="outline">
                      <Pause className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{workflow.progress}%</span>
                  </div>
                  <Progress value={workflow.progress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Current Step</p>
                    <p className="font-medium">{workflow.currentStep}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Next Step</p>
                    <p className="font-medium">{workflow.nextStep}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{workflow.leads}</p>
                    <p className="text-xs text-gray-600">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{workflow.conversions}</p>
                    <p className="text-xs text-gray-600">Conversions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">{workflow.efficiency}%</p>
                    <p className="text-xs text-gray-600">Efficiency</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4" variant="outline">
          View All Workflows
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActiveWorkflows;
