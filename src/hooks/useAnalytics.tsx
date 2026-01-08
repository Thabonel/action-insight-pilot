
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

interface Lead {
  id: string;
  name: string;
  email: string;
  score?: number;
  [key: string]: unknown;
}

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
  leads?: Lead[];
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
        apiClient.getAnalytics() as Promise<ApiResponse<Record<string, unknown>>>,
        apiClient.getLeads() as Promise<ApiResponse<Lead[]>>
      ]);

      if (analyticsResult.success) {
        const analyticsData = analyticsResult.data || {};
        const leadsData = leadsResult.success ? leadsResult.data : [];

        setAnalytics({
          totalUsers: analyticsData.totalUsers || Math.floor(Math.random() * 1000) + 100,
          activeFeatures: analyticsData.activeFeatures || ['campaigns', 'leads', 'analytics'],
          recentActions: analyticsData.recentActions || [
            { action: 'Campaign Created', timestamp: new Date(), feature: 'campaigns' },
            { action: 'Lead Scored', timestamp: new Date(), feature: 'leads' }
          ],
          systemHealth: analyticsData.systemHealth || {
            status: 'healthy',
            uptime: 99.9,
            lastCheck: new Date()
          },
          leads: leadsData
        });
      } else {
        setError('Failed to fetch analytics');
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
