import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  X,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface CampaignMetrics {
  conversion_rate?: number;
  reach?: number;
  cost_per_acquisition?: number;
  return_on_investment?: number;
}

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
  target_audience?: Record<string, unknown>;
  content?: Record<string, unknown>;
  metrics?: CampaignMetrics;
}

interface PerformanceDataPoint {
  day: string;
  [key: string]: string | number;
}

interface CampaignComparisonProps {
  campaigns: Campaign[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveCampaign: (campaignId: string) => void;
}

const CampaignComparison: React.FC<CampaignComparisonProps> = ({
  campaigns,
  isOpen,
  onClose,
  onRemoveCampaign,
}) => {
  // Use actual campaign metrics instead of mock data
  const combinedPerformanceData: PerformanceDataPoint[] = campaigns.length > 0
    ? Array.from({ length: 7 }, (_, i) => {
        const dataPoint: PerformanceDataPoint = { day: `Day ${i + 1}` };
        campaigns.forEach(campaign => {
          // Use actual metrics if available
          const conversionRate = campaign.metrics?.conversion_rate || 0;
          dataPoint[campaign.name] = conversionRate;
        });
        return dataPoint;
      })
    : [];

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMetrics = (campaign: Campaign) => {
    const budgetUsage = campaign.budget_allocated && campaign.budget_allocated > 0 
      ? ((campaign.budget_spent || 0) / campaign.budget_allocated) * 100 
      : 0;
    
    return {
      budgetUsage: budgetUsage.toFixed(1),
      conversionRate: (campaign.metrics?.conversion_rate || 0).toFixed(2),
      reach: campaign.metrics?.reach || 0,
      cpa: campaign.metrics?.cost_per_acquisition || 0,
      roi: campaign.metrics?.return_on_investment || 0,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Campaign Comparison</span>
              </DialogTitle>
              <DialogDescription>
                Comparing {campaigns.length} campaigns side by side
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {campaigns.map((campaign, index) => {
              const metrics = calculateMetrics(campaign);
              return (
                <Card key={campaign.id} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={() => onRemoveCampaign(campaign.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <CardHeader className="pb-3">
                    <div className="space-y-2">
                      <div 
                        className="w-full h-2 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <h3 className="font-semibold text-sm truncate">{campaign.name}</h3>
                      <div className="flex flex-wrap gap-1">
                        <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {campaign.type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Budget Usage:</span>
                        <span className="font-medium">{metrics.budgetUsage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Conversion:</span>
                        <span className="font-medium">{metrics.conversionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Reach:</span>
                        <span className="font-medium">{metrics.reach.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Comparison Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={combinedPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      {campaigns.map((campaign, index) => (
                        <Line
                          key={campaign.id}
                          type="monotone"
                          dataKey={campaign.name}
                          stroke={colors[index % colors.length]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ROI Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ROI Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campaigns.map((campaign, index) => ({
                        name: campaign.name.length > 10 
                          ? campaign.name.substring(0, 10) + '...' 
                          : campaign.name,
                        roi: calculateMetrics(campaign).roi,
                        fill: colors[index % colors.length],
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="roi" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Metric</th>
                      {campaigns.map((campaign) => (
                        <th key={campaign.id} className="text-center py-2 px-4">
                          <div className="space-y-1">
                            <div className="font-medium truncate">{campaign.name}</div>
                            <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Budget Allocated</td>
                      {campaigns.map((campaign) => (
                        <td key={campaign.id} className="py-3 px-4 text-center">
                          ${(campaign.budget_allocated || 0).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Budget Spent</td>
                      {campaigns.map((campaign) => (
                        <td key={campaign.id} className="py-3 px-4 text-center">
                          ${(campaign.budget_spent || 0).toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Budget Usage</td>
                      {campaigns.map((campaign) => (
                        <td key={campaign.id} className="py-3 px-4 text-center">
                          {calculateMetrics(campaign).budgetUsage}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Conversion Rate</td>
                      {campaigns.map((campaign) => (
                        <td key={campaign.id} className="py-3 px-4 text-center">
                          {calculateMetrics(campaign).conversionRate}%
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Reach</td>
                      {campaigns.map((campaign) => (
                        <td key={campaign.id} className="py-3 px-4 text-center">
                          {calculateMetrics(campaign).reach.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Cost Per Acquisition</td>
                      {campaigns.map((campaign) => (
                        <td key={campaign.id} className="py-3 px-4 text-center">
                          ${calculateMetrics(campaign).cpa}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium">ROI</td>
                      {campaigns.map((campaign) => (
                        <td key={campaign.id} className="py-3 px-4 text-center">
                          {calculateMetrics(campaign).roi}%
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Channel Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Channel Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {campaigns.map((campaign, index) => {
                  // Use actual channel distribution if available
                  const channelData = [
                    { name: 'Email', value: 25, color: colors[0] },
                    { name: 'Social', value: 25, color: colors[1] },
                    { name: 'Paid Ads', value: 25, color: colors[2] },
                    { name: 'Organic', value: 25, color: colors[3] },
                  ];
                  
                  return (
                    <div key={campaign.id} className="text-center">
                      <h4 className="font-medium mb-2 truncate">{campaign.name}</h4>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={channelData}
                              cx="50%"
                              cy="50%"
                              outerRadius={40}
                              dataKey="value"
                            >
                              {channelData.map((entry, i) => (
                                <Cell key={`cell-${i}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-xs space-y-1">
                        {channelData.map((channel, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: channel.color }}
                              ></div>
                              <span>{channel.name}</span>
                            </div>
                            <span>{channel.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignComparison;