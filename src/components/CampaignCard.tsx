import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import CampaignActionMenu from './CampaignActionMenu';
import { Campaign } from '@/lib/api-client';

interface CampaignCardProps {
  campaign: Campaign;
  onCampaignUpdate: (updatedCampaign: Campaign) => void;
  onCampaignDelete: (campaignId: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onCampaignUpdate, 
  onCampaignDelete 
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the action menu
    if ((e.target as HTMLElement).closest('[role="button"]')) {
      return;
    }
    
    behaviorTracker.trackAction('navigation', 'campaign_details', {
      campaignId: campaign.id,
      campaignName: campaign.name
    });
    navigate(`/campaigns/${campaign.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-slate-100 text-slate-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Safely handle potentially empty values
  const safeStatus = campaign.status || 'draft';
  const safeType = campaign.type || 'email';
  const safeChannel = campaign.channel || 'unknown';
  
  const isArchived = safeStatus === 'archived';

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        isArchived ? 'opacity-60 bg-slate-50' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${isArchived ? 'text-slate-600' : ''}`}>
          {campaign.name || 'Untitled Campaign'}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(safeStatus)}>
            {safeStatus}
          </Badge>
          <CampaignActionMenu
            campaign={campaign}
            onCampaignUpdate={onCampaignUpdate}
            onCampaignDelete={onCampaignDelete}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span className="capitalize">{safeType}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{safeChannel}</span>
          </div>
          
          {campaign.budget_allocated && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Budget: ${campaign.budget_allocated.toLocaleString()}</span>
              {campaign.budget_spent && (
                <span className="ml-2 text-xs">
                  (${campaign.budget_spent.toLocaleString()} spent)
                </span>
              )}
            </div>
          )}
          
          {campaign.start_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                Starts: {new Date(campaign.start_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {campaign.description && (
            <p className={`text-sm mt-2 ${isArchived ? 'text-slate-500' : 'text-gray-600'}`}>
              {campaign.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;