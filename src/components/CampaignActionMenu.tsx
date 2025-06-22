
import React, { useState } from 'react';
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
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, Archive, Trash2, RotateCcw } from 'lucide-react';
import { apiClient, Campaign } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface CampaignActionMenuProps {
  campaign: Campaign;
  onCampaignUpdate: (updatedCampaign: Campaign) => void;
  onCampaignDelete: (campaignId: string) => void;
}

const CampaignActionMenu: React.FC<CampaignActionMenuProps> = ({
  campaign,
  onCampaignUpdate,
  onCampaignDelete
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isArchived = campaign.status === 'archived';

  const handleArchive = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.archiveCampaign(campaign.id);
      if (result.success && result.data) {
        onCampaignUpdate(result.data);
        toast({
          title: "Campaign Archived",
          description: `"${campaign.name}" has been archived successfully.`,
        });
      } else {
        throw new Error(result.error || 'Failed to archive campaign');
      }
    } catch (error) {
      toast({
        title: "Archive Failed",
        description: error instanceof Error ? error.message : 'Failed to archive campaign',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowArchiveDialog(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.restoreCampaign(campaign.id);
      if (result.success && result.data) {
        onCampaignUpdate(result.data);
        toast({
          title: "Campaign Restored",
          description: `"${campaign.name}" has been restored successfully.`,
        });
      } else {
        throw new Error(result.error || 'Failed to restore campaign');
      }
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: error instanceof Error ? error.message : 'Failed to restore campaign',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.deleteCampaign(campaign.id);
      if (result.success) {
        onCampaignDelete(campaign.id);
        toast({
          title: "Campaign Deleted",
          description: `"${campaign.name}" has been permanently deleted.`,
        });
      } else {
        throw new Error(result.error || 'Failed to delete campaign');
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Failed to delete campaign',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isArchived ? (
            <DropdownMenuItem onClick={handleRestore} disabled={isLoading}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowArchiveDialog(true)} disabled={isLoading}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            disabled={isLoading}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Archive "{campaign.name}"? You can restore it later from the archived campaigns section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArchive}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? 'Archiving...' : 'Archive Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{campaign.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CampaignActionMenu;
