import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Calendar, Zap } from 'lucide-react';

const PredictiveAnalytics: React.FC = () => {
  const [predictions] = useState({
    nextMonth: {
      revenue: 47500,
      confidence: 87,
      leads: 290,
      campaigns: 20
    },
    quarterlyForecast: {
      revenue: 142000,
      growth: 28,
      confidence: 82
    }
  });

  const [campaignPredictions] = useState([
    { 
      name: 'Summer Product Launch',
      successProbability: 92,
      predictedROI: 340,
      riskFactors: ['Market saturation', 'Timing overlap'],
      recommendation: 'Launch as planned'
    },
    {
      name: 'LinkedIn B2B Campaign',
      successProbability: 78,
      predictedROI: 245,
      riskFactors: ['Budget constraints', 'Competition'],
      recommendation: 'Increase budget by 20%'
    },
    {
      name: 'Video Content Series',
      successProbability: 85,
      predictedROI: 189,
      riskFactors: ['Production delays'],
      recommendation: 'Proceed with caution'
    }
  ]);

  const [leadPredictions] = useState([
    { type: 'High-Intent Leads', probability: 94, expectedConversions: 23 },
    { type: 'Nurture Sequence', probability: 67, expectedConversions: 45 },
    { type: 'Cold Outreach', probability: 23, expectedConversions: 12 },
    { type: 'Referral Program', probability: 89, expectedConversions: 18 }
  ]);

  const [budgetOptimization] = useState([
    { channel: 'Email Marketing', currentBudget: 5000, recommendedBudget: 6500, expectedReturn: 8900 },
    { channel: 'Social Media', currentBudget: 4000, recommendedBudget: 3200, expectedReturn: 5800 },
    { channel: 'Content Creation', currentBudget: 3000, recommendedBudget: 4200, expectedReturn: 7200 },
    { channel: 'Paid Advertising', currentBudget: 6000, recommendedBudget: 5500, expectedReturn: 9800 }
  ]);

  const [forecastData] = useState([
    { month: 'Current', actual: 42500, predicted: 42500 },
    { month: 'Next', actual: null, predicted: 47500 },
    { month: 'Month 2', actual: null, predicted: 52000 },
    { month: 'Month 3', actual: null, predicted: 48500 },
    { month: 'Month 4', actual: null, predicted: 55000 },
    { month: 'Month 5', actual: null, predicted: 58500 },
    { month: 'Month 6', actual: null, predicted: 61000 }
  ]);

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Predictive Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Predictions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Performance Predictions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Next Month Forecast</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Revenue</span>
                  <span className="font-bold text-blue-900">${predictions.nextMonth.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Leads</span>
                  <span className="font-bold text-blue-900">{predictions.nextMonth.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Campaigns</span>
                  <span className="font-bold text-blue-900">{predictions.nextMonth.campaigns}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Confidence</span>
                  <Badge variant="outline">{predictions.nextMonth.confidence}%</Badge>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-900 mb-2">Quarterly Outlook</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Projected Revenue</span>
                  <span className="font-bold text-green-900">${predictions.quarterlyForecast.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Growth Rate</span>
                  <span className="font-bold text-green-900">{predictions.quarterlyForecast.growth}%</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Confidence</span>
                  <Badge variant="outline">{predictions.quarterlyForecast.confidence}%</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Forecast Chart */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">6-Month Revenue Forecast</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3B82F6" 
                strokeWidth={2} 
                name="Actual"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8B5CF6" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                name="Predicted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Success Predictions */}
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

        {/* Lead Conversion Predictions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Lead Conversion Likelihood</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadPredictions.map((lead, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{lead.type}</span>
                  <Badge variant={lead.probability > 70 ? 'default' : 'secondary'}>
                    {lead.probability}%
                  </Badge>
                </div>
                <Progress value={lead.probability} className="h-2 mb-3" />
                <div className="text-sm text-gray-600">
                  Expected conversions: <span className="font-medium">{lead.expectedConversions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Optimization */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Budget Optimization Opportunities</h4>
          <div className="space-y-3">
            {budgetOptimization.map((channel, index) => {
              const budgetChange = channel.recommendedBudget - channel.currentBudget;
              const isIncrease = budgetChange > 0;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{channel.channel}</span>
                    <div className="text-sm text-gray-600">
                      Current: ${channel.currentBudget.toLocaleString()} → 
                      Recommended: ${channel.recommendedBudget.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${isIncrease ? 'text-blue-600' : 'text-green-600'}`}>
                      {isIncrease ? '+' : ''}${budgetChange.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Expected: ${channel.expectedReturn.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalytics;
