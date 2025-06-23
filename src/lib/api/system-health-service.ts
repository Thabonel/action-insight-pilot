
import { HttpClient } from '@/lib/http-client';
import { ApiResponse } from '@/lib/http-client';

export interface SystemHealthMetrics {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  active_connections: number;
  last_check: string;
}

export class SystemHealthService {
  constructor(private httpClient: HttpClient) {}

  async getSystemHealth(): Promise<ApiResponse<SystemHealthMetrics>> {
    try {
      const data = await this.httpClient.request<SystemHealthMetrics>('/api/health/system');
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get system health',
      };
    }
  }
}
