
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreativeBriefBuilder from '@/components/creative/CreativeBriefBuilder';
import CreativeWorkflowPipeline from '@/components/creative/CreativeWorkflowPipeline';
import { FileText, GitBranch, BarChart3 } from 'lucide-react';

const CreativeWorkflow: React.FC = () => {
  const [activeTab, setActiveTab] = useState('briefs');

  return (
    <div className="space-y-8 p-6 bg-white min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Creative Workflow</h1>
        <p className="text-gray-600 mt-2">
          Build comprehensive creative briefs, manage approval workflows, and track project progress.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="briefs" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Creative Briefs</span>
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4" />
            <span>Workflow Pipeline</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Performance Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="briefs" className="mt-6">
          <CreativeBriefBuilder />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <CreativeWorkflowPipeline />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics</h3>
            <p className="text-gray-600">
              Creative performance analytics will be available in the next phase.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreativeWorkflow;
