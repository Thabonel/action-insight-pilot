
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Calendar, Target, DollarSign, MoreVertical, Edit, Archive, Trash2, BarChart3 } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled' | 'archived';
  type?: 'social_media' | 'email' | 'content' | 'paid_ads' | 'seo' | 'other';
  budget_allocated?: number;
  budget_spent?: number;
  metrics?: any;
  channel: string;
  created_by: string;
  start_date?: string;
  end_date?: string;
  target_audience?: any;
  content?: any;
  settings?: any;
}

interface CampaignCardProps {
  campaign: Campaign;
  onEdit?: (campaign: Campaign) => void;
  onArchive?: (campaignId: string) => void;
  onDelete?: (campaignId: string) => void;
  onViewAnalytics?: (campaignId: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onEdit,
  onArchive,
  onDelete,
  onViewAnalytics
}) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on the dropdown menu or its trigger
    if ((e.target as HTMLElement).closest('[data-radix-dropdown-menu-trigger]') || 
        (e.target as HTMLElement).closest('[data-radix-dropdown-menu-content]') ||
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/app/campaigns/${campaign.id}`);
  };

  const getStatusColor = (status?: string) => {
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
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(campaign);
  };

  const handleAnalyticsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewAnalytics?.(campaign.id);
  };

  const handleArchiveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowArchiveDialog(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleDelete = () => {
    onDelete?.(campaign.id);
    setShowDeleteDialog(false);
  };

  const handleArchive = () => {
    onArchive?.(campaign.id);
    setShowArchiveDialog(false);
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300" 
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-slate-900 mb-2">
                {campaign.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status || 'Draft'}
                </Badge>
                {campaign.type && (
                  <Badge variant="outline" className="capitalize">
                    {campaign.type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-radix-dropdown-menu-trigger>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
                <DropdownMenuItem onClick={handleEditClick} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleAnalyticsClick} className="cursor-pointer">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchiveClick} className="cursor-pointer">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Campaign
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteClick}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {campaign.description && (
            <p className="text-sm text-slate-600 line-clamp-2">
              {campaign.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            {campaign.budget_allocated && (
              <div className="flex items-center text-slate-600">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>${campaign.budget_allocated.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex items-center text-slate-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
            
            {campaign.metrics?.impressions && (
              <div className="flex items-center text-slate-600">
                <Target className="h-4 w-4 mr-1" />
                <span>{campaign.metrics.impressions.toLocaleString()} views</span>
              </div>
            )}
            
            {campaign.metrics?.conversions && (
              <div className="flex items-center text-slate-600">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span>{campaign.metrics.conversions.toLocaleString()} conversions</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialog

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{campaign.name}"? Archived campaigns can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Archive Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CampaignCard;
