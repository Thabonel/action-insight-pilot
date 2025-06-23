
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { EmailMetrics } from '@/lib/api-client-interface';

export const useRealTimeMetrics = () => {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getRealTimeMetrics();
      
      if (result.success && result.data) {
        setMetrics(result.data);
      } else {
        setError(result.error || 'Failed to fetch real-time metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    // Set up polling for real-time updates
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
