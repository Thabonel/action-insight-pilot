
import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useCampaigns } from '@/hooks/useCampaigns';
import CampaignAIAssistant from '@/components/campaigns/CampaignAIAssistant';
import IntelligentCampaignCreator from '@/components/campaigns/IntelligentCampaignCreator';
import CampaignPerformanceDashboard from '@/components/campaigns/CampaignPerformanceDashboard';
import TimingIntelligencePanel from '@/components/campaigns/TimingIntelligencePanel';
import WorkflowAutomation from '@/components/campaigns/WorkflowAutomation';
import CampaignTemplates from '@/components/campaigns/CampaignTemplates';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  createdAt: Date;
  launchedAt?: Date;
  performance: {
    successScore: number;
    budgetEfficiency: number;
    channelBreakdown: Record<string, number>;
  };
}

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  successRate: number;
  avgTime: string;
  icon: any;
  color: string;
  difficulty: 'Quick' | 'Detailed';
  bestFor: string[];
  templateData: {
    name: string;
    type: string;
    description: string;
    budget?: string;
    targetAudience?: string;
    timeline?: string;
  };
}

const CampaignManagement: React.FC = () => {
  const { campaigns: campaignsData, isLoading, error, reload } = useCampaigns();
  const [activeView, setActiveView] = useState<'overview' | 'create' | 'templates'>('overview');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Transform the campaigns data to match the expected interface
  const campaigns = campaignsData.map(campaign => ({
    ...campaign,
    type: 'email', // Default type since it's not in the database
    status: 'active', // Default status
    createdAt: new Date(campaign.created_at),
    performance: {
      successScore: 75, // Mock data
      budgetEfficiency: 80,
      channelBreakdown: { email: 60, social: 40 }
    }
  }));

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'campaign_management', { section: 'main' });
  }, []);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setActiveView('create');
  };

  const handleViewChange = (view: 'overview' | 'create' | 'templates') => {
    if (view !== 'create') {
      setSelectedTemplate(null);
    }
    setActiveView(view);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaign Intelligence Hub</h1>
          <p className="mt-2 text-slate-600">AI-powered campaign management with timing insights</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewChange('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleViewChange('create')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'create' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => handleViewChange('templates')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'templates' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Templates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CampaignAIAssistant />
        </div>
        
        <div className="lg:col-span-3">
          {activeView === 'overview' && (
            <div className="space-y-6">
              <CampaignPerformanceDashboard campaigns={campaigns} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TimingIntelligencePanel />
                <WorkflowAutomation campaigns={campaigns} onCampaignUpdate={reload} />
              </div>
            </div>
          )}
          
          {activeView === 'create' && (
            <IntelligentCampaignCreator 
              onCampaignCreated={reload} 
              selectedTemplate={selectedTemplate}
            />
          )}
          
          {activeView === 'templates' && (
            <CampaignTemplates onTemplateSelect={handleTemplateSelect} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignManagement;
