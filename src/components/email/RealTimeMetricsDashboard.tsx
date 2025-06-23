
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { 
  BarChart3, 
  TrendingUp, 
  Mail, 
  MousePointer, 
  Eye,
  RefreshCw,
  AlertCircle,
  Clock
} from 'lucide-react';

const RealTimeMetricsDashboard: React.FC = () => {
  const { metrics, loading, error, refetch } = useRealTimeMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading real-time metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load metrics: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            No metrics data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Email Metrics</h2>
          <p className="text-gray-600">Live performance data from your email campaigns</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sent */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.total_sent || metrics.totalSent || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Delivery Rate: {formatPercentage(metrics.delivery_rate || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Total Opened */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opened</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.total_opened || metrics.totalOpened || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Open Rate: {formatPercentage(metrics.open_rate || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Total Clicked */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicked</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.total_clicked || metrics.totalClicks || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Click Rate: {formatPercentage(metrics.click_rate || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Engagement Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.engagement_score || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Overall performance metric
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends Section */}
      {metrics.trends && metrics.trends.sent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {metrics.trends.sent.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-semibold">{formatNumber(value)}</div>
                  <div className="text-sm text-gray-500">Period {index + 1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights Section */}
      {metrics.insights && metrics.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <Badge 
                    variant={insight.impact === 'positive' ? 'default' : 
                            insight.impact === 'negative' ? 'destructive' : 'secondary'}
                  >
                    {insight.type}
                  </Badge>
                  <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {metrics.last_updated && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date(metrics.last_updated).toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default RealTimeMetricsDashboard;
