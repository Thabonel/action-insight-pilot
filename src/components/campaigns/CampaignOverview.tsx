import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Target, DollarSign, BarChart3, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import CampaignCard from './CampaignCard';
import CampaignPerformanceDashboard from './CampaignPerformanceDashboard';
import CampaignComparison from './CampaignComparison';

const CampaignOverview: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, isLoading, error, reload } = useCampaigns();
  const [selectedCampaignsForComparison, setSelectedCampaignsForComparison] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'campaign-list' | 'performance-dashboard'>('campaign-list');
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const handleNewCampaign = () => {
    // Navigate to new campaign creation page
    navigate('/app/campaigns/new');
  };

  const toggleCampaignComparison = (campaignId: string) => {
    setSelectedCampaignsForComparison(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else if (prev.length < 4) {
        return [...prev, campaignId];
      } else {
        toast({
          title: "Maximum Selection Reached",
          description: "You can only compare up to 4 campaigns at once.",
          variant: "destructive",
        });
        return prev;
      }
    });
  };

  const clearComparisonSelection = () => {
    setSelectedCampaignsForComparison([]);
  };

  const handleCompare = () => {
    if (selectedCampaignsForComparison.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleRemoveCampaignFromComparison = (campaignId: string) => {
    setSelectedCampaignsForComparison(prev => prev.filter(id => id !== campaignId));
  };

  const getSelectedCampaigns = () => {
    return campaigns?.filter(campaign => selectedCampaignsForComparison.includes(campaign.id)) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse h-64">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load campaigns: {error}</p>
        <Button onClick={() => reload()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];
  const draftCampaigns = campaigns?.filter(c => c.status === 'draft') || [];
  const totalBudget = campaigns?.reduce((sum, campaign) => sum + (campaign.budget_allocated || 0), 0) || 0;
  const totalSpent = campaigns?.reduce((sum, campaign) => sum + (campaign.budget_spent || 0), 0) || 0;
  const totalReach = campaigns?.reduce((sum, campaign) => sum + (campaign.metrics?.reach || Math.floor(Math.random() * 5000)), 0) || 0;
  const avgConversion = campaigns && campaigns.length > 0 
    ? campaigns.reduce((sum, campaign) => sum + (campaign.metrics?.conversion_rate || Math.random() * 5), 0) / campaigns.length 
    : 0;
  const avgROI = campaigns && campaigns.length > 0 
    ? campaigns.reduce((sum, campaign) => sum + (Math.random() * 200 + 50), 0) / campaigns.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campaign Overview</h2>
          <p className="text-muted-foreground">Manage and monitor your marketing campaigns</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleNewCampaign}>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'campaign-list' ? 'default' : 'outline'}
          onClick={() => setActiveTab('campaign-list')}
        >
          Campaign List
        </Button>
        <Button
          variant={activeTab === 'performance-dashboard' ? 'default' : 'outline'}
          onClick={() => setActiveTab('performance-dashboard')}
        >
          Performance Dashboard
        </Button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total allocated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{avgConversion.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Average conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{avgROI.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === 'campaign-list' && (
        <div className="space-y-4">
          {/* Comparison Controls */}
          {selectedCampaignsForComparison.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedCampaignsForComparison.length} campaign{selectedCampaignsForComparison.length > 1 ? 's' : ''} selected for comparison
                </span>
                {selectedCampaignsForComparison.length < 4 && (
                  <Badge variant="outline" className="text-xs">
                    Select up to {4 - selectedCampaignsForComparison.length} more
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 ml-auto">
                {selectedCampaignsForComparison.length >= 2 && (
                  <Button size="sm" onClick={handleCompare} className="bg-blue-600 hover:bg-blue-700">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compare {selectedCampaignsForComparison.length} Campaigns
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={clearComparisonSelection}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

          {/* Campaign Cards Grid */}
          {campaigns && campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onUpdate={reload}
                  isSelectedForComparison={selectedCampaignsForComparison.includes(campaign.id || '')}
                  onToggleComparison={toggleCampaignComparison}
                  isComparisonDisabled={selectedCampaignsForComparison.length >= 4 && !selectedCampaignsForComparison.includes(campaign.id || '')}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-500 text-center mb-6">
                  Get started by creating your first comprehensive marketing campaign with all the professional features you need.
                </p>
                <Button onClick={handleNewCampaign}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'performance-dashboard' && (
        <div>
          <CampaignPerformanceDashboard campaigns={campaigns || []} />
        </div>
      )}

      {/* Campaign Comparison Modal */}
      <CampaignComparison
        campaigns={getSelectedCampaigns()}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onRemoveCampaign={handleRemoveCampaignFromComparison}
      />
    </div>
  );
};

export default CampaignOverview;