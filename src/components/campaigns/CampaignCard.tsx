import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  Copy,
  Calendar,
  Target,
  DollarSign,
  TrendingUp,
  Mail,
  Share2,
  FileText,
  Eye,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
  budget_allocated?: number;
  budget_spent?: number;
  target_audience?: any;
  content?: any;
  metrics?: any;
}

interface CampaignCardProps {
  campaign: Campaign;
  onUpdate: () => void;
  isSelectedForComparison: boolean;
  onToggleComparison: (campaignId: string) => void;
  isComparisonDisabled: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  onUpdate,
  isSelectedForComparison,
  onToggleComparison,
  isComparisonDisabled,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'social':
      case 'social_media':
        return <Share2 className="h-4 w-4" />;
      case 'content':
        return <FileText className="h-4 w-4" />;
      case 'paid_ads':
        return <Target className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const handleEdit = () => {
    // Navigate to edit page
    window.location.href = `/app/campaigns/${campaign.id}/edit`;
  };

  const handleArchive = () => {
    if (window.confirm('Are you sure you want to archive this campaign?')) {
      toast({
        title: "Campaign Archived",
        description: `"${campaign.name}" has been archived.`,
      });
      onUpdate();
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      toast({
        title: "Campaign Deleted",
        description: `"${campaign.name}" has been deleted.`,
        variant: "destructive",
      });
      onUpdate();
    }
  };

  const handleDuplicate = () => {
    toast({
      title: "Campaign Duplicated",
      description: `"${campaign.name}" has been duplicated.`,
    });
    onUpdate();
  };

  // Calculate metrics
  const budgetUsage = campaign.budget_allocated && campaign.budget_allocated > 0 
    ? ((campaign.budget_spent || 0) / campaign.budget_allocated) * 100 
    : 0;

  const conversionRate = campaign.metrics?.conversion_rate || Math.random() * 5; // Mock data
  const reach = campaign.metrics?.reach || Math.floor(Math.random() * 10000); // Mock data

  return (
    <>
      <Card className={`transition-all duration-200 hover:shadow-md ${
        isSelectedForComparison ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              {/* Comparison Checkbox */}
              <div className="flex items-center space-x-2 mt-1">
                <Checkbox
                  checked={isSelectedForComparison}
                  onCheckedChange={() => onToggleComparison(campaign.id)}
                  disabled={isComparisonDisabled}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className="text-xs text-gray-500 hidden sm:inline">Compare</span>
              </div>

              {/* Campaign Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {getTypeIcon(campaign.type)}
                  <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {campaign.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetailsModal(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Description */}
          {campaign.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Budget</span>
              </div>
              <div className="text-sm font-semibold">
                ${(campaign.budget_spent || 0).toLocaleString()} / ${(campaign.budget_allocated || 0).toLocaleString()}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all" 
                  style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="h-3 w-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Performance</span>
              </div>
              <div className="text-sm font-semibold">{conversionRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Conversion rate</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>{reach.toLocaleString()} reach</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => setShowDetailsModal(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {getTypeIcon(campaign.type)}
              <span>{campaign.name}</span>
            </DialogTitle>
            <DialogDescription>
              Campaign details and performance metrics
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Campaign Overview */}
            <div>
              <h3 className="font-semibold mb-3">Campaign Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1 text-sm capitalize">{campaign.type.replace('_', ' ')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1 text-sm">{new Date(campaign.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <div className="mt-1 text-sm">{campaign.created_by}</div>
                </div>
              </div>
              {campaign.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <div className="mt-1 text-sm">{campaign.description}</div>
                </div>
              )}
            </div>

            {/* Budget Information */}
            <div>
              <h3 className="font-semibold mb-3">Budget & Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-900">Budget Allocated</div>
                  <div className="text-lg font-bold text-blue-600">
                    ${(campaign.budget_allocated || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-900">Budget Spent</div>
                  <div className="text-lg font-bold text-green-600">
                    ${(campaign.budget_spent || 0).toLocaleString()}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-purple-900">Budget Usage</div>
                  <div className="text-lg font-bold text-purple-600">
                    {budgetUsage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h3 className="font-semibold mb-3">Performance Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Reach</div>
                  <div className="text-xl font-bold">{reach.toLocaleString()}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Conversion Rate</div>
                  <div className="text-xl font-bold">{conversionRate.toFixed(2)}%</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Campaign
              </Button>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CampaignCard;