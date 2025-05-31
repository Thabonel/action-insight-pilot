
import React from 'react';
import EmailAIAssistant from '@/components/email/EmailAIAssistant';
import IntelligentCampaignBuilder from '@/components/email/IntelligentCampaignBuilder';
import EmailPerformanceDashboard from '@/components/email/EmailPerformanceDashboard';
import BehavioralAutomation from '@/components/email/BehavioralAutomation';
import EmailWorkflowFeatures from '@/components/email/EmailWorkflowFeatures';

const Email: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Automation</h1>
        <p className="text-gray-600 mt-2">AI-powered email campaigns that learn from behavioral triggers</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Performance Dashboard */}
        <EmailPerformanceDashboard />

        {/* Behavioral Automation */}
        <BehavioralAutomation />
      </div>

      {/* Workflow Features */}
      <EmailWorkflowFeatures />
    </div>
  );
};

export default Email;
