
import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import CampaignForm from '@/components/CampaignForm';
import CampaignCard from '@/components/CampaignCard';
import EmptyState from '@/components/EmptyState';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    status: 'draft',
    description: ''
  });
  const { toast } = useToast();

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
      
      if (result.success) {
        setCampaigns((result.data as Campaign[]) || []);
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, true);
        toast({
          title: "Campaigns loaded",
          description: `Found ${(result.data as Campaign[])?.length || 0} campaigns`,
        });
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
      console.log('Creating campaign:', newCampaign);
      const result = await apiClient.createCampaign(newCampaign);
      
      if (result.success) {
        setCampaigns(prev => [result.data as Campaign, ...prev]);
        setNewCampaign({ name: '', type: 'email', status: 'draft', description: '' });
        setShowCreateForm(false);
        setConnectionError(false);
        behaviorTracker.trackFeatureComplete('campaign_create', actionId, true);
        toast({
          title: "Success!",
          description: `Campaign "${(result.data as Campaign).name}" created successfully`,
        });
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
          <h1 className="text-3xl font-bold text-slate-900">Campaign Management</h1>
          <p className="mt-2 text-slate-600">Create and manage your marketing campaigns</p>
        </div>
        <button
          onClick={handleShowCreateForm}
          disabled={creating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {creating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>{creating ? 'Creating...' : 'Create Campaign'}</span>
        </button>
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
          <EmptyState onCreateCampaign={handleShowCreateForm} />
        ) : (
          campaigns.map((campaign) => (
            <CampaignCard key={campaign.id || Math.random()} campaign={campaign} />
          ))
        )}
      </div>
    </div>
  );
};

export default Campaigns;
