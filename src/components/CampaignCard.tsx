
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, DollarSign } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  budget_allocated?: number;
  start_date?: string;
  end_date?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    // Only navigate if we have a valid campaign ID
    if (campaign.id) {
      navigate(`/campaigns/${campaign.id}`);
    } else {
      console.error('Cannot navigate to campaign details: missing campaign ID');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDetails}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-slate-900 truncate">
            {campaign.name || 'Untitled Campaign'}
          </CardTitle>
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status || 'Draft'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-slate-600">
          <Target className="h-4 w-4 mr-2" />
          <span className="capitalize">{campaign.type || 'General'}</span>
        </div>
        
        {campaign.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {campaign.description}
          </p>
        )}
        
        <div className="flex justify-between items-center text-sm">
          {campaign.budget_allocated && (
            <div className="flex items-center text-slate-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>${campaign.budget_allocated.toLocaleString()}</span>
            </div>
          )}
          
          {campaign.start_date && (
            <div className="flex items-center text-slate-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(campaign.start_date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="pt-2 border-t">
          <button 
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            disabled={!campaign.id}
          >
            {campaign.id ? 'View Details' : 'Invalid Campaign'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;
