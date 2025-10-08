import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  TrendingUp,
  FileText,
  Target,
  DollarSign,
  Users,
  Mail,
  Share2,
  Clock,
  Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id: string;
  activity_type: string;
  activity_description: string;
  entity_type: string;
  entity_id: string;
  metadata: any;
  impact_metrics: any;
  created_at: string;
}

const ActivityFeed: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();

      // Set up realtime subscription for new activities
      const subscription = supabase
        .channel('autopilot-activities')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'autopilot_activity_log',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setActivities((prev) => [payload.new as Activity, ...prev]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('autopilot_activity_log')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_created':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'budget_adjusted':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'ad_copy_generated':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'targeting_optimized':
        return <Target className="h-4 w-4 text-orange-600" />;
      case 'performance_improved':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'lead_captured':
        return <Users className="h-4 w-4 text-indigo-600" />;
      case 'email_sent':
        return <Mail className="h-4 w-4 text-blue-600" />;
      case 'social_post_created':
        return <Share2 className="h-4 w-4 text-pink-600" />;
      case 'video_generation':
        return <Video className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'campaign_created':
        return 'bg-blue-50 border-blue-200';
      case 'budget_adjusted':
        return 'bg-green-50 border-green-200';
      case 'ad_copy_generated':
        return 'bg-purple-50 border-purple-200';
      case 'targeting_optimized':
        return 'bg-orange-50 border-orange-200';
      case 'performance_improved':
        return 'bg-green-50 border-green-200';
      case 'lead_captured':
        return 'bg-indigo-50 border-indigo-200';
      case 'email_sent':
        return 'bg-blue-50 border-blue-200';
      case 'social_post_created':
        return 'bg-pink-50 border-pink-200';
      case 'video_generation':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-gray-500">
          Loading activity...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Autopilot Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No activity yet</p>
            <p className="text-sm">Your AI autopilot will start working soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`border rounded-lg p-4 ${getActivityColor(activity.activity_type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.activity_description}
                    </p>

                    {/* Impact Metrics */}
                    {activity.impact_metrics && Object.keys(activity.impact_metrics).length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {activity.impact_metrics.leads_generated && (
                          <Badge variant="secondary" className="text-xs">
                            +{activity.impact_metrics.leads_generated} leads
                          </Badge>
                        )}
                        {activity.impact_metrics.roi_improvement && (
                          <Badge variant="secondary" className="text-xs">
                            +{activity.impact_metrics.roi_improvement}% ROI
                          </Badge>
                        )}
                        {activity.impact_metrics.cost_saved && (
                          <Badge variant="secondary" className="text-xs">
                            ${activity.impact_metrics.cost_saved} saved
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(activity.created_at)}
                      </p>
                      {activity.entity_type && (
                        <Badge variant="outline" className="text-xs">
                          {activity.entity_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
