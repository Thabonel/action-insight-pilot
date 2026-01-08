import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Bell,
  ExternalLink,
  Check,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface MentionMonitoring {
  id: string;
  platform: string;
  post_id: string;
  post_url: string;
  mentioned_handle: string;
  mentioned_by_handle: string;
  post_content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  engagement_stats: {
    likes: number;
    shares: number;
    comments: number;
  };
  is_read: boolean;
  is_responded: boolean;
  discovered_at: string;
}

export const MentionMonitoringDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentions, setMentions] = useState<MentionMonitoring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMentions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      let query = supabase
        .from('mention_monitoring')
        .select('*')
        .eq('user_id', user.id);

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      if (platformFilter !== 'all') {
        query = query.eq('platform', platformFilter);
      }

      query = query.order('discovered_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setMentions(data || []);

      // Fetch unread count
      const { data: countData, error: countError } = await supabase
        .rpc('get_unread_mentions_count', { p_user_id: user.id });

      if (!countError) {
        setUnreadCount(countData || 0);
      }
    } catch (error: unknown) {
      console.error('Error fetching mentions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load mentions';
      toast({
        title: 'Failed to load mentions',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, [user, filter, platformFilter]);

  const markAsRead = async (mentionId: string) => {
    try {
      const { error } = await supabase
        .from('mention_monitoring')
        .update({ is_read: true })
        .eq('id', mentionId);

      if (error) throw error;

      setMentions(prev =>
        prev.map(m => m.id === mentionId ? { ...m, is_read: true } : m)
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

      toast({
        title: 'Marked as read',
        description: 'Mention has been marked as read'
      });
    } catch (error: unknown) {
      console.error('Error marking as read:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark as read';
      toast({
        title: 'Failed to mark as read',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const markAsResponded = async (mentionId: string) => {
    try {
      const { error } = await supabase
        .from('mention_monitoring')
        .update({ is_responded: true, is_read: true })
        .eq('id', mentionId);

      if (error) throw error;

      setMentions(prev =>
        prev.map(m => m.id === mentionId ? { ...m, is_responded: true, is_read: true } : m)
      );

      toast({
        title: 'Marked as responded',
        description: 'Mention has been marked as responded'
      });
    } catch (error: unknown) {
      console.error('Error marking as responded:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark as responded';
      toast({
        title: 'Failed to mark as responded',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <Meh className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <Badge className="bg-green-100 text-green-700">Positive</Badge>;
      case 'negative':
        return <Badge className="bg-red-100 text-red-700">Negative</Badge>;
      default:
        return <Badge variant="secondary">Neutral</Badge>;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return 'bg-blue-100 text-blue-700';
      case 'facebook':
        return 'bg-indigo-100 text-indigo-700';
      case 'linkedin':
        return 'bg-cyan-100 text-cyan-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Brand Mentions
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-700">
                {unreadCount} unread
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMentions}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="all">All Mentions</TabsTrigger>
            </TabsList>

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
            </div>
          </div>

          <TabsContent value={filter} className="space-y-3">
            {mentions.length === 0 ? (
              <div className="text-center p-12 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No mentions found</p>
                <p className="text-sm mt-1">
                  {filter === 'unread'
                    ? "You're all caught up!"
                    : "Brand mentions will appear here when discovered"}
                </p>
              </div>
            ) : (
              mentions.map((mention) => (
                <div
                  key={mention.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    !mention.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPlatformColor(mention.platform)}>
                          {mention.platform}
                        </Badge>
                        {getSentimentBadge(mention.sentiment)}
                        {mention.is_responded && (
                          <Badge variant="outline" className="text-green-700 border-green-300">
                            Responded
                          </Badge>
                        )}
                        {!mention.is_read && (
                          <Badge className="bg-blue-600 text-white">New</Badge>
                        )}
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          @{mention.mentioned_by_handle}
                        </span>
                        <span className="text-gray-500 text-sm">
                          mentioned @{mention.mentioned_handle}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {mention.post_content}
                      </p>

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {mention.engagement_stats?.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {mention.engagement_stats?.comments || 0}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(mention.discovered_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(mention.post_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      {!mention.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(mention.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {!mention.is_responded && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => markAsResponded(mention.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Responded
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
