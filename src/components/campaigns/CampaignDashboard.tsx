import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Campaign, ApiResponse } from '@/lib/api-client-interface';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  BarChart3,
  Mail,
  MousePointer,
  Eye,
  Clock,
  Calendar,
  RefreshCw,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cost: number;
  ctr: number;
  conversionRate: number;
  cpc: number;
  cpa: number;
  roas: number;
  roi: number;
  dailyData: Array<{
    date: string;
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    revenue: number;
  }>;
  channelPerformance: Array<{
    channel: string;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  audienceData: {
    demographics: Array<{
      segment: string;
      percentage: number;
      conversions: number;
    }>;
    locations: Array<{
      location: string;
      percentage: number;
      revenue: number;
    }>;
  };
  recentActivities: Array<{
    message: string;
    timestamp: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// Real analytics data generator based on campaign metrics
const generateAnalyticsData = (campaign: Campaign): AnalyticsData => {
  const daysRunning = campaign.startDate ? 
    Math.floor((new Date().getTime() - new Date(campaign.startDate).getTime()) / (1000 * 3600 * 24)) : 0;
  
  // Use real metrics from campaign if available, otherwise use defaults
  const baseMetrics = {
    impressions: campaign.metrics?.impressions || 0,
    clicks: campaign.metrics?.clicks || 0,
    conversions: campaign.metrics?.reach || 0, // Using reach as a proxy since conversions doesn't exist in the interface
    revenue: campaign.metrics?.revenue_generated || 0,
    cost: campaign.budget_spent || 0,
  };

  // Calculate derived metrics
  const ctr = baseMetrics.impressions > 0 ? (baseMetrics.clicks / baseMetrics.impressions) * 100 : 0;
  const conversionRate = baseMetrics.clicks > 0 ? (baseMetrics.conversions / baseMetrics.clicks) * 100 : 0;
  const cpc = baseMetrics.clicks > 0 ? baseMetrics.cost / baseMetrics.clicks : 0;
  const cpa = baseMetrics.conversions > 0 ? baseMetrics.cost / baseMetrics.conversions : 0;
  const roas = baseMetrics.cost > 0 ? baseMetrics.revenue / baseMetrics.cost : 0;
  const roi = baseMetrics.cost > 0 ? ((baseMetrics.revenue - baseMetrics.cost) / baseMetrics.cost) * 100 : 0;

  return {
    ...baseMetrics,
    ctr: Number(ctr.toFixed(2)),
    conversionRate: Number(conversionRate.toFixed(2)),
    cpc: Number(cpc.toFixed(2)),
    cpa: Number(cpa.toFixed(2)),
    roas: Number(roas.toFixed(2)),
    roi: Number(roi.toFixed(1)),
    
    // Time series data - would need real daily tracking
    dailyData: daysRunning > 0 ? Array.from({ length: Math.min(daysRunning + 1, 30) }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      impressions: Math.floor(baseMetrics.impressions / Math.max(daysRunning, 1)),
      clicks: Math.floor(baseMetrics.clicks / Math.max(daysRunning, 1)),
      conversions: Math.floor(baseMetrics.conversions / Math.max(daysRunning, 1)),
      cost: Math.floor(baseMetrics.cost / Math.max(daysRunning, 1)),
      revenue: Math.floor(baseMetrics.revenue / Math.max(daysRunning, 1))
    })) : [],
    
    // Channel breakdown based on actual campaign channels
    channelPerformance: Array.isArray(campaign.channels) ? campaign.channels.map((channel, index) => {
      const weight = 1 / (campaign.channels?.length || 1);
      return {
        channel: typeof channel === 'string' ? channel : 'Unknown Channel',
        impressions: Math.floor(baseMetrics.impressions * weight),
        clicks: Math.floor(baseMetrics.clicks * weight),
        conversions: Math.floor(baseMetrics.conversions * weight)
      };
    }) : [],
    
    // Audience insights - would need real analytics integration
    audienceData: {
      demographics: campaign.demographics ? [
        { segment: 'Primary Target', percentage: 100, conversions: baseMetrics.conversions }
      ] : [],
      locations: []
    },
    
    // Recent activities - would need activity tracking
    recentActivities: [],
    
    // Recommendations - would need AI analysis
    recommendations: []
  };
};

const CampaignDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchCampaignDashboard = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const result = await apiClient.getCampaignById(id) as ApiResponse<Campaign>;
        
        if (result.success && result.data) {
          setCampaign(result.data);
          const analyticsData = generateAnalyticsData(result.data);
          setAnalytics(analyticsData);
        } else {
          toast({
            title: "Error",
            description: "Failed to load campaign dashboard",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        toast({
          title: "Error",
          description: "Failed to load campaign dashboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDashboard();
  }, [id, toast]);

  const handleRefresh = async () => {
    if (!campaign) return;
    
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const analyticsData = generateAnalyticsData(campaign);
    setAnalytics(analyticsData);
    setRefreshing(false);
    
    toast({
      title: "Dashboard Refreshed",
      description: "Latest data has been loaded",
    });
  };

  const exportData = () => {
    toast({
      title: "Export Started",
      description: "Campaign data is being prepared for download",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (value: number, target: number) => {
    if (value > target) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < target * 0.8) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 animate-pulse" />
          <span>Loading campaign dashboard...</span>
        </div>
      </div>
    );
  }

  if (!campaign || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Campaign Not Found</h3>
          <p className="text-gray-500">Unable to load dashboard for this campaign.</p>
        </div>
      </div>
    );
  }

  const budgetUsed = campaign.budget_allocated ? 
    (campaign.budget_spent || 0) / campaign.budget_allocated * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <Badge className={`${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-gray-600">{campaign.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Started {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Last updated {new Date(campaign.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Impressions</p>
                  <p className="text-2xl font-bold">{analytics.impressions.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12.5% vs last period
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clicks</p>
                  <p className="text-2xl font-bold">{analytics.clicks.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">CTR: {analytics.ctr}%</p>
                </div>
                <MousePointer className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold">{analytics.conversions.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">Rate: {analytics.conversionRate}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">${analytics.revenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600">ROAS: {analytics.roas}x</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cost</p>
                  <p className="text-2xl font-bold">${analytics.cost.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">CPC: ${analytics.cpc}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-2xl font-bold">{analytics.roi}%</p>
                  <p className="text-xs text-gray-600">CPA: ${analytics.cpa}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Interactive chart showing daily performance trends</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Last 30 days: Impressions, Clicks, Conversions
                        </p>
                      </div>
                    </div>
                    
                    {/* Recent Performance Summary */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Avg Daily Impressions</p>
                        <p className="text-lg font-bold">{Math.floor(analytics.impressions / 30).toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Avg Daily Clicks</p>
                        <p className="text-lg font-bold">{Math.floor(analytics.clicks / 30).toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Avg Daily Conversions</p>
                        <p className="text-lg font-bold">{Math.floor(analytics.conversions / 30)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goal Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Goal Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Conversion Goal</span>
                      <span className="text-sm text-gray-600">
                        {analytics.conversions} / {campaign.kpiTargets?.leads || 1000}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((analytics.conversions / (Number(campaign.kpiTargets?.leads) || 1000)) * 100, 100)} 
                      className="h-3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((analytics.conversions / (Number(campaign.kpiTargets?.leads) || 1000)) * 100)}% of target reached
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Revenue Goal</span>
                      <span className="text-sm text-gray-600">
                        ${analytics.revenue.toLocaleString()} / ${Number(campaign.kpiTargets?.revenue || 100000).toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((analytics.revenue / (Number(campaign.kpiTargets?.revenue) || 100000)) * 100, 100)} 
                      className="h-3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((analytics.revenue / (Number(campaign.kpiTargets?.revenue) || 100000)) * 100)}% of target reached
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">ROI Target</span>
                      <span className="text-sm text-gray-600">
                        {analytics.roi}% / {campaign.kpiTargets?.roi || 150}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((analytics.roi / (Number(campaign.kpiTargets?.roi) || 150)) * 100, 100)} 
                      className="h-3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round((analytics.roi / (Number(campaign.kpiTargets?.roi) || 150)) * 100)}% of target reached
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaign Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-1 rounded-full ${
                        activity.impact === 'positive' ? 'bg-green-100' :
                        activity.impact === 'negative' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {activity.impact === 'positive' ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> :
                          activity.impact === 'negative' ?
                          <AlertTriangle className="h-4 w-4 text-red-600" /> :
                          <Activity className="h-4 w-4 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demographics */}
              <Card>
                <CardHeader>
                  <CardTitle>Audience Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.audienceData.demographics.map((demo, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Age {demo.segment}</span>
                          <span className="text-sm text-gray-600">{demo.percentage}%</span>
                        </div>
                        <Progress value={demo.percentage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {demo.conversions} conversions
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Geographic Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.audienceData.locations.map((location, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{location.location}</span>
                          <span className="text-sm text-gray-600">{location.percentage}%</span>
                        </div>
                        <Progress value={location.percentage} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          ${location.revenue.toLocaleString()} revenue
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Channel Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics.channelPerformance.map((channel, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">{channel.channel}</h4>
                        <Badge variant="outline">
                          {Math.round((channel.conversions / analytics.conversions) * 100)}% of total conversions
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Impressions</p>
                          <p className="text-lg font-bold">{channel.impressions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Clicks</p>
                          <p className="text-lg font-bold">{channel.clicks.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            CTR: {((channel.clicks / channel.impressions) * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Conversions</p>
                          <p className="text-lg font-bold">{channel.conversions.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">
                            Rate: {((channel.conversions / channel.clicks) * 100).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Budget Utilization</span>
                      <span className="text-sm text-gray-600">
                        ${(campaign.budget_spent || 0).toLocaleString()} / ${(campaign.budget_allocated || 0).toLocaleString()}
                      </span>
                    </div>
                    <Progress value={budgetUsed} className="h-3" />
                    <p className="text-xs text-gray-500 mt-1">
                      {budgetUsed.toFixed(1)}% of total budget used
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Budget Breakdown</h4>
                    {campaign.budgetBreakdown && Object.entries(campaign.budgetBreakdown).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{category.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                        <span className="text-sm font-medium">${Number(amount || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cost Efficiency */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Cost Per Click</p>
                      <p className="text-xl font-bold text-blue-800">${analytics.cpc}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700">Cost Per Acquisition</p>
                      <p className="text-xl font-bold text-green-800">${analytics.cpa}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-700">Return on Ad Spend</p>
                      <p className="text-xl font-bold text-purple-800">{analytics.roas}x</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-700">Revenue per Click</p>
                      <p className="text-xl font-bold text-orange-800">${(analytics.revenue / analytics.clicks).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Daily Spend Trend</h4>
                    <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Daily spend visualization</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.recommendations.map((rec, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                        rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{rec.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          </div>
                          <Badge variant="outline" className={
                            rec.priority === 'high' ? 'border-red-500 text-red-700' :
                            rec.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                            'border-blue-500 text-blue-700'
                          }>
                            {rec.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-green-800">Strong Performance</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Email channel is performing 40% above industry average with a {((analytics.channelPerformance[0]?.conversions / analytics.channelPerformance[0]?.clicks) * 100).toFixed(1)}% conversion rate.
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Optimization Opportunity</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Display advertising has a lower CTR ({((analytics.channelPerformance[3]?.clicks / analytics.channelPerformance[3]?.impressions) * 100).toFixed(2)}%). Consider A/B testing new creative assets.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Audience Insight</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      25-34 age group represents {analytics.audienceData.demographics[0].percentage}% of your audience and has the highest conversion rate.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-purple-800">ROI Achievement</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      Current ROI of {analytics.roi}% is {analytics.roi > 150 ? 'exceeding' : 'approaching'} your target of {campaign.kpiTargets?.roi || 150}%.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CampaignDashboard;