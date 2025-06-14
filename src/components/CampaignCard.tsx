
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, BarChart3, Users, ArrowRight } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  createdAt?: Date;
  metrics?: {
    opens?: number;
    clicks?: number;
    conversions?: number;
  };
}

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return '📧';
      case 'social':
        return '📱';
      case 'content':
        return '📝';
      case 'mixed':
        return '🎯';
      default:
        return '📊';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCampaignTypeIcon(campaign.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 truncate">
                {campaign.name || 'Untitled Campaign'}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status || 'draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {campaign.description || 'No description provided'}
        </p>

        {/* Campaign Type */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <span className="text-sm text-gray-600 capitalize">
            {campaign.type} campaign
          </span>
        </div>

        {/* Metrics (if available) */}
        {campaign.metrics && (
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {campaign.metrics.opens || 0}
              </div>
              <div className="text-xs text-gray-500">Opens</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {campaign.metrics.clicks || 0}
              </div>
              <div className="text-xs text-gray-500">Clicks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {campaign.metrics.conversions || 0}
              </div>
              <div className="text-xs text-gray-500">Conversions</div>
            </div>
          </div>
        )}

        {/* Created Date */}
        {campaign.createdAt && (
          <div className="flex items-center space-x-2 mb-4 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/campaigns/${campaign.id}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
