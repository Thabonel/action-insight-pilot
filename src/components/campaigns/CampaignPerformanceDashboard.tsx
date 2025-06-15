import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Target, BarChart3, Users, Mail, Share2, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

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
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  // Calculate enhanced analytics
  const analytics = React.useMemo(() => {
    if (campaigns.length === 0) return null;

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const avgSuccessScore = campaigns.reduce((sum, c) => sum + (c.performance?.successScore || 0), 0) / totalCampaigns;
    const avgBudgetEfficiency = campaigns.reduce((sum, c) => sum + (c.performance?.budgetEfficiency || 0), 0) / totalCampaigns;

    // Campaign type distribution
    const typeDistribution = campaigns.reduce((acc, campaign) => {
      acc[campaign.type] = (acc[campaign.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Performance trend (simulated based on creation dates)
    const performanceTrend = campaigns
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-7)
      .map((campaign, index) => ({
        date: new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: campaign.performance?.successScore || 0,
        efficiency: campaign.performance?.budgetEfficiency || 0,
        campaign: campaign.name.substring(0, 15) + '...'
      }));

    // Top performing campaigns
    const topPerformers = [...campaigns]
      .sort((a, b) => (b.performance?.successScore || 0) - (a.performance?.successScore || 0))
      .slice(0, 5);

    return {
      totalCampaigns,
      activeCampaigns,
      avgSuccessScore,
      avgBudgetEfficiency,
      typeDistribution,
      performanceTrend,
      topPerformers
    };
  }, [campaigns]);

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getTimingAnalysis = (campaign: Campaign) => {
    if (!campaign.launchedAt) return 'Not launched';
    
    const launchHour = new Date(campaign.launchedAt).getHours();
    const isOptimal = launchHour >= 9 && launchHour <= 11;
    
    return isOptimal ? 'Optimal timing' : 'Suboptimal timing';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No campaigns found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Switcher */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Campaign Performance Dashboard</CardTitle>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={selectedView === 'overview' ? 'default' : 'outline'}
                onClick={() => setSelectedView('overview')}
              >
                Overview
              </Button>
              <Button
                size="sm"
                variant={selectedView === 'detailed' ? 'default' : 'outline'}
                onClick={() => setSelectedView('detailed')}
              >
                Detailed
              </Button>
              <Button
                size="sm"
                variant={selectedView === 'analytics' ? 'default' : 'outline'}
                onClick={() => setSelectedView('analytics')}
              >
                Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedView === 'overview' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                    <p className="text-2xl font-bold">{analytics.totalCampaigns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Active Campaigns</p>
                    <p className="text-2xl font-bold">{analytics.activeCampaigns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Success Score</p>
                    <p className="text-2xl font-bold">{analytics.avgSuccessScore.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Budget Efficiency</p>
                    <p className="text-2xl font-bold">{analytics.avgBudgetEfficiency.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign List */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      name="Success Score"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="efficiency" 
                      stroke="#10B981" 
                      name="Budget Efficiency"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.typeDistribution).map(([type, count]) => ({
                        name: type,
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {Object.entries(analytics.typeDistribution).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(analytics.typeDistribution).map(([type, count], index) => (
                  <Badge key={type} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topPerformers.map((campaign, index) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{campaign.type} campaign</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Success Score</p>
                        <p className="font-bold text-green-600">{campaign.performance?.successScore || 0}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Budget Efficiency</p>
                        <p className="font-bold text-blue-600">{campaign.performance?.budgetEfficiency || 0}%</p>
                      </div>
                      {(campaign.performance?.successScore || 0) >= 80 ? (
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Campaign Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <p className="text-gray-600">{campaign.description || 'No description available'}</p>
                    </div>
                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Performance Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Success Score:</span>
                          <span className="font-bold">{campaign.performance?.successScore || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Budget Efficiency:</span>
                          <span className="font-bold">{campaign.performance?.budgetEfficiency || 0}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Timeline</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Launched:</span>
                          <span>{campaign.launchedAt ? new Date(campaign.launchedAt).toLocaleDateString() : 'Not launched'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Channel Breakdown</h4>
                      <div className="space-y-1 text-sm">
                        {campaign.performance?.channelBreakdown ? 
                          Object.entries(campaign.performance.channelBreakdown).map(([channel, value]) => (
                            <div key={channel} className="flex justify-between">
                              <span className="capitalize">{channel}:</span>
                              <span className="font-bold">{value}%</span>
                            </div>
                          ))
                          : <span className="text-gray-500">No channel data</span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Optimize
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignPerformanceDashboard;
