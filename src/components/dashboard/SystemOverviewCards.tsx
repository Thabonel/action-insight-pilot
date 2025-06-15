import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Target, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface SystemMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  conversionRate: number;
  monthlyRevenue: number;
  emailsSent: number;
  socialPosts: number;
  engagementRate: number;
}

const SystemOverviewCards: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalLeads: 0,
    conversionRate: 0,
    monthlyRevenue: 0,
    emailsSent: 0,
    socialPosts: 0,
    engagementRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        setLoading(true);
        
        // Fetch data from multiple endpoints
        const [campaignsRes, leadsRes, emailRes, socialRes] = await Promise.all([
          apiClient.getCampaigns(),
          apiClient.getLeads(),
          apiClient.emailService.getAnalytics(),
          apiClient.socialService.getAnalytics()
        ]);

        const campaigns = campaignsRes.success ? (Array.isArray(campaignsRes.data) ? campaignsRes.data : []) : [];
        const leads = leadsRes.success ? (Array.isArray(leadsRes.data) ? leadsRes.data : []) : [];
        const emailAnalytics = emailRes.success ? emailRes.data : {};
        const socialAnalytics = socialRes.success ? socialRes.data : {};

        setMetrics({
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter((c: any) => c.status === 'active').length,
          totalLeads: leads.length,
          conversionRate: leads.length > 0 ? (leads.filter((l: any) => l.status === 'converted').length / leads.length * 100) : 0,
          monthlyRevenue: campaigns.reduce((sum: number, c: any) => sum + (c.budget_spent || 0), 0),
          emailsSent: emailAnalytics.total_sent || 0,
          socialPosts: socialAnalytics.total_posts || 0,
          engagementRate: socialAnalytics.engagement_rate || 0
        });
      } catch (error) {
        console.error('Error fetching system metrics:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchSystemMetrics();
  }, []);

  const cards = [
    {
      title: 'Active Campaigns',
      value: loading ? '...' : metrics.activeCampaigns.toString(),
      total: loading ? '...' : `of ${metrics.totalCampaigns}`,
      icon: Target,
      trend: '+12%',
      color: 'text-blue-600'
    },
    {
      title: 'Total Leads',
      value: loading ? '...' : metrics.totalLeads.toString(),
      total: `${loading ? '...' : metrics.conversionRate.toFixed(1)}% conversion`,
      icon: Users,
      trend: '+18%',
      color: 'text-green-600'
    },
    {
      title: 'Revenue',
      value: loading ? '...' : `$${metrics.monthlyRevenue.toLocaleString()}`,
      total: 'this month',
      icon: DollarSign,
      trend: '+23%',
      color: 'text-emerald-600'
    },
    {
      title: 'Engagement',
      value: loading ? '...' : `${metrics.engagementRate.toFixed(1)}%`,
      total: `${loading ? '...' : metrics.emailsSent + metrics.socialPosts} interactions`,
      icon: BarChart3,
      trend: '+15%',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="border-0 shadow-sm bg-white/80 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-600">{card.total}</p>
              <div className="flex items-center text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {card.trend}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SystemOverviewCards;
