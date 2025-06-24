
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/useCampaigns';
import CampaignPerformanceDashboard from './CampaignPerformanceDashboard';
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

const CampaignOverview: React.FC = () => {
  const { campaigns, loading, error, refetch } = useCampaigns();

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
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
            <Button onClick={refetch} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate basic metrics from available campaign data
  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = totalCampaigns; // All campaigns are considered active for now
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Overview</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your marketing campaigns</p>
        </div>
        <Button className="flex items-center space-x-2">
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
                <p className="text-3xl font-bold text-gray-900">--</p>
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
                <p className="text-3xl font-bold text-gray-900">--</p>
                <p className="text-sm text-gray-500 mt-1">Average conversion</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Dashboard */}
      <CampaignPerformanceDashboard campaigns={campaigns || []} />

      {campaigns && campaigns.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto mb-6 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Create your first campaign to start tracking performance</p>
              <Button className="flex items-center space-x-2">
                <PlusCircle className="h-4 w-4" />
                <span>Create Campaign</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignOverview;
