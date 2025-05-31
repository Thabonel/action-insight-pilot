
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { 
  Share2, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3,
  Zap,
  Clock,
  ArrowUp,
  Heart,
  MessageCircle,
  Repeat2,
  Eye
} from 'lucide-react';
import SocialAIAssistant from '@/components/social/SocialAIAssistant';
import IntelligentPostScheduler from '@/components/social/IntelligentPostScheduler';
import SocialPerformanceDashboard from '@/components/social/SocialPerformanceDashboard';
import EngagementPatternAnalysis from '@/components/social/EngagementPatternAnalysis';
import SocialWorkflowAutomation from '@/components/social/SocialWorkflowAutomation';
import PlatformOptimization from '@/components/social/PlatformOptimization';

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const trackingId = behaviorTracker.trackFeatureStart('social_page');
    return () => {
      behaviorTracker.trackFeatureComplete('social_page', trackingId);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    behaviorTracker.trackAction('navigation', 'social_tab_change', {
      tab,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Media Intelligence</h1>
          <p className="text-gray-600 mt-2">AI-powered social media optimization and engagement learning</p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Posts
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +23% this month
                </p>
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
                <p className="text-2xl font-bold">8.4%</p>
                <p className="text-xs text-green-600">Above avg: 4.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Followers</p>
                <p className="text-2xl font-bold">45.2K</p>
                <p className="text-xs text-purple-600">Growth: +12% month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Best Platform</p>
                <p className="text-2xl font-bold">LinkedIn</p>
                <p className="text-xs text-green-600">12.3% engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <SocialAIAssistant />
        </div>

        {/* Main Dashboard */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Performance</TabsTrigger>
              <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
              <TabsTrigger value="patterns">Patterns</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <SocialPerformanceDashboard />
            </TabsContent>

            <TabsContent value="scheduler" className="space-y-6">
              <IntelligentPostScheduler />
            </TabsContent>

            <TabsContent value="patterns" className="space-y-6">
              <EngagementPatternAnalysis />
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <SocialWorkflowAutomation />
            </TabsContent>

            <TabsContent value="platforms" className="space-y-6">
              <PlatformOptimization />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Social;
