
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    behaviorTracker.trackAction('planning', 'campaigns', { 
      action: 'view_details', 
      campaignId: campaign.id 
    });
    navigate(`/campaigns/${campaign.id}`);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
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
          onClick={handleViewDetails}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default CampaignCard;
