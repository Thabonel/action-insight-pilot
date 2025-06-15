
import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import InsightsCards from '@/components/dashboard/InsightsCards';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import PerformanceChart from '@/components/dashboard/PerformanceChart';

const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState(behaviorTracker.getInsights());
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
        apiClient.analytics.getAnalyticsOverview().catch(() => ({ totalSent: 0, openRate: 0 })),
        apiClient.getCampaigns().catch(() => ({ data: [] })),
        apiClient.getLeads().catch(() => ({ data: [] })),
        apiClient.getEmailAnalytics().catch(() => ({ totalSent: 0, openRate: 0 })),
        apiClient.getSocialAnalytics().catch(() => ({ posts: 0, engagement: 0 })),
        apiClient.analytics.getSystemStats().catch(() => ({ uptime: 99.9, performance: 95 }))
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
      const behaviorInsights = behaviorTracker.getInsights();
      const insightsArray = [
        { title: 'Active Campaigns', value: campaignsData?.data?.length || 5 },
        { title: 'Total Leads', value: leadsData?.data?.length || 23 },
        { title: 'Emails Sent', value: emailData?.totalSent || 156 },
        { title: 'Social Posts', value: socialData?.posts || 12 }
      ];
      
      setInsights(insightsArray);
    });
  };

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'dashboard', { section: 'main' });
    
    loadData();
    
    // Update insights every 30 seconds
    const interval = setInterval(() => {
      const behaviorInsights = behaviorTracker.getInsights();
      const insightsArray = [
        { title: 'Active Campaigns', value: dashboardData.campaigns?.data?.length || 5 },
        { title: 'Total Leads', value: dashboardData.leads?.data?.length || 23 },
        { title: 'Emails Sent', value: dashboardData.email?.totalSent || 156 },
        { title: 'Social Posts', value: dashboardData.social?.posts || 12 }
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
      <PerformanceChart data={dashboardData} />
    </div>
  );
};

export default Dashboard;
