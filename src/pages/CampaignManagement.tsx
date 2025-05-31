
import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
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

const CampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'create' | 'templates'>('overview');

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'campaign_management', { section: 'main' });
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const actionId = behaviorTracker.trackFeatureStart('campaigns_load');
    try {
      const result = await apiClient.getCampaigns();
      if (result.success) {
        setCampaigns((result.data as Campaign[]) || []);
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, true);
      } else {
        console.error('Failed to load campaigns:', result.error);
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, false);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      behaviorTracker.trackFeatureComplete('campaigns_load', actionId, false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('create')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'create' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveView('templates')}
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
                <WorkflowAutomation campaigns={campaigns} onCampaignUpdate={loadCampaigns} />
              </div>
            </div>
          )}
          
          {activeView === 'create' && (
            <IntelligentCampaignCreator onCampaignCreated={loadCampaigns} />
          )}
          
          {activeView === 'templates' && (
            <CampaignTemplates onTemplateSelect={(template) => {
              setActiveView('create');
              // Template selection logic would go here
            }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignManagement;
