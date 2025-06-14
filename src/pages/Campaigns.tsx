
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import CampaignForm from '@/components/CampaignForm';
import CampaignCard from '@/components/CampaignCard';
import EmptyState from '@/components/EmptyState';
import ServerStatusIndicator from '@/components/ServerStatusIndicator';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
}

type ServerStatus = 'sleeping' | 'waking' | 'awake' | 'error';

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('sleeping');
  const [serverError, setServerError] = useState<string>('');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    status: 'draft',
    description: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'campaigns', { section: 'main' });
    loadCampaigns();
  }, []);

  const wakeUpServer = async () => {
    setServerStatus('waking');
    setServerError('');
    
    try {
      const result = await apiClient.httpClient.wakeUpServer();
      if (result.success) {
        setServerStatus('awake');
        toast({
          title: "Server Ready",
          description: "Backend server is now active and ready to use.",
        });
      } else {
        setServerStatus('error');
        setServerError(result.error || 'Failed to wake up server');
        toast({
          title: "Wake Up Failed",
          description: result.error || "Failed to wake up the server",
          variant: "destructive",
        });
      }
    } catch (error) {
      setServerStatus('error');
      setServerError('Unexpected error during server wake-up');
      toast({
        title: "Wake Up Error",
        description: "An unexpected error occurred while waking up the server",
        variant: "destructive",
      });
    }
  };

  const loadCampaigns = async () => {
    const actionId = behaviorTracker.trackFeatureStart('campaigns_load');
    try {
      setConnectionError(false);
      console.log('Loading campaigns...');
      const result = await apiClient.getCampaigns();
      
      if (result.success && result.data) {
        const campaignsData = Array.isArray(result.data) ? result.data : [];
        setCampaigns(campaignsData);
        setServerStatus('awake');
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, true);
        console.log('Campaigns loaded successfully:', campaignsData);
      } else {
        console.error('Failed to load campaigns:', result.error);
        setConnectionError(true);
        setServerStatus('sleeping');
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
      setServerStatus('sleeping');
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
      // First, wake up the server if it's sleeping
      if (serverStatus === 'sleeping') {
        console.log('Server is sleeping, waking it up first...');
        setServerStatus('waking');
        
        toast({
          title: "Preparing Server",
          description: "Waking up the backend server, this may take up to 60 seconds...",
        });

        const wakeUpResult = await apiClient.httpClient.wakeUpServer();
        if (!wakeUpResult.success) {
          setServerStatus('error');
          setServerError(wakeUpResult.error || 'Failed to wake up server');
          throw new Error(wakeUpResult.error || 'Failed to wake up server');
        }
        
        setServerStatus('awake');
        toast({
          title: "Server Ready",
          description: "Now creating your campaign...",
        });
      }

      console.log('Creating campaign with data:', newCampaign);
      const result = await apiClient.createCampaign(newCampaign);
      
      if (result.success && result.data) {
        const createdCampaign = result.data as Campaign;
        console.log('Campaign created successfully:', createdCampaign);
        
        // Update local state
        setCampaigns(prev => [createdCampaign, ...prev]);
        
        // Reset form
        setNewCampaign({ name: '', type: 'email', status: 'draft', description: '' });
        setShowCreateForm(false);
        setConnectionError(false);
        
        behaviorTracker.trackFeatureComplete('campaign_create', actionId, true);
        
        toast({
          title: "Success!",
          description: `Campaign "${createdCampaign.name}" created successfully`,
        });
        
        // Navigate to campaign details - ensure we have a valid ID
        if (createdCampaign.id) {
          navigate(`/campaigns/${createdCampaign.id}`);
        } else {
          console.error('Campaign created but no ID returned');
          toast({
            title: "Warning",
            description: "Campaign created but navigation failed. Please refresh the page.",
            variant: "destructive",
          });
        }
        
      } else {
        console.error('Failed to create campaign:', result.error);
        setServerStatus('error');
        setServerError(result.error || 'Unknown error occurred');
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
      setServerStatus('error');
      setServerError(error instanceof Error ? error.message : 'Unknown error');
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

      {/* Server Status Indicator */}
      {(serverStatus === 'sleeping' || serverStatus === 'waking' || serverStatus === 'error') && (
        <ServerStatusIndicator
          status={serverStatus}
          onWakeUp={wakeUpServer}
          errorMessage={serverError}
        />
      )}

      {connectionError && serverStatus !== 'sleeping' && (
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
