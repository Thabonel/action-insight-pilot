
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Users, Target, ArrowUp, ArrowDown } from 'lucide-react';

const PerformanceInsights: React.FC = () => {
  const [roiAnalysis] = useState([
    { campaign: 'Email Newsletter Series', spend: 2500, revenue: 8900, roi: 256, trend: 'up' },
    { campaign: 'Social Media Ads', spend: 3200, revenue: 7800, roi: 144, trend: 'up' },
    { campaign: 'Content Marketing', spend: 1800, revenue: 4200, roi: 133, trend: 'down' },
    { campaign: 'LinkedIn Outreach', spend: 1500, revenue: 6300, roi: 320, trend: 'up' }
  ]);

  const [contentMetrics] = useState([
    { type: 'Blog Posts', engagement: 78, conversions: 12, performance: 'excellent' },
    { type: 'Video Content', engagement: 85, conversions: 18, performance: 'excellent' },
    { type: 'Infographics', engagement: 65, conversions: 8, performance: 'good' },
    { type: 'Case Studies', engagement: 92, conversions: 24, performance: 'excellent' }
  ]);

  const [leadQuality] = useState({
    totalLeads: 1247,
    qualifiedLeads: 423,
    qualificationRate: 34,
    avgLeadScore: 76,
    trends: {
      leadVolume: '+18%',
      quality: '+12%',
      scoreImprovement: '+8 points'
    }
  });

  const [conversionPaths] = useState([
    { path: 'Email → Landing Page → Demo', conversions: 89, rate: 4.2 },
    { path: 'Social → Blog → Newsletter', conversions: 67, rate: 3.1 },
    { path: 'Search → Content → Contact', conversions: 52, rate: 2.8 },
    { path: 'LinkedIn → Profile → Direct', conversions: 34, rate: 6.7 }
  ]);

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent': return { variant: 'default' as const, label: 'Excellent' };
      case 'good': return { variant: 'secondary' as const, label: 'Good' };
      default: return { variant: 'outline' as const, label: 'Average' };
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <ArrowUp className="h-4 w-4 text-green-500" /> : 
      <ArrowDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span>Performance Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Campaign ROI Analysis */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Campaign ROI Analysis</h4>
          <div className="space-y-3">
            {roiAnalysis.map((campaign, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{campaign.campaign}</h5>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(campaign.trend)}
                    <Badge variant={campaign.roi > 200 ? 'default' : 'secondary'}>
                      {campaign.roi}% ROI
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Spend</span>
                    <div className="font-medium">${campaign.spend.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Revenue</span>
                    <div className="font-medium">${campaign.revenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Profit</span>
                    <div className="font-medium text-green-600">
                      ${(campaign.revenue - campaign.spend).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Effectiveness */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Content Effectiveness Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentMetrics.map((content, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">{content.type}</h5>
                  <Badge {...getPerformanceBadge(content.performance)}>
                    {getPerformanceBadge(content.performance).label}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engagement Rate</span>
                      <span>{content.engagement}%</span>
                    </div>
                    <Progress value={content.engagement} className="h-2" />
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Conversions: </span>
                    <span className="font-medium">{content.conversions}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Quality Trends */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Lead Quality Trends</h4>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-blue-900">{leadQuality.totalLeads}</div>
                <div className="text-xs text-blue-700">Total Leads</div>
                <div className="text-xs text-green-600 font-medium">{leadQuality.trends.leadVolume}</div>
              </div>
              <div className="text-center">
                <Target className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-green-900">{leadQuality.qualifiedLeads}</div>
                <div className="text-xs text-green-700">Qualified</div>
                <div className="text-xs text-green-600 font-medium">{leadQuality.trends.quality}</div>
              </div>
              <div className="text-center">
                <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-2xl font-bold text-purple-900">{leadQuality.qualificationRate}%</div>
                <div className="text-xs text-purple-700">Qualification Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-900">{leadQuality.avgLeadScore}</div>
                <div className="text-xs text-orange-700">Avg Lead Score</div>
                <div className="text-xs text-green-600 font-medium">{leadQuality.trends.scoreImprovement}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Path Analysis */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Conversion Path Analysis</h4>
          <div className="space-y-2">
            {conversionPaths.map((path, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{path.path}</span>
                  <div className="text-sm text-gray-600">{path.conversions} conversions</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{path.rate}%</div>
                  <div className="text-xs text-gray-500">Conversion Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceInsights;
