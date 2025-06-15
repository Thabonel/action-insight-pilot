
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  campaigns: any[];
  leads: any[];
  emailMetrics: any;
  socialMetrics: any;
  systemHealth: any;
}

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    campaigns: [],
    leads: [],
    emailMetrics: {},
    socialMetrics: {},
    systemHealth: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [campaignsRes, leadsRes, emailRes, socialRes, healthRes] = await Promise.all([
        apiClient.getCampaigns(),
        apiClient.getLeads(),
        apiClient.emailService.getAnalytics(),
        apiClient.socialService.getAnalytics(),
        apiClient.analyticsService.getSystemStats()
      ]);

      setAnalyticsData({
        campaigns: campaignsRes.success ? (Array.isArray(campaignsRes.data) ? campaignsRes.data : []) : [],
        leads: leadsRes.success ? (Array.isArray(leadsRes.data) ? leadsRes.data : []) : [],
        emailMetrics: emailRes.success ? emailRes.data : {},
        socialMetrics: socialRes.success ? socialRes.data : {},
        systemHealth: healthRes.success ? healthRes.data : {}
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
      
      toast({
        title: "Analytics Error",
        description: "Unable to fetch latest analytics data. Showing cached data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'pdf' | 'csv' | 'excel', timeRange: string = '30d') => {
    try {
      await apiClient.analyticsService.exportAnalyticsReport(format, timeRange);
      toast({
        title: "Export Successful",
        description: `Analytics report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export analytics report. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analyticsData,
    loading,
    error,
    refetch: fetchAnalytics,
    exportReport
  };
};
