
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  uptime: number;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export class SystemMetricsService {
  static async getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
    try {
      const response = await apiClient.analytics.getSystemStats();
      return {
        success: response.success,
        data: response.data || {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          activeConnections: 0,
          requestsPerMinute: 0,
          uptime: 0
        },
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get system metrics'
      };
    }
  }

  static async getAnalyticsOverview(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.analytics.getAnalyticsOverview();
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics overview'
      };
    }
  }

  static async exportReport(): Promise<ApiResponse<string>> {
    try {
      const response = await apiClient.analytics.exportAnalyticsReport();
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export report'
      };
    }
  }
}
