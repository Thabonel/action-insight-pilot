
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, DollarSignIcon, TargetIcon, TrendingUpIcon } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Campaign } from '@/lib/api-client-interface';

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const result = await apiClient.getCampaignById(id);
        
        if (result.success && result.data) {
          setCampaign(result.data);
        } else {
          setError(result.error || 'Failed to fetch campaign');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const updateCampaignStatus = async (newStatus: Campaign['status']) => {
    if (!campaign) return;

    try {
      const result = await apiClient.updateCampaign(campaign.id, {
        status: newStatus
      });

      if (result.success && result.data) {
        setCampaign(result.data);
      }
    } catch (err) {
      console.error('Failed to update campaign status:', err);
    }
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600">{error || 'The campaign you\'re looking for doesn\'t exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <p className="text-gray-600 mt-1">{campaign.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
              {campaign.status === 'active' && (
                <Button
                  variant="outline"
                  onClick={() => updateCampaignStatus('paused')}
                >
                  Pause Campaign
                </Button>
              )}
              {campaign.status === 'paused' && (
                <Button
                  onClick={() => updateCampaignStatus('active')}
                >
                  Resume Campaign
                </Button>
              )}
              {(campaign.status === 'completed' || campaign.status === 'paused') && (
                <Button
                  variant="outline"
                  onClick={() => updateCampaignStatus('archived')}
                >
                  Archive
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-semibold">{new Date(campaign.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSignIcon className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-semibold">$0</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TargetIcon className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold">{campaign.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUpIcon className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="font-semibold">Good</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1 rounded-lg shadow">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Campaign Name</label>
                      <p className="mt-1 text-gray-900">{campaign.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-gray-900">{campaign.description || 'No description provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Type</label>
                      <p className="mt-1 text-gray-900">{campaign.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <Badge className={`mt-1 ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reach</span>
                      <span className="font-semibold">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engagement Rate</span>
                      <span className="font-semibold">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate</span>
                      <span className="font-semibold">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI</span>
                      <span className="font-semibold">0%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Performance data will be displayed here once the campaign is active.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Campaign content and assets will be managed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Campaign configuration and settings will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CampaignDetails;

