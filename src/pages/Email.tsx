
import React from 'react';
import { Link } from 'react-router-dom';
import EmailAIAssistant from '@/components/email/EmailAIAssistant';
import IntelligentCampaignBuilder from '@/components/email/IntelligentCampaignBuilder';
import RealTimeMetricsDashboard from '@/components/email/RealTimeMetricsDashboard';
import BehavioralAutomation from '@/components/email/BehavioralAutomation';
import EmailWorkflowFeatures from '@/components/email/EmailWorkflowFeatures';
import { PageHelpModal } from '@/components/common/PageHelpModal';
import { Info } from 'lucide-react';

const Email: React.FC = () => {
  // Mock campaign ID - replace with actual campaign selection
  const activeCampaignId = "campaign_123";

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-[#0B0D10] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-[#E9EEF5]">Email Automation</h1>
        <p className="text-gray-600 dark:text-[#94A3B8] mt-2">AI-powered email campaigns with real-time analytics and behavioral triggers</p>
      </div>

      {/* Info banner linking to Autopilot */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-6">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Looking for fully automated campaigns? Visit{' '}
          <Link to="/app/autopilot" className="font-medium underline hover:text-blue-800 dark:hover:text-blue-200">
            Marketing Autopilot
          </Link>
          {' '}for AI-driven campaign orchestration that runs on its own.
        </p>
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
      <PageHelpModal helpKey="email" />
    </div>
  );
};

export default Email;
