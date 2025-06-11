
import { HttpClient } from '../http-client';

export interface RealTimeMetric {
  id: string;
  entity_type: string;
  entity_id: string;
  metric_type: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  recorded_at: string;
}

export class RealTimeMetricsService {
  constructor(private httpClient: HttpClient) {}

  async getEntityMetrics(entityType: string, entityId: string) {
    return this.httpClient.request<RealTimeMetric[]>(`/api/metrics/${entityType}/${entityId}`);
  }

  async getMetricHistory(entityType: string, entityId: string, metricType: string, timeRange: string = '24h') {
    return this.httpClient.request<RealTimeMetric[]>(`/api/metrics/${entityType}/${entityId}/${metricType}/history?range=${timeRange}`);
  }

  async recordMetric(entityType: string, entityId: string, metricType: string, value: number) {
    return this.httpClient.request<RealTimeMetric>('/api/metrics/record', {
      method: 'POST',
      body: JSON.stringify({
        entity_type: entityType,
        entity_id: entityId,
        metric_type: metricType,
        current_value: value
      }),
    });
  }

  async getDashboardMetrics() {
    return this.httpClient.request<Record<string, RealTimeMetric[]>>('/api/metrics/dashboard');
  }
}
