
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import CampaignForm from '@/components/CampaignForm';
import CampaignCard from '@/components/CampaignCard';
import EmptyState from '@/components/EmptyState';
import BrandAmbassador from '@/components/campaigns/BrandAmbassador';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Campaign } from '@/lib/api-client-interface';

const CampaignManagement: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'create' | 'templates' | 'brand-ambassador'>('overview');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    status: 'draft' as Campaign['status'],
    description: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'campaigns', { section: 'main' });
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const actionId = behaviorTracker.trackFeatureStart('campaigns_load');
    try {
      setConnectionError(false);
      console.log('Loading campaigns...');
      const result = await apiClient.getCampaigns();
      
      if (result.success && result.data) {
        const campaignsData = Array.isArray(result.data) ? result.data : [];
        setCampaigns(campaignsData);
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, true);
        console.log('Campaigns loaded successfully:', campaignsData);
      } else {
        console.error('Failed to load campaigns:', result.error);
        setConnectionError(true);
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, false);
        toast({
          title: "Failed to load campaigns",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
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

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCampaign.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Campaign name is required",
        variant: "destructive",
      });
      return;
    }

    const actionId = behaviorTracker.trackFeatureStart('campaign_create');
    setCreating(true);
    
    try {
      console.log('Creating campaign with data:', newCampaign);
      const result = await apiClient.createCampaign(newCampaign);
      
      if (result.success && result.data) {
        const createdCampaign = result.data as Campaign;
        console.log('Campaign created successfully:', createdCampaign);
        
        // Reset form and hide create form
        setNewCampaign({ name: '', type: 'email', status: 'draft', description: '' });
        setShowCreateForm(false);
        setConnectionError(false);
        
        behaviorTracker.trackFeatureComplete('campaign_create', actionId, true);
        
        toast({
          title: "Success!",
          description: `Campaign "${createdCampaign.name}" created successfully`,
        });
        
        // Reload the campaigns list to show the new campaign
        await loadCampaigns();
        
        // Navigate to campaign details if we have a valid ID
        if (createdCampaign.id) {
          navigate(`/campaigns/${createdCampaign.id}`);
        }
        
      } else {
        console.error('Failed to create campaign:', result.error);
        behaviorTracker.trackFeatureComplete('campaign_create', actionId, false);
        toast({
          title: "Failed to create campaign",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setConnectionError(true);
      behaviorTracker.trackFeatureComplete('campaign_create', actionId, false);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. The campaign could not be created.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    behaviorTracker.trackAction('planning', 'campaigns', { action: 'show_create_form' });
  };

  const handleRetryConnection = () => {
    setLoading(true);
    loadCampaigns();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaign Intelligence Hub</h1>
          <p className="mt-2 text-slate-600">Create, manage, and optimize your marketing campaigns</p>
        </div>
        {activeView === 'overview' && (
          <button
            onClick={handleShowCreateForm}
            disabled={creating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {creating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{creating ? 'Creating...' : 'Create Campaign'}</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveView('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveView('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveView('brand-ambassador')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeView === 'brand-ambassador'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Brand Ambassador
          </button>
        </nav>
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

      {/* Render content based on active view */}
      {activeView === 'overview' && (
        <>
          {showCreateForm && (
            <CampaignForm
              newCampaign={newCampaign}
              setNewCampaign={setNewCampaign}
              onSubmit={handleCreateCampaign}
              onCancel={() => setShowCreateForm(false)}
              loading={creating}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.length === 0 ? (
              <div className="col-span-full">
                <EmptyState onCreateCampaign={handleShowCreateForm} />
              </div>
            ) : (
              campaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id || `campaign-${Math.random()}`} 
                  campaign={campaign} 
                />
              ))
            )}
          </div>
        </>
      )}

      {activeView === 'create' && (
        <div className="max-w-2xl mx-auto">
          <CampaignForm
            newCampaign={newCampaign}
            setNewCampaign={setNewCampaign}
            onSubmit={handleCreateCampaign}
            onCancel={() => setActiveView('overview')}
            loading={creating}
          />
        </div>
      )}

      {activeView === 'templates' && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Templates</h3>
          <p className="text-gray-600">Template library coming soon...</p>
        </div>
      )}

      {activeView === 'brand-ambassador' && (
        <BrandAmbassador />
      )}
    </div>
  );
};

export default CampaignManagement;
