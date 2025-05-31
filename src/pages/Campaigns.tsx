
import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { Calendar, Settings as SettingsIcon } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    status: 'draft',
    description: ''
  });

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'campaigns', { section: 'main' });
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const actionId = behaviorTracker.trackFeatureStart('campaigns_load');
    try {
      const result = await apiClient.getCampaigns();
      if (result.success) {
        setCampaigns(result.data || []);
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, true);
      } else {
        console.error('Failed to load campaigns:', result.error);
        behaviorTracker.trackFeatureComplete('campaigns_load', actionId, false);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
      behaviorTracker.trackFeatureComplete('campaigns_load', actionId, false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionId = behaviorTracker.trackFeatureStart('campaign_create');
    
    try {
      const result = await apiClient.createCampaign(newCampaign);
      if (result.success) {
        setCampaigns(prev => [result.data, ...prev]);
        setNewCampaign({ name: '', type: 'email', status: 'draft', description: '' });
        setShowCreateForm(false);
        behaviorTracker.trackFeatureComplete('campaign_create', actionId, true);
      } else {
        console.error('Failed to create campaign:', result.error);
        behaviorTracker.trackFeatureComplete('campaign_create', actionId, false);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      behaviorTracker.trackFeatureComplete('campaign_create', actionId, false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaign Management</h1>
          <p className="mt-2 text-slate-600">Create and manage your marketing campaigns</p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            behaviorTracker.trackAction('planning', 'campaigns', { action: 'show_create_form' });
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Create Campaign
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Create New Campaign</h3>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Campaign Type
              </label>
              <select
                value={newCampaign.type}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Email</option>
                <option value="social">Social Media</option>
                <option value="content">Content</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={newCampaign.description}
                onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Create Campaign
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns yet</h3>
            <p className="text-slate-600 mb-4">Create your first campaign to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Create Your First Campaign
            </button>
          </div>
        ) : (
          campaigns.map((campaign: any) => (
            <div key={campaign.id || Math.random()} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-900">
                  {campaign.name || 'Untitled Campaign'}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  campaign.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : campaign.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {campaign.status || 'draft'}
                </span>
              </div>
              
              <p className="text-slate-600 text-sm mb-4">
                {campaign.description || 'No description provided'}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 capitalize">
                  {campaign.type || 'email'} campaign
                </span>
                <button
                  onClick={() => {
                    behaviorTracker.trackAction('planning', 'campaigns', { 
                      action: 'view_details', 
                      campaignId: campaign.id 
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Campaigns;
