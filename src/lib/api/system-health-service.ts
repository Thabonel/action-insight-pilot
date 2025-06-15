
import { HttpClient, ApiResponse } from '@/lib/http-client';

export interface SystemHealthMetrics {
  uptime_percentage: number;
  status: 'operational' | 'warning' | 'degraded' | 'unknown';
  status_message: string;
  performance_score: number;
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    uptime_hours: number;
  };
  last_updated: string;
}

export class SystemHealthService {
  constructor(private httpClient: HttpClient) {}

  async getSystemHealth(): Promise<ApiResponse<SystemHealthMetrics>> {
    return this.httpClient.request<SystemHealthMetrics>('/api/system/health', {
      method: 'GET',
    });
  }
}
