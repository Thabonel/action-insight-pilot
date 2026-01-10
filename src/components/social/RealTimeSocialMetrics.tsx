
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSocialRealTimeMetrics } from '@/hooks/useSocialRealTimeMetrics';

interface RealTimeSocialMetricsProps {
  postIds: string[];
  showAggregated?: boolean;
}

const RealTimeSocialMetrics: React.FC<RealTimeSocialMetricsProps> = ({ 
  postIds, 
  showAggregated = false 
}) => {
  const { 
    metricsData, 
    isConnected, 
    error, 
    getAllMetrics, 
    refreshMetrics 
  } = useSocialRealTimeMetrics(postIds);

  const aggregatedMetrics = getAllMetrics().reduce((acc, metrics) => ({
    likes: acc.likes + metrics.likes,
    comments: acc.comments + metrics.comments,
    shares: acc.shares + metrics.shares,
    views: acc.views + metrics.views,
    reach: acc.reach + metrics.reach,
    avgEngagementRate: (acc.avgEngagementRate + metrics.engagement_rate) / 2
  }), { likes: 0, comments: 0, shares: 0, views: 0, reach: 0, avgEngagementRate: 0 });

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementColor = (rate: number): string => {
    if (rate >= 5) return 'text-green-600';
    if (rate >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-700">
            <span>Real-time metrics unavailable: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <span className="text-sm text-green-600">Live Metrics Connected</span>
          ) : (
            <span className="text-sm text-gray-400">Connecting...</span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshMetrics}
          disabled={!isConnected}
        >
          Refresh
        </Button>
      </div>

      {/* Aggregated Metrics */}
      {showAggregated && getAllMetrics().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Total Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-pink-600 mb-1">
                  <span className="text-sm font-medium">Likes</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(aggregatedMetrics.likes)}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                  <span className="text-sm font-medium">Comments</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(aggregatedMetrics.comments)}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                  <span className="text-sm font-medium">Shares</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(aggregatedMetrics.shares)}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                  <span className="text-sm font-medium">Views</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(aggregatedMetrics.views)}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
                  <span className="text-sm font-medium">Reach</span>
                </div>
                <p className="text-2xl font-bold">{formatNumber(aggregatedMetrics.reach)}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="text-sm font-medium">Engagement</span>
                </div>
                <p className={`text-2xl font-bold ${getEngagementColor(aggregatedMetrics.avgEngagementRate)}`}>
                  {aggregatedMetrics.avgEngagementRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Post Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {postIds.map(postId => {
          const metrics = metricsData[postId];
          
          if (!metrics) {
            return (
              <Card key={postId} className="opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center text-gray-400">
                    <span>Loading metrics for post {postId}...</span>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={postId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Post {postId.slice(-8)}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {metrics.platform}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-pink-600">Likes:</span>
                    <span className="text-sm">{formatNumber(metrics.likes)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-blue-600">Comments:</span>
                    <span className="text-sm">{formatNumber(metrics.comments)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">Shares:</span>
                    <span className="text-sm">{formatNumber(metrics.shares)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-purple-600">Views:</span>
                    <span className="text-sm">{formatNumber(metrics.views)}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engagement Rate</span>
                    <span className={`text-sm font-medium ${getEngagementColor(metrics.engagement_rate)}`}>
                      {metrics.engagement_rate.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-600">Reach</span>
                    <span className="text-sm">{formatNumber(metrics.reach)}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 pt-1">
                  Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Data State */}
      {postIds.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Posts to Monitor</h3>
            <p className="text-gray-500">
              Create some social media posts to see real-time metrics here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeSocialMetrics;
