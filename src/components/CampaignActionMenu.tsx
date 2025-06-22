
import React from 'react';
import { MoreHorizontal, Edit, Archive, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Campaign } from '@/lib/api-client';

interface CampaignActionMenuProps {
  campaign: Campaign;
  onCampaignUpdate?: (updatedCampaign: Campaign) => void;
  onCampaignDelete?: (campaignId: string) => void;
  onAction?: (campaignId: string, action: 'delete' | 'archive' | 'restore') => void;
}

const CampaignActionMenu: React.FC<CampaignActionMenuProps> = ({
  campaign,
  onCampaignUpdate,
  onCampaignDelete,
  onAction
}) => {
  const isArchived = campaign.status === 'archived' || campaign.is_archived;

  const handleAction = (action: 'delete' | 'archive' | 'restore') => {
    if (onAction) {
      onAction(campaign.id, action);
    } else {
      // Fallback to legacy handlers
      if (action === 'delete' && onCampaignDelete) {
        onCampaignDelete(campaign.id);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onCampaignUpdate && (
          <>
            <DropdownMenuItem onClick={() => console.log('Edit campaign')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {!isArchived ? (
          <DropdownMenuItem onClick={() => handleAction('archive')}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => handleAction('restore')}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => handleAction('delete')}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CampaignActionMenu;
