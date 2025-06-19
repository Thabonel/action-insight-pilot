
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export interface RealTimeMetric {
  id: string;
  entity_type: string;
  entity_id: string;
  metric_type: string;
  value: number;
  change: number;
  timestamp: string;
  unit?: string;
}

export function useRealTimeMetrics(entityType?: string, entityId?: string) {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [entityType, entityId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      let response;
      
      if (entityType && entityId) {
        response = await apiClient.realTimeMetrics.getEntityMetrics(entityType, entityId);
      } else {
        response = await apiClient.realTimeMetrics.getMetrics();
      }
      
      if (response.success && Array.isArray(response.data)) {
        // Safely map the data to RealTimeMetric objects
        const safeMetrics: RealTimeMetric[] = response.data.map((item: any, index: number) => ({
          id: item.id || `metric_${index}`,
          entity_type: item.entity_type || 'unknown',
          entity_id: item.entity_id || 'unknown',
          metric_type: item.metric_type || 'generic',
          value: typeof item.value === 'number' ? item.value : 0,
          change: typeof item.change === 'number' ? item.change : 0,
          timestamp: item.timestamp || new Date().toISOString(),
          unit: item.unit
        }));
        setMetrics(safeMetrics);
      } else {
        setMetrics([]);
      }
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load metrics';
      setError(errorMessage);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = () => {
    loadMetrics();
    toast({
      title: "Metrics Updated",
      description: "Real-time metrics have been refreshed",
    });
  };

  return {
    metrics,
    loading,
    error,
    refreshMetrics
  };
}
