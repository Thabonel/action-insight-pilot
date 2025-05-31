
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  createdAt: Date;
  launchedAt?: Date;
  performance: {
    successScore: number;
    budgetEfficiency: number;
    channelBreakdown: Record<string, number>;
  };
}

interface CampaignPerformanceDashboardProps {
  campaigns: Campaign[];
}

const CampaignPerformanceDashboard: React.FC<CampaignPerformanceDashboardProps> = ({ campaigns }) => {
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTimingAnalysis = (campaign: Campaign) => {
    if (!campaign.launchedAt) return 'Not launched';
    
    const launchHour = new Date(campaign.launchedAt).getHours();
    const isOptimal = launchHour >= 9 && launchHour <= 11; // Assuming optimal time
    
    return isOptimal ? 'Optimal timing' : 'Suboptimal timing';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No campaigns found</p>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{campaign.type} campaign</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Success Score</span>
                    </div>
                    <div className={`text-lg font-bold ${getPerformanceColor(campaign.performance?.successScore || 0)}`}>
                      {campaign.performance?.successScore || 0}%
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Budget Efficiency</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {campaign.performance?.budgetEfficiency || 0}%
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Timing</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {getTimingAnalysis(campaign)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingDown className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Top Channel</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {campaign.performance?.channelBreakdown 
                        ? Object.keys(campaign.performance.channelBreakdown)[0] || 'N/A'
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Created: {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                    {campaign.launchedAt && (
                      <span className="text-gray-500">
                        Launched: {new Date(campaign.launchedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignPerformanceDashboard;
