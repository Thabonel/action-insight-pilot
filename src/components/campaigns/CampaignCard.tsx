
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Calendar, Target, DollarSign, MoreVertical, Edit, BarChart3, Archive, Trash2 } from 'lucide-react';
import { useCampaignCRUD } from '@/hooks/useCampaignCRUD';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/hooks/useCampaigns';

interface CampaignCardProps {
  campaign: Campaign;
  onUpdate?: () => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onUpdate }) => {
  const navigate = useNavigate();
  const { archiveCampaign, deleteCampaign, isLoading } = useCampaignCRUD();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleViewDetails = () => {
    if (campaign.id) {
      navigate(`/campaigns/${campaign.id}`);
    } else {
      console.error('Cannot navigate to campaign details: missing campaign ID');
    }
  };

  const handleEditCampaign = () => {
    if (campaign.id) {
      navigate(`/campaigns/${campaign.id}/edit`);
    }
  };

  const handleViewAnalytics = () => {
    if (campaign.id) {
      navigate(`/campaigns/${campaign.id}/analytics`);
    }
  };

  const handleArchiveCampaign = async () => {
    try {
      await archiveCampaign(campaign.id);
      toast({
        title: "Success",
        description: "Campaign archived successfully",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive campaign",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      await deleteCampaign(campaign.id);
      toast({
        title: "Success",
        description: "Campaign deleted successfully",
      });
      onUpdate?.();
      setShowDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-slate-900 truncate">
            {campaign.name || 'Untitled Campaign'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(campaign.status || 'draft')}>
              {campaign.status || 'Draft'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditCampaign}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleViewAnalytics}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleArchiveCampaign} disabled={isLoading}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Campaign
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
            onClick={handleViewDetails}
            disabled={!campaign.id}
          >
            {campaign.id ? 'View Details' : 'Invalid Campaign'}
          </button>
        </div>
      </CardContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the campaign
              "{campaign.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default CampaignCard;
