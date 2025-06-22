
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient, type Campaign, type CreateCampaignData } from '@/lib/api-client';
import CampaignCard from '@/components/CampaignCard';
import CampaignCreationModal from '@/components/CampaignCreationModal';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface NewCampaign {
  name: string;
  type: string;
  description: string;
  budget: string;
  targetAudience: string;
  timeline: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCampaigns();
      if (response.success && Array.isArray(response.data)) {
        setCampaigns(response.data);
      } else {
        console.warn('Campaigns response data is not an array:', response.data);
        setCampaigns([]);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(campaign => !campaign.is_archived);
    } else if (statusFilter === 'archived') {
      filtered = filtered.filter(campaign => campaign.is_archived);
    }

    setFilteredCampaigns(filtered);
  };

  const handleCreateCampaign = async (newCampaign: NewCampaign) => {
    const actionId = behaviorTracker.trackFeatureStart('campaign_creation');
    try {
      // Convert NewCampaign to CreateCampaignData by adding required fields
      const campaignData: CreateCampaignData = {
        ...newCampaign,
        channel: 'multi-channel', // Default channel
        status: 'active' // Default status
      };
      
      const response = await apiClient.createCampaign(campaignData);
      if (response.success) {
        toast({
          title: "Campaign Created",
          description: `Campaign "${newCampaign.name}" has been created successfully.`,
        });
        behaviorTracker.trackFeatureComplete('campaign_creation', actionId, true);
        setIsCreateModalOpen(false);
        await loadCampaigns();
      } else {
        throw new Error(response.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      behaviorTracker.trackFeatureComplete('campaign_creation', actionId, false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const handleCampaignAction = async (campaignId: string, action: 'delete' | 'archive' | 'restore') => {
    try {
      let response;
      let successMessage = '';

      switch (action) {
        case 'delete':
          response = await apiClient.deleteCampaign(campaignId);
          successMessage = 'Campaign deleted successfully';
          break;
        case 'archive':
          response = await apiClient.archiveCampaign(campaignId);
          successMessage = 'Campaign archived successfully';
          break;
        case 'restore':
          response = await apiClient.restoreCampaign(campaignId);
          successMessage = 'Campaign restored successfully';
          break;
      }

      if (response?.success) {
        toast({
          title: "Success",
          description: successMessage,
        });
        await loadCampaigns();
      } else {
        throw new Error(response?.error || `Failed to ${action} campaign`);
      }
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      behaviorTracker.trackFeatureComplete('campaign_management', Date.now(), false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} campaign`,
        variant: "destructive",
      });
    }
  };

  const getActiveCampaignsCount = () => {
    return campaigns.filter(campaign => !campaign.is_archived).length;
  };

  const getArchivedCampaignsCount = () => {
    return campaigns.filter(campaign => campaign.is_archived).length;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading campaigns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600 mt-2">Create, manage, and track your marketing campaigns</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'archived') => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns ({campaigns.length})</SelectItem>
            <SelectItem value="active">Active ({getActiveCampaignsCount()})</SelectItem>
            <SelectItem value="archived">Archived ({getArchivedCampaignsCount()})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 mb-6">
        <Badge variant="outline" className="px-3 py-1">
          Total: {campaigns.length}
        </Badge>
        <Badge variant="default" className="px-3 py-1 bg-green-100 text-green-800 border-green-200">
          Active: {getActiveCampaignsCount()}
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          Archived: {getArchivedCampaignsCount()}
        </Badge>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {campaigns.length === 0 ? 'No campaigns found' : 'No campaigns match your search criteria'}
          </div>
          {campaigns.length === 0 && (
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onAction={handleCampaignAction}
            />
          ))}
        </div>
      )}

      <CampaignCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />
    </div>
  );
};

export default Campaigns;
