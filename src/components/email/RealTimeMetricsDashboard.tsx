
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { RefreshCw, TrendingUp, Mail, MousePointer, AlertCircle, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealTimeMetricsDashboardProps {
  campaignId: string;
}

const RealTimeMetricsDashboard: React.FC<RealTimeMetricsDashboardProps> = ({ campaignId }) => {
  const [timeRange, setTimeRange] = useState('24h');
  const { metrics, loading, error, refreshMetrics } = useRealTimeMetrics(campaignId, timeRange);

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load metrics: {error}</p>
          <Button onClick={refreshMetrics} className="mt-2">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Real-Time Campaign Metrics</h3>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshMetrics}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && !metrics ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p>Loading real-time metrics...</p>
        </div>
      ) : metrics ? (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Sent</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(metrics.total_sent)}</div>
                <div className="text-sm text-gray-500">
                  {formatPercentage(metrics.delivery_rate)} delivered
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Opened</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(metrics.total_opened)}</div>
                <div className="text-sm text-gray-500">
                  {formatPercentage(metrics.open_rate)} open rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MousePointer className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600">Clicked</span>
                </div>
                <div className="text-2xl font-bold">{formatNumber(metrics.total_clicked)}</div>
                <div className="text-sm text-gray-500">
                  {formatPercentage(metrics.click_rate)} click rate
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Engagement</span>
                </div>
                <div className="text-2xl font-bold">{metrics.engagement_score}</div>
                <div className="text-sm text-gray-500">Overall score</div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Trends Chart */}
          {metrics.trends && metrics.trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opens" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Opens"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Clicks"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {metrics.insights && metrics.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics.insights.map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getInsightColor(insight.type)}`}>
                    <div className="flex items-start space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.metric}
                      </Badge>
                    </div>
                    <p className="font-medium mt-2">{insight.message}</p>
                    <p className="text-sm mt-1 opacity-75">{insight.recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500">
            Last updated: {new Date(metrics.last_updated).toLocaleString()}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default RealTimeMetricsDashboard;
