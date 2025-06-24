import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Target, DollarSign, BarChart3, RefreshCw } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import CampaignCard from './CampaignCard';
import CampaignPerformanceDashboard from './CampaignPerformanceDashboard';

const CampaignOverview: React.FC = () => {
  const { campaigns, isLoading, error, reload } = useCampaigns();
  const [selectedCampaignsForComparison, setSelectedCampaignsForComparison] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'campaign-list' | 'performance-dashboard'>('campaign-list');

  const toggleCampaignComparison = (campaignId: string) => {
    setSelectedCampaignsForComparison(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else if (prev.length < 4) {
        return [...prev, campaignId];
      }
      return prev;
    });
  };

  const clearComparisonSelection = () => {
    setSelectedCampaignsForComparison([]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load campaigns: {error}</p>
        <Button onClick={() => reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  const activeCampaigns = campaigns?.filter(c => c.status === 'active') || [];
  const draftCampaigns = campaigns?.filter(c => c.status === 'draft') || [];
  const totalBudget = campaigns?.reduce((sum, campaign) => sum + (campaign.budget_allocated || 0), 0) || 0;
  const totalSpent = campaigns?.reduce((sum, campaign) => sum + (campaign.budget_spent || 0), 0) || 0;

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
          <Button>
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
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <p className="text-xs text-muted-foreground">Audience reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0.00%</div>
            <p className="text-xs text-muted-foreground">Average conversion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">0%</div>
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
              <span className="text-sm font-medium text-blue-900">
                {selectedCampaignsForComparison.length} campaigns selected for comparison
              </span>
              <div className="flex gap-2">
                {selectedCampaignsForComparison.length >= 2 && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Compare Selected
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
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No campaigns found</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Campaign
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'performance-dashboard' && (
        <div>
          <CampaignPerformanceDashboard campaigns={campaigns || []} />
        </div>
      )}
    </div>
  );
};

export default CampaignOverview;