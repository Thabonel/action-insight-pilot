
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import InsightsCards, { Insight } from '@/components/dashboard/InsightsCards';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import { Button } from '@/components/ui/button';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const { loading, withErrorHandling } = useErrorHandler();

  useEffect(() => {
    const loadData = async () => {
      await withErrorHandling(async () => {
        const [campaignsRes, leadsRes, socialRes, emailRes, contentRes, perfRes] = await Promise.all([
          apiClient.getCampaigns(),
          apiClient.getLeads(),
          apiClient.getSocialMediaPosts(),
          apiClient.getEmailAnalytics(),
          apiClient.getContentLibrary(),
          apiClient.analytics.getPerformanceMetrics('24h'),
        ]);

        const newInsights: Insight[] = [
          { title: 'Campaigns', value: campaignsRes.success && Array.isArray(campaignsRes.data) ? campaignsRes.data.length : 0 },
          { title: 'Leads', value: leadsRes.success && Array.isArray(leadsRes.data) ? leadsRes.data.length : 0 },
          { title: 'Posts', value: socialRes.success && Array.isArray(socialRes.data) ? socialRes.data.length : 0 },
          { title: 'Emails Sent', value: emailRes.success && emailRes.data && typeof emailRes.data === 'object' && 'totalSent' in emailRes.data ? (emailRes.data as any).totalSent : 0 },
          { title: 'Content Pieces', value: contentRes.success && Array.isArray(contentRes.data) ? contentRes.data.length : 0 },
        ];
        setInsights(newInsights);

        if (perfRes.success) {
          setChartData(perfRes.data);
        }
      });
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [withErrorHandling]);

  const quickActions = [
    { label: 'Create Campaign', onClick: () => navigate('/campaigns/new') },
    { label: 'Analyze Leads', onClick: () => navigate('/leads/analytics') },
    { label: 'Generate Content', onClick: () => navigate('/content/new') },
    { label: 'New Post', onClick: () => navigate('/social/new') },
    { label: 'Email Blast', onClick: () => navigate('/email/new') },
    { label: 'View Analytics', onClick: () => navigate('/analytics') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Marketing Command Center</h1>
        <p className="mt-2 text-slate-600">
          Your intelligent marketing automation platform is learning your patterns and optimizing for success.
        </p>
      </div>

      {/* Insights Cards */}
      <InsightsCards insights={insights} />

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 my-6">
        {quickActions.map(action => (
          <Button key={action.label} onClick={action.onClick} className="w-full">
            {action.label}
          </Button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardChatInterface />
        </div>
        <InsightsPanel insights={insights} />
      </div>

      {/* Performance Chart */}
      {chartData && <PerformanceChart />}
    </div>
  );
};

export default Dashboard;
