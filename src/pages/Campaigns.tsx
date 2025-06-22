import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient, Campaign } from '@/lib/api-client';
import CampaignCard from '@/components/CampaignCard';
import CampaignCreationModal from '@/components/CampaignCreationModal';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface FilterOption {
  label: string;
  value: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const filterOptions: FilterOption[] = [
    { label: 'All', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ];

  useEffect(() => {
    loadCampaigns();
    behaviorTracker.trackAction('navigation', 'campaigns', { section: 'main' });
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getCampaigns();
      if (response.success) {
        setCampaigns(response.data);
      } else {
        throw new Error(response.error || 'Failed to load campaigns');
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load campaigns",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const searchRegex = new RegExp(searchTerm, 'i');
    const matchesSearch = searchRegex.test(campaign.name) || searchRegex.test(campaign.description);
    const matchesFilter = filter ? campaign.status === filter : true;
    return matchesSearch && matchesFilter;
  });

  const handleCreateCampaign = async (campaignData: any) => {
    try {
      const response = await apiClient.createCampaign(campaignData);
      if (response.success) {
        toast({
          title: "Campaign Created",
          description: `Campaign "${campaignData.name}" created successfully.`
        });
        setIsModalOpen(false);
        await loadCampaigns();
      } else {
        throw new Error(response.error || 'Failed to create campaign');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create campaign",
        variant: "destructive"
      });
    }
  };

  const handleCampaignUpdate = async (updatedCampaign: Campaign) => {
    try {
      const response = await apiClient.updateCampaign(updatedCampaign.id, updatedCampaign);
      if (response.success) {
        toast({
          title: "Campaign Updated",
          description: `Campaign "${updatedCampaign.name}" updated successfully.`
        });
        await loadCampaigns();
      } else {
        throw new Error(response.error || 'Failed to update campaign');
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update campaign",
        variant: "destructive"
      });
    }
  };

  const handleCampaignDelete = async (campaignId: string) => {
    try {
      const response = await apiClient.deleteCampaign(campaignId);
      if (response.success) {
        toast({
          title: "Campaign Deleted",
          description: "Campaign deleted successfully."
        });
        await loadCampaigns();
      } else {
        throw new Error(response.error || 'Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete campaign",
        variant: "destructive"
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
          description: successMessage
        });
        await loadCampaigns();
      } else {
        throw new Error(response?.error || `Failed to ${action} campaign`);
      }
    } catch (error) {
      console.error(`Error ${action}ing campaign:`, error);
      behaviorTracker.trackFeatureComplete('campaign_management', Date.now().toString(), false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} campaign`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="mr-4"
          />
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onCampaignUpdate={handleCampaignUpdate}
              onCampaignDelete={handleCampaignDelete}
              onAction={handleCampaignAction}
            />
          ))}
        </div>
      )}

      <CampaignCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />
    </div>
  );
};

export default Campaigns;
