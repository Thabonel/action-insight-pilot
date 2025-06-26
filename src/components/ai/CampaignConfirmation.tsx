import React from 'react';
import { CheckCircle, Calendar, DollarSign, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  id: string;
  name: string;
  type: string;
  budget_allocated?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface CampaignConfirmationProps {
  campaign: Campaign;
  onClose?: () => void;
}

const CampaignConfirmation: React.FC<CampaignConfirmationProps> = ({
  campaign,
  onClose
}) => {
  const navigate = useNavigate();

  const handleViewCampaign = () => {
    navigate(`/campaigns/${campaign.id}`);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCampaignTypeColor = (type: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-800',
      social_media: 'bg-purple-100 text-purple-800',
      paid_ads: 'bg-green-100 text-green-800',
      content: 'bg-orange-100 text-orange-800',
      seo: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Campaign Created Successfully! 🎉
        </h2>
        <p className="text-gray-600">
          Your campaign has been created and is ready to launch
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Campaign Name */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {campaign.name}
          </h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCampaignTypeColor(campaign.type)}`}>
            <Target className="h-4 w-4 mr-1" />
            {campaign.type.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Campaign Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Budget */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget Allocated</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(campaign.budget_allocated)}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Timeline</p>
              <p className="text-lg font-semibold text-gray-900">
                {campaign.start_date && campaign.end_date
                  ? `${formatDate(campaign.start_date)} - ${formatDate(campaign.end_date)}`
                  : 'To be scheduled'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Creation Date */}
        <div className="text-center text-sm text-gray-600">
          Created on {formatDate(campaign.created_at)}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleViewCampaign}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Full Campaign
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignConfirmation;