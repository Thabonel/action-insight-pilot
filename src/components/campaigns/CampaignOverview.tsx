
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useCampaignCRUD } from '@/hooks/useCampaignCRUD';
import CampaignPerformanceDashboard from './CampaignPerformanceDashboard';
import CampaignCard from './CampaignCard';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign, 
  Calendar,
  BarChart3,
  PlusCircle,
  Activity
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status?: string;
  type?: string;
  budget_allocated?: number;
  metrics?: any;
}

const CampaignOverview: React.FC = () => {
  const { campaigns, isLoading, error, reload } = useCampaigns();
  const { deleteCampaign, archiveCampaign, isLoading: crudLoading } = useCampaignCRUD();
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p>Loading campaign data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-red-600">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Failed to load campaigns</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
            <Button onClick={reload} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics from real campaign data
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active' || !c.status)?.length || 0;
  
  // Calculate total reach and conversion rate from campaign metrics
  const totalReach = campaigns?.reduce((sum, campaign) => {
    const impressions = campaign.metrics?.impressions || 0;
    return sum + impressions;
  }, 0) || 0;

  const totalConversions = campaigns?.reduce((sum, campaign) => {
    const conversions = campaign.metrics?.conversions || 0;
    return sum + conversions;
  }, 0) || 0;

  const conversionRate = totalReach > 0 ? ((totalConversions / totalReach) * 100).toFixed(2) : '0.00';

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    // Navigate to edit page or open edit modal
    navigate(`/app/campaigns/${campaign.id}/edit`);
  };

  const handleDelete = async (campaignId: string) => {
    const result = await deleteCampaign(campaignId);
    if (!result.error) {
      reload();
    }
  };

  const handleArchive = async (campaignId: string) => {
    const result = await archiveCampaign(campaignId);
    if (!result.error) {
      reload();
    }
  };

  const handleViewAnalytics = (campaignId: string) => {
    navigate(`/app/campaigns/${campaignId}/analytics`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Overview</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your marketing campaigns</p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => navigate('/app/campaigns/new')}
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Campaign</span>
        </Button>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{totalCampaigns}</p>
                <p className="text-sm text-gray-500 mt-1">All campaigns</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{activeCampaigns}</p>
                <p className="text-sm text-gray-500 mt-1">Currently running</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reach</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalReach > 0 ? totalReach.toLocaleString() : '--'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Audience reached</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalReach > 0 ? `${conversionRate}%` : '--'}
                </p>
                <p className="text-sm text-gray-500 mt-1">Average conversion</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Cards Grid */}
      {campaigns && campaigns.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onViewAnalytics={handleViewAnalytics}
              />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-6 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Create your first campaign to start tracking performance</p>
              <Button 
                className="flex items-center space-x-2"
                onClick={() => navigate('/app/campaigns/new')}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Campaign</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Dashboard */}
      <CampaignPerformanceDashboard campaigns={campaigns || []} />
    </div>
  );
};

export default CampaignOverview;
