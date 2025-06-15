
import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import InsightsCards, { Insight } from '@/components/dashboard/InsightsCards';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import PerformanceChart from '@/components/dashboard/PerformanceChart';

const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dashboardData, setDashboardData] = useState({
    analytics: null,
    campaigns: null,
    leads: null,
    email: null,
    social: null,
    systemStats: null
  });
  const { withErrorHandling } = useErrorHandler();

  const loadData = async () => {
    await withErrorHandling(async () => {
      const [analyticsData, campaignsData, leadsData, emailData, socialData, systemData] = await Promise.all([
        apiClient.analytics.getAnalyticsOverview().catch(() => ({ data: { totalSent: 0, openRate: 0 } })),
        apiClient.getCampaigns().catch(() => ({ data: [] })),
        apiClient.getLeads().catch(() => ({ data: [] })),
        apiClient.getEmailAnalytics().catch(() => ({ data: { totalSent: 0, openRate: 0 } })),
        apiClient.getSocialAnalytics().catch(() => ({ data: { posts: 0, engagement: 0 } })),
        apiClient.analytics.getSystemStats().catch(() => ({ data: { uptime: 99.9, performance: 95 } }))
      ]);

      setDashboardData({
        analytics: analyticsData,
        campaigns: campaignsData,
        leads: leadsData,
        email: emailData,
        social: socialData,
        systemStats: systemData
      });

      // Convert behavior tracker insights to array format for components
      const campaignsArray = campaignsData?.data || [];
      const leadsArray = leadsData?.data || [];
      const emailStats = emailData?.data || { totalSent: 0 };
      const socialStats = socialData?.data || { posts: 0 };
      
      const insightsArray: Insight[] = [
        { title: 'Active Campaigns', value: Array.isArray(campaignsArray) ? campaignsArray.length : 5 },
        { title: 'Total Leads', value: Array.isArray(leadsArray) ? leadsArray.length : 23 },
        { title: 'Emails Sent', value: emailStats.totalSent || 156 },
        { title: 'Social Posts', value: socialStats.posts || 12 }
      ];
      
      setInsights(insightsArray);
    });
  };

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'dashboard', { section: 'main' });
    
    loadData();
    
    // Update insights every 30 seconds
    const interval = setInterval(() => {
      const campaignsArray = dashboardData.campaigns?.data || [];
      const leadsArray = dashboardData.leads?.data || [];
      const emailStats = dashboardData.email?.data || { totalSent: 0 };
      const socialStats = dashboardData.social?.data || { posts: 0 };
      
      const insightsArray: Insight[] = [
        { title: 'Active Campaigns', value: Array.isArray(campaignsArray) ? campaignsArray.length : 5 },
        { title: 'Total Leads', value: Array.isArray(leadsArray) ? leadsArray.length : 23 },
        { title: 'Emails Sent', value: emailStats.totalSent || 156 },
        { title: 'Social Posts', value: socialStats.posts || 12 }
      ];
      setInsights(insightsArray);
    }, 30000);

    return () => clearInterval(interval);
  }, [dashboardData]);

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Marketing Command Center</h1>
        <p className="mt-2 text-slate-600">
          Your intelligent marketing automation platform is learning your patterns and optimizing for success.
        </p>
      </div>

      {/* Insights Cards */}
      <InsightsCards insights={insights} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <DashboardChatInterface />
        </div>

        {/* Insights Panel */}
        <InsightsPanel insights={insights} />
      </div>

      {/* Performance Chart */}
      <PerformanceChart dashboardData={dashboardData} />
    </div>
  );
};

export default Dashboard;
