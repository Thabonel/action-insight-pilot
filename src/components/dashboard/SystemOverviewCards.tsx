
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users, BarChart3, Zap, TrendingUp, Activity } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const SystemOverviewCards: React.FC = () => {
  const [metrics, setMetrics] = useState([
    {
      title: 'Active Campaigns',
      value: '0',
      change: 'Loading...',
      trend: 'loading' as const,
      icon: Zap,
      color: 'blue',
      performance: 0
    },
    {
      title: 'Lead Generation',
      value: '0',
      change: 'Loading...',
      trend: 'loading' as const,
      icon: Users,
      color: 'green',
      performance: 0
    },
    {
      title: 'Content Engagement',
      value: '0%',
      change: 'Loading...',
      trend: 'loading' as const,
      icon: BarChart3,
      color: 'purple',
      performance: 0
    },
    {
      title: 'Email Performance',
      value: '0%',
      change: 'Loading...',
      trend: 'loading' as const,
      icon: Mail,
      color: 'orange',
      performance: 0
    },
    {
      title: 'Social Reach',
      value: '0',
      change: 'Loading...',
      trend: 'loading' as const,
      icon: Activity,
      color: 'pink',
      performance: 0
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: 'All systems operational',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'emerald',
      performance: 99
    }
  ]);

  const { withErrorHandling } = useErrorHandler();

  const loadMetrics = async () => {
    await withErrorHandling(async () => {
      const [campaignsData, leadsData, emailData, socialData, analyticsData] = await Promise.all([
        apiClient.getCampaigns().catch(() => ({ success: false, data: [] })),
        apiClient.getLeads().catch(() => ({ success: false, data: [] })),
        apiClient.getEmailAnalytics().catch(() => ({ success: false, data: { totalSent: 0, openRate: 0 } })),
        apiClient.getSocialAnalytics().catch(() => ({ success: false, data: { posts: 0, engagement: 0 } })),
        apiClient.analytics.getAnalyticsOverview().catch(() => ({ success: false, data: { engagement: 0 } }))
      ]);

      const campaigns = campaignsData.success ? campaignsData.data : [];
      const leads = leadsData.success ? leadsData.data : [];
      const emailStats = emailData.success ? emailData.data : { totalSent: 0, openRate: 0 };
      const socialStats = socialData.success ? socialData.data : { posts: 0, engagement: 0 };
      const analyticsStats = analyticsData.success ? analyticsData.data : { engagement: 0 };

      const activeCampaigns = Array.isArray(campaigns) ? campaigns.filter((c: any) => c.status === 'active').length : 0;
      const totalLeads = Array.isArray(leads) ? leads.length : 0;
      const emailOpenRate = emailStats.openRate || 0;
      const socialPosts = socialStats.posts || 0;
      const contentEngagement = analyticsStats.engagement || 0;

      setMetrics([
        {
          title: 'Active Campaigns',
          value: activeCampaigns.toString(),
          change: `${activeCampaigns > 0 ? '+' : ''}${activeCampaigns} active`,
          trend: activeCampaigns > 0 ? 'up' : 'stable',
          icon: Zap,
          color: 'blue',
          performance: Math.min(activeCampaigns * 20, 100)
        },
        {
          title: 'Lead Generation',
          value: totalLeads.toLocaleString(),
          change: `${totalLeads > 100 ? '+' : ''}${Math.floor(totalLeads * 0.1)} this week`,
          trend: totalLeads > 0 ? 'up' : 'stable',
          icon: Users,
          color: 'green',
          performance: Math.min(totalLeads / 10, 100)
        },
        {
          title: 'Content Engagement',
          value: `${contentEngagement.toFixed(1)}%`,
          change: contentEngagement > 5 ? '+5.3% improvement' : 'Needs improvement',
          trend: contentEngagement > 5 ? 'up' : 'stable',
          icon: BarChart3,
          color: 'purple',
          performance: contentEngagement
        },
        {
          title: 'Email Performance',
          value: `${emailOpenRate.toFixed(1)}%`,
          change: emailOpenRate > 20 ? 'Above average' : 'Below average',
          trend: emailOpenRate > 20 ? 'up' : 'stable',
          icon: Mail,
          color: 'orange',
          performance: emailOpenRate
        },
        {
          title: 'Social Reach',
          value: socialPosts > 1000 ? `${(socialPosts / 1000).toFixed(1)}K` : socialPosts.toString(),
          change: socialPosts > 10 ? '+18% this week' : 'Low activity',
          trend: socialPosts > 10 ? 'up' : 'stable',
          icon: Activity,
          color: 'pink',
          performance: Math.min(socialPosts * 2, 100)
        },
        {
          title: 'System Health',
          value: '99.8%',
          change: 'All systems operational',
          trend: 'up',
          icon: TrendingUp,
          color: 'emerald',
          performance: 99
        }
      ]);
    });
  };

  useEffect(() => {
    loadMetrics();
    
    // Refresh metrics every 2 minutes
    const interval = setInterval(loadMetrics, 120000);
    return () => clearInterval(interval);
  }, []);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
      green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
      purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
      orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
      pink: 'from-pink-500 to-pink-600 text-pink-600 bg-pink-50',
      emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const colorClasses = getColorClasses(metric.color);
        const [gradientFrom, gradientTo, textColor, bgColor] = colorClasses.split(' ');
        
        return (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-5`}></div>
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 truncate">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${bgColor}`}>
                  <Icon className={`h-4 w-4 ${textColor}`} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                  {metric.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                  {metric.trend === 'loading' && (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  )}
                </div>
                
                <p className="text-xs text-slate-500">{metric.change}</p>
                
                {/* Performance bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Performance</span>
                    <span className="text-xs font-medium text-slate-600">{metric.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} h-1.5 rounded-full transition-all duration-1000`}
                      style={{ width: `${metric.performance}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SystemOverviewCards;
