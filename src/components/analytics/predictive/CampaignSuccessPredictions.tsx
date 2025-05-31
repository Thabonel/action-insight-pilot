
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CampaignPrediction {
  name: string;
  successProbability: number;
  predictedROI: number;
  riskFactors: string[];
  recommendation: string;
}

interface CampaignSuccessPredictionsProps {
  campaignPredictions: CampaignPrediction[];
}

const CampaignSuccessPredictions: React.FC<CampaignSuccessPredictionsProps> = ({
  campaignPredictions
}) => {
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-50';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecommendationBadge = (rec: string) => {
    if (rec.includes('planned')) return { variant: 'default' as const, label: 'Recommended' };
    if (rec.includes('Increase')) return { variant: 'secondary' as const, label: 'Optimize' };
    return { variant: 'outline' as const, label: 'Monitor' };
  };

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Campaign Success Probability</h4>
      <div className="space-y-3">
        {campaignPredictions.map((campaign, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-gray-900">{campaign.name}</h5>
              <div className="flex items-center space-x-2">
                <Badge {...getRecommendationBadge(campaign.recommendation)}>
                  {getRecommendationBadge(campaign.recommendation).label}
                </Badge>
                <div className={`px-2 py-1 rounded text-sm font-medium ${getProbabilityColor(campaign.successProbability)}`}>
                  {campaign.successProbability}%
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <span className="text-sm text-gray-500">Success Probability</span>
                <Progress value={campaign.successProbability} className="h-2 mt-1" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Predicted ROI</span>
                <div className="font-medium">{campaign.predictedROI}%</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Recommendation</span>
                <div className="font-medium text-sm">{campaign.recommendation}</div>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Risk Factors:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {campaign.riskFactors.map((risk, riskIndex) => (
                  <Badge key={riskIndex} variant="outline" className="text-xs">
                    {risk}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignSuccessPredictions;
