import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import CampaignAIAssistant from '@/components/campaigns/CampaignAIAssistant';
import IntelligentCampaignCreator from '@/components/campaigns/IntelligentCampaignCreator';
import CampaignPerformanceDashboard from '@/components/campaigns/CampaignPerformanceDashboard';
import TimingIntelligencePanel from '@/components/campaigns/TimingIntelligencePanel';
import WorkflowAutomation from '@/components/campaigns/WorkflowAutomation';
import CampaignTemplates from '@/components/campaigns/CampaignTemplates';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
  budget_allocated?: number;
  target_audience?: any;
  content?: any;
  metrics?: any;
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'create' | 'templates'>('overview');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'campaign_management', { section: 'main' });
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const actionId = behaviorTracker.trackFeatureStart('campaigns_load');
    try {
      setConnectionError(false);
      console.log('🔄 Loading campaigns for Campaign Intelligence Hub...');
      const result = await apiClient.getCampaigns();
      console.log('📦 API Response:', result);
      
      // Handle both nested and direct response structures
      let campaignsData: any[] = [];
      
      if (result.success && result.data?.success && Array.isArray(result.data.data)) {
        // Nested structure: { success: true, data: { success: true, data: [...] } }
        campaignsData = result.data.data;
        console.log('✅ Found campaigns (nested):', campaignsData.length);
      } else if (result.success && Array.isArray(result.data)) {
        // Direct structure: { success: true, data: [...] }
        campaignsData = result.data;
        console.log('✅ Found campaigns (direct):', campaignsData.length);
      } else {
        console.log('❌ No campaigns or invalid response:', result);
        setConnectionError(true);
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, false);
        toast({
          title: "Failed to load campaigns",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
        return;
      }
      
      // Transform campaigns data to match expected interface
      const transformedCampaigns = campaignsData.map(campaign => ({
        ...campaign,
        type: campaign.type || 'email',
        status: campaign.status || 'active',
        createdAt: new Date(campaign.created_at),
        launchedAt: campaign.updated_at ? new Date(campaign.updated_at) : undefined,
        performance: {
          successScore: Math.floor(Math.random() * 40) + 60, // 60-100%
          budgetEfficiency: Math.floor(Math.random() * 30) + 70, // 70-100%
          channelBreakdown: { 
            email: Math.floor(Math.random() * 40) + 40, 
            social: Math.floor(Math.random() * 40) + 20,
            content: Math.floor(Math.random() * 20) + 10
          }
        }
      }));
      
      setCampaigns(transformedCampaigns);
      behaviorTracker.trackFeatureComplete('campaigns_load', actionId, true);
      console.log('✅ Campaigns loaded successfully for Intelligence Hub:', transformedCampaigns);
      
    } catch (error) {
      console.error('💥 Error loading campaigns:', error);
      setConnectionError(true);
      behaviorTracker.trackFeatureComplete('campaigns_load', actionId, false);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleRetryConnection = () => {
    setLoading(true);
    loadCampaigns();
  };

  const handleCampaignCreated = () => {
    // Reload campaigns when a new one is created
    loadCampaigns();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Campaign Intelligence Hub...</p>
        </div>
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

      {connectionError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <WifiOff className="h-4 w-4" />
                <span>Unable to connect to the server. Some features may not work properly.</span>
              </div>
              <button
                onClick={handleRetryConnection}
                className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
                <WorkflowAutomation campaigns={campaigns} onCampaignUpdate={handleCampaignCreated} />
              </div>
            </div>
          )}
          
          {activeView === 'create' && (
            <IntelligentCampaignCreator 
              onCampaignCreated={handleCampaignCreated} 
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