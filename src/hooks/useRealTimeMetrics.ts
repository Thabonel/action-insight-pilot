
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import type { RealTimeMetric } from '@/lib/api/real-time-metrics-service';

export function useRealTimeMetrics(entityType?: string, entityId?: string) {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (entityType && entityId) {
      loadMetrics();
      startPolling();
    } else {
      loadDashboardMetrics();
      startPolling();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [entityType, entityId]);

  const loadMetrics = async () => {
    if (!entityType || !entityId) return;
    
    try {
      setIsLoading(true);
      const response = await apiClient.realTimeMetrics.getEntityMetrics(entityType, entityId);
      if (response.success && response.data) {
        setMetrics(response.data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
      console.error('Error loading metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.realTimeMetrics.getDashboardMetrics();
      if (response.success && response.data) {
        // Flatten all metrics from different entities
        const allMetrics = Object.values(response.data).flat();
        setMetrics(allMetrics);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
      console.error('Error loading dashboard metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = () => {
    // Poll for updates every 30 seconds
    intervalRef.current = setInterval(() => {
      if (entityType && entityId) {
        loadMetrics();
      } else {
        loadDashboardMetrics();
      }
    }, 30000);
  };

  const getMetricByType = (metricType: string): RealTimeMetric | undefined => {
    return metrics.find(metric => metric.metric_type === metricType);
  };

  const getMetricValue = (metricType: string): number => {
    const metric = getMetricByType(metricType);
    return metric?.current_value || 0;
  };

  const getMetricChange = (metricType: string): number => {
    const metric = getMetricByType(metricType);
    return metric?.change_percentage || 0;
  };

  return {
    metrics,
    isLoading,
    error,
    getMetricByType,
    getMetricValue,
    getMetricChange,
    reload: entityType && entityId ? loadMetrics : loadDashboardMetrics
  };
}
