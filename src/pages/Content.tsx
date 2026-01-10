
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { useToast } from '@/hooks/use-toast';
import ContentAIAssistant from '@/components/content/ContentAIAssistant';
import IntelligentContentGenerator from '@/components/content/IntelligentContentGenerator';
import ContentPerformanceDashboard from '@/components/content/ContentPerformanceDashboard';
import ContentOptimizationPanel from '@/components/content/ContentOptimizationPanel';
import ContentWorkflowFeatures from '@/components/content/ContentWorkflowFeatures';
import ContentTemplates from '@/components/content/ContentTemplates';
import ContentIdeasManager from '@/components/content/ContentIdeasManager';
import ContentSchedulingDialog from '@/components/content/ContentSchedulingDialog';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contentIdeas, setContentIdeas] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const trackingId = behaviorTracker.trackFeatureStart('content_page');
    return () => {
      behaviorTracker.trackFeatureComplete('content_page', trackingId);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    behaviorTracker.trackAction('navigation', 'content_tab_change', {
      tab,
      timestamp: new Date().toISOString()
    });
  };

  const handleVideoGenerate = (ideas: ContentIdea[]) => {
    toast({
      title: "Video Generation Started",
      description: `Generating video from ${ideas.length} content ideas`,
    });
  };

  const handleCreateContent = () => {
    setActiveTab('generator');
    toast({
      title: "Content Creator",
      description: "Navigate to the Create tab to generate new content",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Creation Intelligence</h1>
          <p className="text-gray-600 mt-2">AI-powered content optimization and performance learning</p>
        </div>
        
        <div className="flex space-x-3">
          <ContentSchedulingDialog>
            <Button variant="outline" size="sm">
              Schedule Content
            </Button>
          </ContentSchedulingDialog>
          <Button size="sm" onClick={handleCreateContent}>
            Create Content
          </Button>
        </div>
      </div>

      {/* Content Ideas Manager */}
      <ContentIdeasManager onVideoGenerate={handleVideoGenerate} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <ContentAIAssistant />
        </div>

        {/* Main Dashboard */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Performance</TabsTrigger>
              <TabsTrigger value="generator">Create</TabsTrigger>
              <TabsTrigger value="optimization">Optimize</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <ContentPerformanceDashboard />
            </TabsContent>

            <TabsContent value="generator" className="space-y-6">
              <IntelligentContentGenerator />
            </TabsContent>

            <TabsContent value="optimization" className="space-y-6">
              <ContentOptimizationPanel />
            </TabsContent>

            <TabsContent value="workflows" className="space-y-6">
              <ContentWorkflowFeatures />
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <ContentTemplates />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <PageHelpModal helpKey="content" />
    </div>
  );
};

export default Content;
