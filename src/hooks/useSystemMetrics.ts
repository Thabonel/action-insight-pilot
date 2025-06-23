
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface SystemMetrics {
  emailMetrics: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
  analyticsOverview: {
    totalCampaigns: number;
    activeLeads: number;
    conversionRate: number;
  };
}

export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch email analytics
      const emailResult = await apiClient.getEmailAnalytics();
      
      // Fetch general analytics
      const analyticsResult = await apiClient.getAnalytics();
      const analyticsOverview = await analyticsResult.data?.getAnalyticsOverview();

      if (emailResult.success && analyticsResult.success) {
        setMetrics({
          emailMetrics: emailResult.data || {
            totalSent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
            openRate: 0,
            clickRate: 0,
            bounceRate: 0
          },
          analyticsOverview: analyticsOverview || {
            totalCampaigns: 0,
            activeLeads: 0,
            conversionRate: 0
          }
        });
      } else {
        setError('Failed to fetch metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};
