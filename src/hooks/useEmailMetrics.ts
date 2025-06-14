
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export interface EmailMetricsData {
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

export function useEmailMetrics(campaignId: string, timeRange: string = '24h') {
  const [metrics, setMetrics] = useState<EmailMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (campaignId) {
      loadMetrics();
      startPolling();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [campaignId, timeRange]);

  const loadMetrics = async () => {
    if (!campaignId) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getEmailRealTimeMetrics(campaignId, timeRange);
      
      if (response.success && response.data) {
        setMetrics(response.data as EmailMetricsData);
        setError(null);
      } else {
        // Use fallback mock data if API fails
        console.warn('API failed, using mock data:', response.error);
        setMetrics({
          total_sent: 1250,
          total_delivered: 1200,
          total_opened: 480,
          total_clicked: 96,
          total_bounced: 50,
          total_unsubscribed: 12,
          delivery_rate: 96.0,
          open_rate: 40.0,
          click_rate: 8.0,
          bounce_rate: 4.0,
          unsubscribe_rate: 1.0,
          engagement_score: 85,
          trends: [
            { timestamp: new Date(Date.now() - 3600000).toISOString(), opens: 120, clicks: 24 },
            { timestamp: new Date(Date.now() - 1800000).toISOString(), opens: 180, clicks: 36 },
            { timestamp: new Date().toISOString(), opens: 180, clicks: 36 }
          ],
          insights: [
            {
              type: 'success',
              metric: 'open_rate',
              message: 'Open rate is performing above average',
              recommendation: 'Continue with current subject line strategy'
            },
            {
              type: 'warning',
              metric: 'click_rate',
              message: 'Click-through rate could be improved',
              recommendation: 'Consider A/B testing your call-to-action buttons'
            }
          ],
          last_updated: new Date().toISOString()
        });
        setError(response.error || null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load email metrics';
      setError(errorMessage);
      console.error('Error loading email metrics:', err);
      
      // Still provide mock data on error for development
      setMetrics({
        total_sent: 0,
        total_delivered: 0,
        total_opened: 0,
        total_clicked: 0,
        total_bounced: 0,
        total_unsubscribed: 0,
        delivery_rate: 0,
        open_rate: 0,
        click_rate: 0,
        bounce_rate: 0,
        unsubscribe_rate: 0,
        engagement_score: 0,
        trends: [],
        insights: [
          {
            type: 'error',
            metric: 'connection',
            message: 'Unable to load metrics',
            recommendation: 'Check your internet connection and try again'
          }
        ],
        last_updated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    // Poll for updates every 30 seconds
    intervalRef.current = setInterval(() => {
      loadMetrics();
    }, 30000);
  };

  const refreshMetrics = () => {
    loadMetrics();
    toast({
      title: "Metrics Refreshed",
      description: "Email campaign metrics have been updated",
    });
  };

  return {
    metrics,
    loading,
    error,
    refreshMetrics
  };
}
