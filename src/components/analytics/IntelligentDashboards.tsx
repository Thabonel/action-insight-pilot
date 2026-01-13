
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { DemoDataBadge } from '@/components/common/DemoDataBadge';

const IntelligentDashboards: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'channels' | 'campaigns'>('overview');

  const [overviewData] = useState([
    { month: 'Jan', revenue: 24000, leads: 120, campaigns: 8 },
    { month: 'Feb', revenue: 28500, leads: 145, campaigns: 10 },
    { month: 'Mar', revenue: 32000, leads: 180, campaigns: 12 },
    { month: 'Apr', revenue: 29500, leads: 165, campaigns: 11 },
    { month: 'May', revenue: 38000, leads: 220, campaigns: 15 },
    { month: 'Jun', revenue: 42500, leads: 250, campaigns: 18 }
  ]);

  const [channelData] = useState([
    { channel: 'Email', revenue: 18500, leads: 125, roi: 340 },
    { channel: 'Social', revenue: 12200, leads: 89, roi: 245 },
    { channel: 'Content', revenue: 8900, leads: 67, roi: 189 },
    { channel: 'Paid Ads', revenue: 15600, leads: 95, roi: 298 }
  ]);

  const [conversionData] = useState([
    { name: 'Email Subscribers', value: 45, color: '#3B82F6' },
    { name: 'Social Followers', value: 25, color: '#8B5CF6' },
    { name: 'Direct Traffic', value: 20, color: '#10B981' },
    { name: 'Referrals', value: 10, color: '#F59E0B' }
  ]);

  const [insights] = useState([
    {
      id: 1,
      type: 'trend',
      title: 'Revenue Growth Acceleration',
      description: 'Monthly revenue growth rate increased from 12% to 18%',
      impact: 'positive',
      change: '+6%'
    },
    {
      id: 2,
      type: 'anomaly',
      title: 'Email Open Rate Spike',
      description: 'Email opens 23% higher than usual on Tuesdays',
      impact: 'positive',
      change: '+23%'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Social Engagement Decline',
      description: 'Social media engagement dropped 15% this week',
      impact: 'negative',
      change: '-15%'
    }
  ]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Intelligent Analytics Dashboard</span>
            <DemoDataBadge />
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant={activeView === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('overview')}
            >
              Overview
            </Button>
            <Button
              variant={activeView === 'channels' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('channels')}
            >
              Channels
            </Button>
            <Button
              variant={activeView === 'campaigns' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView('campaigns')}
            >
              Campaigns
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Smart Insights */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">AI-Detected Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((insight) => (
              <div key={insight.id} className={`p-3 rounded-lg ${getImpactColor(insight.impact)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{insight.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {insight.change}
                  </Badge>
                </div>
                <p className="text-xs opacity-80">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Charts */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Performance Trends</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue ($)" />
                  <Line type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={2} name="Leads" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Lead Sources</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={conversionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {conversionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Monthly Campaigns</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={overviewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="campaigns" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeView === 'channels' && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Channel Performance Comparison</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
                <Bar dataKey="roi" fill="#10B981" name="ROI (%)" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 space-y-2">
              {channelData.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{channel.channel}</span>
                  <div className="flex space-x-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">${channel.revenue.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{channel.leads}</div>
                      <div className="text-xs text-gray-500">Leads</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{channel.roi}%</div>
                      <div className="text-xs text-gray-500">ROI</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'campaigns' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign Analytics</h3>
            <p className="text-gray-600 mb-4">Deep dive into individual campaign performance</p>
            <Button>Analyze Campaigns</Button>
          </div>
        )}

        {/* Contextual Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Dashboard Intelligence</h4>
              <p className="text-sm text-blue-700">
                This dashboard adapts to show your most relevant metrics.
                Currently highlighting revenue growth and channel performance based on your recent activity.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntelligentDashboards;
