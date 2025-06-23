import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { TrendingUp, TrendingDown, Mail, MousePointer, Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealTimeMetricsDashboardProps {
  campaignId?: string;
}

const RealTimeMetricsDashboard: React.FC<RealTimeMetricsDashboardProps> = ({ campaignId }) => {
  const { metrics, loading, error, refetch } = useRealTimeMetrics();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>Metrics Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No metrics data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const calculateRate = (numerator: number, denominator: number) => {
    return denominator > 0 ? ((numerator / denominator) * 100).toFixed(1) : '0.0';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Real-Time Email Metrics</span>
          {campaignId && (
            <Badge variant="outline">Campaign: {campaignId}</Badge>
          )}
          <Button onClick={refetch} variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Email Sent */}
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.total_sent || metrics.totalSent || 0)}
              </p>
            </div>
          </div>

          {/* Email Opens */}
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Opens</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.total_opened || metrics.totalOpened || 0)}
              </p>
              <p className="text-sm text-green-600">
                {calculateRate(
                  metrics.total_opened || metrics.totalOpened || 0,
                  metrics.total_sent || metrics.totalSent || 0
                )}% open rate
              </p>
            </div>
          </div>

          {/* Email Clicks */}
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MousePointer className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.total_clicked || metrics.totalClicks || 0)}
              </p>
              <p className="text-sm text-purple-600">
                {calculateRate(
                  metrics.total_clicked || metrics.totalClicks || 0,
                  metrics.total_sent || metrics.totalSent || 0
                )}% click rate
              </p>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        {metrics.insights && metrics.insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Performance Insights</h4>
            {metrics.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
                {insight.impact === 'positive' ? (
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                ) : insight.impact === 'negative' ? (
                  <TrendingDown className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <div className="h-5 w-5 bg-gray-400 rounded-full mt-0.5" />
                )}
                <div>
                  <Badge 
                    variant={
                      insight.impact === 'positive' ? 'default' : 
                      insight.impact === 'negative' ? 'destructive' : 'secondary'
                    }
                    className="mb-1"
                  >
                    {insight.type}
                  </Badge>
                  <p className="text-sm text-gray-700">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trends Chart */}
        {metrics.trends && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">24-Hour Trends</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.trends.sent?.map((value, index) => ({
                  time: index,
                  sent: value,
                  opened: metrics.trends?.opened?.[index] || 0,
                  clicked: metrics.trends?.clicked?.[index] || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicked" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {metrics.last_updated && (
          <p className="text-xs text-gray-500 mt-4">
            Last updated: {new Date(metrics.last_updated).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeMetricsDashboard;
