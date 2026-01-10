
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { behaviorTracker } from '@/lib/behavior-tracker';
import SocialAIAssistant from '@/components/social/SocialAIAssistant';
import IntelligentPostScheduler from '@/components/social/IntelligentPostScheduler';
import SocialPerformanceDashboard from '@/components/social/SocialPerformanceDashboard';
import EngagementPatternAnalysis from '@/components/social/EngagementPatternAnalysis';
import SocialWorkflowAutomation from '@/components/social/SocialWorkflowAutomation';
import PlatformOptimization from '@/components/social/PlatformOptimization';
import SocialHeader from '@/components/social/SocialHeader';
import SocialStatsCards from '@/components/social/SocialStatsCards';
import PlatformConnectionBanner from '@/components/social/PlatformConnectionBanner';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectedPlatforms, setConnectedPlatforms] = useState(2); // This would come from your API

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
    <div className="p-6 space-y-6 bg-white dark:bg-[#0B0D10] min-h-screen">
      <SocialHeader 
        onCreatePost={handleCreatePost}
        onSchedulePosts={handleSchedulePosts}
      />

      <PlatformConnectionBanner connectedPlatforms={connectedPlatforms} />

      <SocialStatsCards connectedPlatforms={connectedPlatforms} />

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
      <PageHelpModal helpKey="social" />
    </div>
  );
};

export default Social;
