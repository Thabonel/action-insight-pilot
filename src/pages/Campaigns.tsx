
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient, Campaign } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import CampaignForm from '@/components/CampaignForm';
import CampaignCard from '@/components/CampaignCard';
import EmptyState from '@/components/EmptyState';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NewCampaign {
  name: string;
  type: string;
  status: string;
  description: string;
}

type CampaignFilter = 'all' | 'active' | 'archived';

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<CampaignFilter>('active');
  const [newCampaign, setNewCampaign] = useState<NewCampaign>({
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
        
        // Add to campaigns list optimistically
        setCampaigns(prev => [createdCampaign, ...prev]);
        
        // Reset form and hide create form
        setNewCampaign({ name: '', type: 'email', status: 'draft', description: '' });
        setShowCreateForm(false);
        setConnectionError(false);
        
        behaviorTracker.trackFeatureComplete('campaign_create', actionId, true);
        
        toast({
          title: "Success!",
          description: `Campaign "${createdCampaign.name}" created successfully`,
        });
        
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

  const handleCampaignUpdate = (updatedCampaign: Campaign) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === updatedCampaign.id ? updatedCampaign : campaign
      )
    );
  };

  const handleCampaignDelete = (campaignId: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
  };

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    behaviorTracker.trackAction('planning', 'campaigns', { action: 'show_create_form' });
  };

  const handleRetryConnection = () => {
    setLoading(true);
    loadCampaigns();
  };

  const handleFilterChange = (filter: CampaignFilter) => {
    setActiveFilter(filter);
    behaviorTracker.trackAction('filter', 'campaigns', { filter });
  };

  const getFilteredCampaigns = () => {
    switch (activeFilter) {
      case 'active':
        return campaigns.filter(campaign => campaign.status !== 'archived');
      case 'archived':
        return campaigns.filter(campaign => campaign.status === 'archived');
      case 'all':
      default:
        return campaigns;
    }
  };

  const filteredCampaigns = getFilteredCampaigns();
  const activeCount = campaigns.filter(c => c.status !== 'archived').length;
  const archivedCount = campaigns.filter(c => c.status === 'archived').length;

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

      <Tabs value={activeFilter} onValueChange={(value) => handleFilterChange(value as CampaignFilter)}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active">
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({archivedCount})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({campaigns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.length === 0 ? (
              <div className="col-span-full">
                {activeFilter === 'active' && campaigns.length === 0 ? (
                  <EmptyState onCreateCampaign={handleShowCreateForm} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      No {activeFilter === 'all' ? '' : activeFilter} campaigns found.
                    </p>
                    {activeFilter === 'active' && archivedCount > 0 && (
                      <p className="text-gray-400 text-sm mt-2">
                        You have {archivedCount} archived campaign{archivedCount !== 1 ? 's' : ''}.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              filteredCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id || `campaign-${Math.random()}`} 
                  campaign={campaign}
                  onCampaignUpdate={handleCampaignUpdate}
                  onCampaignDelete={handleCampaignDelete}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Campaigns;
