
import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import CampaignForm from '@/components/CampaignForm';
import CampaignCard from '@/components/CampaignCard';
import EmptyState from '@/components/EmptyState';

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
        setCampaigns((result.data as Campaign[]) || []);
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
        setCampaigns(prev => [result.data as Campaign, ...prev]);
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

  const handleShowCreateForm = () => {
    setShowCreateForm(true);
    behaviorTracker.trackAction('planning', 'campaigns', { action: 'show_create_form' });
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
          onClick={handleShowCreateForm}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Create Campaign
        </button>
      </div>

      {showCreateForm && (
        <CampaignForm
          newCampaign={newCampaign}
          setNewCampaign={setNewCampaign}
          onSubmit={handleCreateCampaign}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.length === 0 ? (
          <EmptyState onCreateCampaign={handleShowCreateForm} />
        ) : (
          campaigns.map((campaign) => (
            <CampaignCard key={campaign.id || Math.random()} campaign={campaign} />
          ))
        )}
      </div>
    </div>
  );
};

export default Campaigns;
