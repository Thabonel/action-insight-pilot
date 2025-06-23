
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface AnalyticsData {
  totalUsers: number;
  activeFeatures: string[];
  recentActions: Array<{
    action: string;
    timestamp: Date;
    feature: string;
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastCheck: Date;
  };
  leads?: any[];
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both analytics and leads data
      const [analyticsResult, leadsResult] = await Promise.all([
        apiClient.getAnalytics(),
        apiClient.getLeads()
      ]);

      if (analyticsResult.success) {
        const analyticsData = analyticsResult.data || {};
        const leadsData = leadsResult.success ? leadsResult.data : [];

        setAnalytics({
          totalUsers: analyticsData.totalUsers || 0,
          activeFeatures: analyticsData.activeFeatures || [],
          recentActions: analyticsData.recentActions || [],
          systemHealth: analyticsData.systemHealth || {
            status: 'healthy',
            uptime: 99.9,
            lastCheck: new Date()
          },
          leads: leadsData
        });
      } else {
        setError(analyticsResult.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};
