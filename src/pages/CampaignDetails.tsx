
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  createdAt?: Date;
  launchedAt?: Date;
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'email',
    status: 'draft'
  });

  useEffect(() => {
    // Guard against undefined or empty ID
    if (!id || id.trim() === '') {
      setError('Invalid campaign ID provided');
      setLoading(false);
      return;
    }

    behaviorTracker.trackAction('navigation', 'campaign_details', { campaignId: id });
    loadCampaign(id);
  }, [id]);

  const loadCampaign = async (campaignId: string) => {
    // Additional guard check
    if (!campaignId || campaignId.trim() === '') {
      setError('Cannot load campaign: Invalid ID');
      return;
    }

    const actionId = behaviorTracker.trackFeatureStart('campaign_load_details');
    setLoading(true);
    
    try {
      setError(null);
      console.log('Loading campaign details for ID:', campaignId);
      const result = await apiClient.getCampaignById(campaignId);
      
      if (result.success && result.data) {
        const campaignData = result.data as Campaign;
        console.log('Campaign loaded successfully:', campaignData);
        setCampaign(campaignData);
        setFormData({
          name: campaignData.name || '',
          description: campaignData.description || '',
          type: campaignData.type || 'email',
          status: campaignData.status || 'draft'
        });
        behaviorTracker.trackFeatureComplete('campaign_load_details', actionId, true);
      } else {
        const errorMessage = result.error || "Campaign not found";
        console.error('Failed to load campaign:', errorMessage);
        setError(errorMessage);
        behaviorTracker.trackFeatureComplete('campaign_load_details', actionId, false);
        toast({
          title: "Failed to load campaign",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load campaign details';
      console.error('Error loading campaign:', error);
      setError(errorMessage);
      behaviorTracker.trackFeatureComplete('campaign_load_details', actionId, false);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Campaign name is required",
        variant: "destructive",
      });
      return;
    }

    const actionId = behaviorTracker.trackFeatureStart('campaign_update');
    setSaving(true);

    try {
      console.log('Updating campaign with data:', formData);
      const result = await apiClient.updateCampaign(id, formData);
      
      if (result.success) {
        behaviorTracker.trackFeatureComplete('campaign_update', actionId, true);
        toast({
          title: "Success!",
          description: "Campaign updated successfully",
        });
        // Reload campaign data to reflect changes
        await loadCampaign(id);
      } else {
        console.error('Failed to update campaign:', result.error);
        behaviorTracker.trackFeatureComplete('campaign_update', actionId, false);
        toast({
          title: "Failed to update campaign",
          description: result.error || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
      behaviorTracker.trackFeatureComplete('campaign_update', actionId, false);
      toast({
        title: "Error",
        description: "Failed to save campaign changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackToCampaigns = () => {
    navigate('/campaigns');
  };

  // Show error state for invalid ID
  if (!id || id.trim() === '') {
    return (
      <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Campaign ID</h2>
          <p className="text-gray-600 mb-6">The campaign ID is missing or invalid.</p>
          <Button onClick={handleBackToCampaigns} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Campaigns</span>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleBackToCampaigns} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Campaigns</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleBackToCampaigns}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Campaigns</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Campaign Details</h1>
            <p className="mt-2 text-slate-600">Edit your campaign settings and details</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !formData.name.trim()}
          className="flex items-center space-x-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      {/* Campaign Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter campaign name"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your campaign objectives and strategy"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="email">Email</option>
                    <option value="social">Social Media</option>
                    <option value="content">Content</option>
                    <option value="paid">Paid Advertising</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Campaign ID</p>
                <p className="text-sm text-gray-600 font-mono">{campaign?.id}</p>
              </div>
              {campaign?.createdAt && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {campaign?.launchedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Launched</p>
                  <p className="text-sm text-gray-600">
                    {new Date(campaign.launchedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                View Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Duplicate Campaign
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Delete Campaign
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
