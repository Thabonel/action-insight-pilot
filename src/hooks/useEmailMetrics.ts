
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { EmailMetrics } from '@/lib/api-client-interface';

export const useEmailMetrics = () => {
  const [metrics, setMetrics] = useState<EmailMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.getRealTimeMetrics();
      
      if (result.success && result.data) {
        setMetrics(result.data);
      } else {
        setError(result.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
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
