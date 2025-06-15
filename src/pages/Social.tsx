
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  Settings,
  Plus
} from 'lucide-react';
import SocialAIAssistant from '@/components/social/SocialAIAssistant';
import IntelligentPostScheduler from '@/components/social/IntelligentPostScheduler';
import SocialPerformanceDashboard from '@/components/social/SocialPerformanceDashboard';
import EngagementPatternAnalysis from '@/components/social/EngagementPatternAnalysis';
import SocialWorkflowAutomation from '@/components/social/SocialWorkflowAutomation';
import PlatformOptimization from '@/components/social/PlatformOptimization';

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectedPlatforms, setConnectedPlatforms] = useState(2); // This would come from your API
  const navigate = useNavigate();

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

  const handleCreatePost = () => {
    setActiveTab('scheduler');
    behaviorTracker.trackAction('feature_use', 'create_post_button', {
      source: 'main_header'
    });
  };

  const handleSchedulePosts = () => {
    setActiveTab('scheduler');
    behaviorTracker.trackAction('feature_use', 'schedule_posts_button', {
      source: 'main_header'
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/connect-platforms')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Platforms
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSchedulePosts}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Posts
          </Button>
          <Button 
            size="sm"
            onClick={handleCreatePost}
          >
            <Zap className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Platform Connection Status */}
      {connectedPlatforms === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🔗</div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Connect Your Social Media Tools</h3>
                <p className="text-blue-800 mb-4">
                  Connect Buffer, Hootsuite, Later, or Sprout Social to push AI-generated content directly to your existing workflow.
                </p>
                <Button onClick={() => navigate('/connect-platforms')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Platform
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Connected Platforms</p>
                <p className="text-2xl font-bold">{connectedPlatforms}</p>
                <p className="text-xs text-blue-600">
                  {connectedPlatforms > 0 ? 'Active integrations' : 'Ready to connect'}
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
                <p className="text-sm text-gray-600">Total Followers</p>
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
                <p className="text-sm text-gray-600">AI Posts This Week</p>
                <p className="text-2xl font-bold">24</p>
                <p className="text-xs text-green-600">+18% vs last week</p>
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
