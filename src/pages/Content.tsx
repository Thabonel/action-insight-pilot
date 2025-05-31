
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { 
  FileText, 
  TrendingUp, 
  Target, 
  Lightbulb,
  Calendar,
  BarChart3,
  Zap,
  Clock,
  ArrowUp,
  Heart,
  Share,
  Eye
} from 'lucide-react';
import ContentAIAssistant from '@/components/content/ContentAIAssistant';
import IntelligentContentGenerator from '@/components/content/IntelligentContentGenerator';
import ContentPerformanceDashboard from '@/components/content/ContentPerformanceDashboard';
import ContentOptimizationPanel from '@/components/content/ContentOptimizationPanel';
import ContentWorkflowFeatures from '@/components/content/ContentWorkflowFeatures';
import ContentTemplates from '@/components/content/ContentTemplates';

const Content: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Creation Intelligence</h1>
          <p className="text-gray-600 mt-2">AI-powered content optimization and performance learning</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Content
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Content Pieces</p>
                <p className="text-2xl font-bold">142</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +18% this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">24.7K</p>
                <p className="text-xs text-purple-600">Avg: 174 per piece</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">6.8%</p>
                <p className="text-xs text-green-600">Above industry avg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Share className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Top Performer</p>
                <p className="text-2xl font-bold">2.1K</p>
                <p className="text-xs text-green-600">views this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default Content;
