
import React, { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useCampaignCRUD } from '@/hooks/useCampaignCRUD';
import CampaignCard from './CampaignCard';
import CampaignPerformanceDashboard from './CampaignPerformanceDashboard';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived';
  type?: 'social_media' | 'email' | 'content' | 'paid_ads' | 'seo' | 'other';
  budget_allocated?: number;
  budget_spent?: number;
  metrics?: any;
  channel: string;
  created_by: string;
  start_date?: string;
  end_date?: string;
  target_audience?: any;
  content?: any;
  settings?: any;
}

const CampaignOverview: React.FC = () => {
  const { campaigns, isLoading, error, reload } = useCampaigns();
  const { deleteCampaign, archiveCampaign, isLoading: isCrudLoading } = useCampaignCRUD();
  const [view, setView] = useState<'list' | 'dashboard'>('list');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEdit = (campaign: Campaign) => {
    console.log('Edit campaign:', campaign);
    // Navigate to edit page for the specific campaign
    navigate(`/app/campaigns/${campaign.id}/edit`);
  };

  const handleDelete = async (campaignId: string) => {
    try {
      const result = await deleteCampaign(campaignId);
      if (!result.error) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        });
        reload(); // Refresh the campaign list
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (campaignId: string) => {
    try {
      const result = await archiveCampaign(campaignId);
      if (!result.error) {
        toast({
          title: "Success",
          description: "Campaign archived successfully",
        });
        reload(); // Refresh the campaign list
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to archive campaign",
        variant: "destructive",
      });
    }
  };

  const handleViewAnalytics = (campaignId: string) => {
    console.log('View analytics for campaign:', campaignId);
    // Navigate to analytics page for the specific campaign
    navigate(`/app/campaigns/${campaignId}/analytics`);
  };

  // Calculate metrics from real campaign data
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget_allocated || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.budget_spent || 0), 0);

  // Calculate metrics from campaign data
  const totalReach = campaigns.reduce((sum, campaign) => {
    const reach = campaign.metrics?.impressions || campaign.metrics?.reach || 0;
    return sum + reach;
  }, 0);

  const totalConversions = campaigns.reduce((sum, campaign) => {
    return sum + (campaign.metrics?.conversions || 0);
  }, 0);

  const conversionRate = totalReach > 0 ? ((totalConversions / totalReach) * 100).toFixed(2) : '0.00';

  // Calculate ROI metrics
  const totalROI = totalSpent > 0 ? (((totalConversions * 100) - totalSpent) / totalSpent * 100).toFixed(1) : '0';

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-600 mb-4">Error loading campaigns: {error}</p>
        <Button onClick={reload} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Campaign Overview</h2>
          <p className="text-slate-600">Manage and monitor your marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reload} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate('/app/campaigns/create')}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={view === 'list' ? 'default' : 'outline'}
          onClick={() => setView('list')}
        >
          Campaign List
        </Button>
        <Button 
          variant={view === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setView('dashboard')}
        >
          Performance Dashboard
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Total Campaigns</h3>
          <p className="text-2xl font-bold text-slate-900">{totalCampaigns}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Active Campaigns</h3>
          <p className="text-2xl font-bold text-green-600">{activeCampaigns}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Total Reach</h3>
          <p className="text-2xl font-bold text-blue-600">{totalReach.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Conversion Rate</h3>
          <p className="text-2xl font-bold text-purple-600">{conversionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-slate-600">Overall ROI</h3>
          <p className="text-2xl font-bold text-orange-600">{totalROI}%</p>
        </div>
      </div>

      {/* Campaign Performance Dashboard - Always show above campaign cards */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaign Performance Analytics</h3>
          <CampaignPerformanceDashboard campaigns={campaigns} />
        </div>
      )}

      {/* Content based on view */}
      {view === 'list' ? (
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No campaigns found. Create your first campaign to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  onViewAnalytics={handleViewAnalytics}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Performance Analytics</h3>
          <CampaignPerformanceDashboard campaigns={campaigns} />
        </div>
      )}
    </div>
  );
};

export default CampaignOverview;
