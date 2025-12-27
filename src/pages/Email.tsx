
import React from 'react';
import { FloatingHelpButton } from '@/components/common/FloatingHelpButton';
import EmailAIAssistant from '@/components/email/EmailAIAssistant';
import IntelligentCampaignBuilder from '@/components/email/IntelligentCampaignBuilder';
import RealTimeMetricsDashboard from '@/components/email/RealTimeMetricsDashboard';
import BehavioralAutomation from '@/components/email/BehavioralAutomation';
import EmailWorkflowFeatures from '@/components/email/EmailWorkflowFeatures';

const Email: React.FC = () => {
  // Mock campaign ID - replace with actual campaign selection
  const activeCampaignId = "campaign_123";

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Email Automation</h1>
        <p className="text-gray-600 mt-2">AI-powered email campaigns with real-time analytics and behavioral triggers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <EmailAIAssistant />
        </div>

        {/* Campaign Builder */}
        <div className="lg:col-span-2">
          <IntelligentCampaignBuilder />
        </div>
      </div>

      {/* Real-Time Metrics Dashboard */}
      <RealTimeMetricsDashboard campaignId={activeCampaignId} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Behavioral Automation */}
        <BehavioralAutomation />

        {/* Workflow Features */}
        <EmailWorkflowFeatures />
      </div>
      <FloatingHelpButton helpSection="email" />
    </div>
  );
};

export default Email;
