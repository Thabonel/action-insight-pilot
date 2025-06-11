
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface RealTimeMetrics {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  engagement_score: number;
  trends: Array<{
    timestamp: string;
    opens: number;
    clicks: number;
  }>;
  insights: Array<{
    type: string;
    metric: string;
    message: string;
    recommendation: string;
  }>;
  last_updated: string;
}

export function useRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    if (!campaignId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.httpClient.request(
        `/api/email/campaigns/${campaignId}/metrics?time_range=${timeRange}`
      );

      if (response.success && response.data) {
        setMetrics(response.data);
      } else {
        const errorMessage = response.error || 'Failed to fetch metrics';
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching real-time metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeUpdates = (intervalMs: number = 30000) => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Initial fetch
    fetchMetrics();
    
    // Set up polling
    intervalRef.current = setInterval(fetchMetrics, intervalMs);
  };

  const stopRealTimeUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const refreshMetrics = () => {
    fetchMetrics();
    toast({
      title: "Metrics Refreshed",
      description: "Real-time metrics have been updated",
    });
  };

  useEffect(() => {
    if (campaignId) {
      startRealTimeUpdates();
    }
    
    return () => {
      stopRealTimeUpdates();
    };
  }, [campaignId, timeRange]);

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
    startRealTimeUpdates,
    stopRealTimeUpdates
  };
}
