
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Mail, MousePointer, Target, Clock } from 'lucide-react';

const EmailPerformanceDashboard: React.FC = () => {
  const [metrics] = useState({
    totalSent: 12450,
    avgOpenRate: 32.4,
    avgClickRate: 4.8,
    conversionRate: 2.1,
    unsubscribeRate: 0.3
  });

  const [campaignData] = useState([
    { name: 'Newsletter #34', opens: 35.2, clicks: 5.1, conversions: 2.8, sent: 1250 },
    { name: 'Product Update', opens: 28.7, clicks: 3.9, conversions: 1.9, sent: 980 },
    { name: 'Educational #12', opens: 42.1, clicks: 6.3, conversions: 3.2, sent: 1100 },
    { name: 'Promotional', opens: 25.4, clicks: 2.8, conversions: 1.2, sent: 1400 },
    { name: 'Welcome Series', opens: 48.2, clicks: 8.1, conversions: 4.5, sent: 850 }
  ]);

  const [timeData] = useState([
    { hour: '6 AM', opens: 12, clicks: 2 },
    { hour: '8 AM', opens: 28, clicks: 4 },
    { hour: '10 AM', opens: 45, clicks: 8 },
    { hour: '12 PM', opens: 38, clicks: 6 },
    { hour: '2 PM', opens: 42, clicks: 7 },
    { hour: '4 PM', opens: 35, clicks: 5 },
    { hour: '6 PM', opens: 25, clicks: 3 },
    { hour: '8 PM', opens: 18, clicks: 2 }
  ]);

  // Ensure all arrays are safely handled
  const safeCampaignData = Array.isArray(campaignData) ? campaignData : [];
  const safeTimeData = Array.isArray(timeData) ? timeData : [];

  const getPerformanceBadge = (rate: number, type: 'open' | 'click' | 'conversion') => {
    const thresholds = {
      open: { good: 30, excellent: 40 },
      click: { good: 3, excellent: 6 },
      conversion: { good: 2, excellent: 4 }
    };
    
    const threshold = thresholds[type];
    if (rate >= threshold.excellent) return { variant: 'default' as const, label: 'Excellent' };
    if (rate >= threshold.good) return { variant: 'secondary' as const, label: 'Good' };
    return { variant: 'destructive' as const, label: 'Needs Work' };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span>Email Performance Dashboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Mail className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-900">{metrics.totalSent.toLocaleString()}</div>
            <div className="text-xs text-blue-700">Emails Sent</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{metrics.avgOpenRate}%</div>
            <div className="text-xs text-green-700">Avg Open Rate</div>
            <Badge {...getPerformanceBadge(metrics.avgOpenRate, 'open')} className="mt-1 text-xs">
              {getPerformanceBadge(metrics.avgOpenRate,Gon'open').label}
            </Badge>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <MousePointer className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-900">{metrics.avgClickRate}%</div>
            <div className="text-xs text-purple-700">Avg Click Rate</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <Target className="h-6 w-6 text-orange-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-orange-900">{metrics.conversionRate}%</div>
            <div className="text-xs text-orange-700">Conversion Rate</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-900">{metrics.unsubscribeRate}%</div>
            <div className="text-xs text-red-700">Unsubscribe Rate</div>
          </div>
        </div>

        {/* Campaign Performance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Campaign Performance</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={safeCampaignData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="opens" fill="#3B82F6" name="Open Rate %" />
              <Bar dataKey="clicks" fill="#8B5CF6" name="Click Rate %" />
              <Bar dataKey="conversions" fill="#10B981" name="Conversion Rate %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement by Time */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Engagement by Time of Day</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={safeTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="opens" stroke="#3B82F6" strokeWidth={2} name="Opens" />
              <Line type="monotone" dataKey="clicks" stroke="#8B5CF6" strokeWidth={2} name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign List */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Campaigns</h4>
          <div className="space-y-2">
            {safeCampaignData.map((campaign, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{campaign.name}</span>
                  <div className="text-sm text-gray-600">{campaign.sent} recipients</div>
                </div>
                <div className="flex space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{campaign.opens}%</div>
                    <div className="text-xs text-gray-500">Opens</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{campaign.clicks}%</div>
                    <div className="text-xs text-gray-500">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{campaign.conversions}%</div>
                    <div className="text-xs text-gray-500">Conversions</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailPerformanceDashboard;
