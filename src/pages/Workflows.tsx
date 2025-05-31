
import React from 'react';
import WorkflowAIAssistant from '@/components/workflows/WorkflowAIAssistant';
import VisualWorkflowBuilder from '@/components/workflows/VisualWorkflowBuilder';
import WorkflowTemplates from '@/components/workflows/WorkflowTemplates';
import ActiveWorkflows from '@/components/workflows/ActiveWorkflows';
import WorkflowPerformance from '@/components/workflows/WorkflowPerformance';

const Workflows: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workflow Automation</h1>
        <p className="text-gray-600 mt-2">AI-powered multi-step campaign orchestration across all channels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <WorkflowAIAssistant />
        </div>

        {/* Visual Builder */}
        <div className="lg:col-span-3">
          <VisualWorkflowBuilder />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Templates */}
        <WorkflowTemplates />

        {/* Active Workflows */}
        <ActiveWorkflows />

        {/* Performance */}
        <WorkflowPerformance />
      </div>
    </div>
  );
};

export default Workflows;
