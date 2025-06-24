
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Target, TrendingUp } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import LoadingSpinner from '@/components/LoadingSpinner';

const CampaignOverview: React.FC = () => {
  const { campaigns, isLoading, error, reload } = useCampaigns();
  const [metrics, setMetrics] = useState({
    activeCampaigns: 0,
    totalReach: 0,
    avgConversionRate: 0,
    avgROI: 0,
    recentCampaigns: [] as any[]
  });

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      calculateMetrics();
    }
  }, [campaigns]);

  const calculateMetrics = () => {
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    
    // Calculate total reach from campaign metrics
    const totalReach = campaigns.reduce((sum, campaign) => {
      const reach = campaign.metrics?.sent || campaign.metrics?.impressions || 0;
      return sum + reach;
    }, 0);

    // Calculate average conversion rate
    const campaignsWithConversions = campaigns.filter(c => 
      c.metrics && (c.metrics.sent > 0 || c.metrics.impressions > 0)
    );
    
    const avgConversionRate = campaignsWithConversions.length > 0 
      ? campaignsWithConversions.reduce((sum, campaign) => {
          const conversions = campaign.metrics?.clicked || campaign.metrics?.conversions || 0;
          const total = campaign.metrics?.sent || campaign.metrics?.impressions || 1;
          return sum + (conversions / total);
        }, 0) / campaignsWithConversions.length * 100
      : 0;

    // Calculate average ROI
    const campaignsWithBudget = campaigns.filter(c => c.budget_allocated && c.budget_allocated > 0);
    const avgROI = campaignsWithBudget.length > 0
      ? campaignsWithBudget.reduce((sum, campaign) => {
          const spent = campaign.budget_spent || 0;
          const allocated = campaign.budget_allocated || 1;
          return sum + ((allocated - spent) / allocated * 100);
        }, 0) / campaignsWithBudget.length
      : 0;

    // Get recent campaigns (last 5)
    const recentCampaigns = campaigns
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    setMetrics({
      activeCampaigns,
      totalReach,
      avgConversionRate,
      avgROI,
      recentCampaigns
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading campaign data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading campaign data: {error}</p>
              <button 
                onClick={reload}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.length > 0 ? `of ${campaigns.length} total` : 'No campaigns yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.totalReach)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalReach > 0 ? 'Combined audience reach' : 'No reach data yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgConversionRate > 0 ? 'Across all campaigns' : 'No conversion data yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Budget Efficiency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgROI.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgROI > 0 ? 'Budget utilization' : 'No budget data yet'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No campaigns created yet</p>
                <p className="text-sm mt-2">Create your first campaign to see it here</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Most used channel</p>
                  <p className="text-lg font-bold text-blue-600">
                    {campaigns.reduce((acc, campaign) => {
                      acc[campaign.channel] = (acc[campaign.channel] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)[
                      Object.keys(campaigns.reduce((acc, campaign) => {
                        acc[campaign.channel] = (acc[campaign.channel] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)).reduce((a, b) => 
                        campaigns.reduce((acc, campaign) => {
                          acc[campaign.channel] = (acc[campaign.channel] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)[a] > campaigns.reduce((acc, campaign) => {
                          acc[campaign.channel] = (acc[campaign.channel] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)[b] ? a : b
                      )
                    ] > 0 ? Object.keys(campaigns.reduce((acc, campaign) => {
                      acc[campaign.channel] = (acc[campaign.channel] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)).reduce((a, b) => 
                      campaigns.reduce((acc, campaign) => {
                        acc[campaign.channel] = (acc[campaign.channel] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)[a] > campaigns.reduce((acc, campaign) => {
                        acc[campaign.channel] = (acc[campaign.channel] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)[b] ? a : b
                    ) : 'Email'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Campaign types</p>
                  <p className="text-lg font-bold text-green-600">
                    {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} across {
                      [...new Set(campaigns.map(c => c.type))].length
                    } {[...new Set(campaigns.map(c => c.type))].length === 1 ? 'type' : 'types'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No performance data available</p>
                <p className="text-sm mt-2">Create and run campaigns to see insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CampaignOverview;
