import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Activity as ActivityIcon, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ImpactMetrics {
  leads_generated?: number;
  roi_improvement?: number;
  cost_saved?: number;
}

interface Activity {
  id: string;
  activity_type: string;
  activity_description: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  impact_metrics: ImpactMetrics | null;
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
        return <span className="text-blue-600">C</span>;
      case 'budget_adjusted':
        return <span className="text-green-600">$</span>;
      case 'ad_copy_generated':
        return <span className="text-purple-600">A</span>;
      case 'targeting_optimized':
        return <span className="text-orange-600">T</span>;
      case 'performance_improved':
        return <span className="text-green-600">P</span>;
      case 'lead_captured':
        return <span className="text-indigo-600">L</span>;
      case 'email_sent':
        return <span className="text-blue-600">E</span>;
      case 'social_post_created':
        return <span className="text-pink-600">S</span>;
      case 'video_generation':
        return <span className="text-purple-600">V</span>;
      default:
        return <span className="text-gray-600">-</span>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'campaign_created':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      case 'budget_adjusted':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'ad_copy_generated':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800';
      case 'targeting_optimized':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800';
      case 'performance_improved':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'lead_captured':
        return 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800';
      case 'email_sent':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      case 'social_post_created':
        return 'bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800';
      case 'video_generation':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700';
    }
  };

  // Human-readable translations for activity types
  const getActivityTranslation = (type: string): { title: string; explanation: string } => {
    const translations: Record<string, { title: string; explanation: string }> = {
      'campaign_created': {
        title: 'New Campaign Created',
        explanation: 'AI set up a new marketing campaign based on your settings'
      },
      'budget_adjusted': {
        title: 'Budget Optimized',
        explanation: 'AI moved budget to better-performing campaigns'
      },
      'budget_reallocated': {
        title: 'Budget Reallocated',
        explanation: 'AI shifted spending to channels with better results'
      },
      'ad_copy_generated': {
        title: 'New Ad Created',
        explanation: 'AI wrote new advertising copy for your campaigns'
      },
      'targeting_optimized': {
        title: 'Audience Improved',
        explanation: 'AI refined who sees your ads based on performance data'
      },
      'performance_improved': {
        title: 'Performance Improved',
        explanation: 'AI made changes that improved your campaign results'
      },
      'lead_captured': {
        title: 'New Lead Captured',
        explanation: 'Someone showed interest in your business'
      },
      'email_sent': {
        title: 'Email Sent',
        explanation: 'AI sent an automated email to leads or customers'
      },
      'social_post_created': {
        title: 'Social Post Created',
        explanation: 'AI created and scheduled a social media post'
      },
      'video_generation': {
        title: 'Video Created',
        explanation: 'AI generated a video ad for your campaign'
      },
      'content_generated': {
        title: 'Content Created',
        explanation: 'AI wrote new marketing content for your campaigns'
      },
      'performance_alert': {
        title: 'Performance Alert',
        explanation: 'AI noticed something important about your results'
      },
      'campaign_adjusted': {
        title: 'Campaign Updated',
        explanation: 'AI made improvements to optimize your campaigns'
      }
    };

    return translations[type] || {
      title: type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      explanation: 'AI performed an optimization action'
    };
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
          Autopilot Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <ActivityIcon className="h-8 w-8 text-purple-500" />
            </div>
            <p className="font-medium text-gray-700 dark:text-gray-300">No activity yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Your AI autopilot will start working soon. Activities like campaign creation, budget optimization, and lead capture will appear here.
            </p>
            <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">What appears here?</p>
              <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                <li>- When AI creates new campaigns</li>
                <li>- When AI optimizes your budget</li>
                <li>- When new leads are captured</li>
                <li>- When AI makes performance improvements</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const translation = getActivityTranslation(activity.activity_type);
              return (
                <div
                  key={activity.id}
                  className={`border rounded-lg p-4 ${getActivityColor(activity.activity_type)}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activity.activity_description}
                        </p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                                <HelpCircle className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs p-3">
                              <p className="font-medium text-sm mb-1">{translation.title}</p>
                              <p className="text-xs text-gray-500">
                                {translation.explanation}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

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
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
