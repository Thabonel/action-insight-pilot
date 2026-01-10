
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VisualWorkflowBuilder from '@/components/workflows/VisualWorkflowBuilder';
import { Workflow, WorkflowStep } from '@/lib/api-client-interface';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const Workflows: React.FC = () => {
  // Mock workflow data
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow>({
    id: 'workflow-1',
    name: 'Email Nurture Sequence',
    description: 'Automated email sequence for new leads',
    steps: [
      {
        id: 'step-1',
        type: 'trigger',
        config: { event: 'lead_created' },
        order: 1,
        title: 'New Lead Created',
        description: 'Triggers when a new lead is added',
        status: 'completed',
        icon: 'user-plus',
        color: 'blue'
      },
      {
        id: 'step-2',
        type: 'delay',
        config: { duration: '1h' },
        order: 2,
        title: 'Wait 1 Hour',
        description: 'Delay before sending welcome email',
        status: 'completed',
        icon: 'clock',
        color: 'gray'
      },
      {
        id: 'step-3',
        type: 'email',
        config: { template: 'welcome_email' },
        order: 3,
        title: 'Send Welcome Email',
        description: 'Send personalized welcome email',
        status: 'running',
        icon: 'mail',
        color: 'green'
      }
    ],
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const handleSaveWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
  };

  const handleExecuteWorkflow = (_workflowId: string) => {
    // Workflow execution handled by backend
  };

  const workflows: Workflow[] = [
    selectedWorkflow,
    {
      id: 'workflow-2',
      name: 'Lead Scoring',
      description: 'Automatically score leads based on behavior',
      steps: [],
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0D10] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#E9EEF5]">Workflows</h1>
            <p className="text-gray-600 dark:text-[#94A3B8] mt-1">Automate your marketing processes</p>
          </div>
          <Button>
            Create Workflow
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflow List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Workflows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedWorkflow.id === workflow.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-[rgba(59,130,246,0.15)]'
                        : 'border-gray-200 dark:border-[#273140] hover:border-gray-300 dark:hover:border-[#334155]'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{workflow.name}</h3>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-[#94A3B8] mb-2">
                      {workflow.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        {workflow.status === 'active' ? 'Pause' : 'Play'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Workflow Builder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <VisualWorkflowBuilder
                  workflow={selectedWorkflow}
                  onSave={handleSaveWorkflow}
                  onExecute={handleExecuteWorkflow}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <PageHelpModal helpKey="workflows" />
    </div>
  );
};

export default Workflows;
