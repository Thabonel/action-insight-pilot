import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Hash,
  TrendingUp,
  BarChart3,
  Loader2,
  Sparkles
} from 'lucide-react';

interface HashtagSuggestion {
  id: string;
  hashtag: string;
  platform: string;
  usage_count: number;
  avg_engagement_rate: number | null;
  last_used_at: string;
  ai_generated: boolean;
  ai_confidence_score: number | null;
}

interface HashtagAnalytics {
  id: string;
  period_start: string;
  period_end: string;
  platform: string;
  tag_text: string;
  usage_count: number;
  total_reach: number;
  total_impressions: number;
  total_engagement: number;
  avg_engagement_rate: number;
}

export const HashtagAnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [topHashtags, setTopHashtags] = useState<HashtagSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<HashtagAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch top hashtags by engagement
      let hashtagQuery = supabase
        .from('hashtag_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('avg_engagement_rate', { ascending: false, nullsLast: true })
        .order('usage_count', { ascending: false });

      if (platformFilter !== 'all') {
        hashtagQuery = hashtagQuery.eq('platform', platformFilter);
      }

      hashtagQuery = hashtagQuery.limit(20);

      const { data: hashtagData, error: hashtagError } = await hashtagQuery;

      if (hashtagError) throw hashtagError;

      setTopHashtags(hashtagData || []);

      // Fetch analytics data
      let analyticsQuery = supabase
        .from('mention_analytics')
        .select('*')
        .eq('user_id', user.id)
        .eq('tag_type', 'hashtag')
        .order('period_start', { ascending: false });

      if (platformFilter !== 'all') {
        analyticsQuery = analyticsQuery.eq('platform', platformFilter);
      }

      analyticsQuery = analyticsQuery.limit(50);

      const { data: analyticsData, error: analyticsError } = await analyticsQuery;

      if (analyticsError) throw analyticsError;

      setAnalytics(analyticsData || []);
    } catch (error: unknown) {
      console.error('Error fetching hashtag analytics:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics';
      toast({
        title: 'Failed to load analytics',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, platformFilter]);

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'bg-blue-100 text-blue-700';
      case 'facebook':
        return 'bg-indigo-100 text-indigo-700';
      case 'linkedin':
        return 'bg-cyan-100 text-cyan-700';
      case 'instagram':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEngagementColor = (rate: number | null) => {
    if (!rate) return 'text-gray-500';
    if (rate >= 5) return 'text-green-600';
    if (rate >= 2) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Hashtags Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-purple-600" />
              Top Performing Hashtags
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={platformFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformFilter('all')}
              >
                All Platforms
              </Button>
              <Button
                variant={platformFilter === 'twitter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformFilter('twitter')}
              >
                Twitter
              </Button>
              <Button
                variant={platformFilter === 'facebook' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformFilter('facebook')}
              >
                Facebook
              </Button>
              <Button
                variant={platformFilter === 'linkedin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformFilter('linkedin')}
              >
                LinkedIn
              </Button>
              <Button
                variant={platformFilter === 'instagram' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlatformFilter('instagram')}
              >
                Instagram
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {topHashtags.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Hash className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hashtags yet</p>
              <p className="text-sm mt-1">
                Start using hashtags in your posts to see performance data
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topHashtags.map((hashtag, index) => (
                <div
                  key={hashtag.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Rank */}
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        index < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <span className="font-bold text-sm">#{index + 1}</span>
                      </div>

                      {/* Hashtag */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg text-purple-700">
                            {hashtag.hashtag}
                          </span>
                          <Badge className={getPlatformColor(hashtag.platform)}>
                            {hashtag.platform}
                          </Badge>
                          {hashtag.ai_generated && (
                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                              <Sparkles className="h-3 w-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Used {hashtag.usage_count}x</span>
                          {hashtag.avg_engagement_rate !== null && (
                            <span className={getEngagementColor(hashtag.avg_engagement_rate)}>
                              <TrendingUp className="h-3 w-3 inline mr-1" />
                              {hashtag.avg_engagement_rate.toFixed(2)}% engagement
                            </span>
                          )}
                          <span className="text-xs">
                            Last used: {new Date(hashtag.last_used_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Performance Indicator */}
                      {hashtag.avg_engagement_rate !== null && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getEngagementColor(hashtag.avg_engagement_rate)}`}>
                            {hashtag.avg_engagement_rate >= 5 ? '🔥' :
                             hashtag.avg_engagement_rate >= 2 ? '📈' : '📊'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Timeline Card */}
      {analytics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Performance Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.map((analytic) => (
                <div
                  key={analytic.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-purple-700">
                          {analytic.tag_text}
                        </span>
                        <Badge className={getPlatformColor(analytic.platform)}>
                          {analytic.platform}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Used {analytic.usage_count}x</span>
                        <span className={getEngagementColor(analytic.avg_engagement_rate)}>
                          {analytic.avg_engagement_rate.toFixed(2)}% engagement
                        </span>
                        <span className="text-xs">
                          {new Date(analytic.period_start).toLocaleDateString()} -
                          {new Date(analytic.period_end).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Pro Tips</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Hashtags with 🔥 (5%+ engagement) are performing exceptionally well</li>
                <li>• AI-generated hashtags are tested for relevance and trending potential</li>
                <li>• Mix broad and niche hashtags for maximum reach</li>
                <li>• Monitor performance weekly to identify what resonates with your audience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
