
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface SystemMetrics {
  campaigns: number;
  leads: number;
  emailsSent: number;
  socialPosts: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  uptime: number;
  lastUpdated: string;
}

export const useSystemMetrics = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        campaignResponse,
        leadResponse,
        emailResponse,
        socialResponse,
        healthResponse
      ] = await Promise.all([
        apiClient.getCampaigns(),
        apiClient.getLeads(),
        apiClient.getEmailAnalytics(),
        apiClient.getAnalytics(),
        apiClient.analytics.getAnalyticsOverview(),
        apiClient.getSystemHealth()
      ]);

      const systemMetrics: SystemMetrics = {
        campaigns: campaignResponse.data?.length || 0,
        leads: leadResponse.data?.length || 0,
        emailsSent: emailResponse.data?.totalSent || 0,
        socialPosts: 0,
        systemHealth: 'healthy',
        uptime: Date.now(),
        lastUpdated: new Date().toISOString()
      };

      setMetrics(systemMetrics);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system metrics';
      setError(errorMessage);
      console.error('System metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
};
