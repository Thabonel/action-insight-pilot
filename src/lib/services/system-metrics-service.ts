
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'error';
  lastUpdated: string;
}

export interface SystemOverview {
  engagement: number;
  uptime: number;
  performance: number;
  errors: number;
}

export class SystemMetricsService {
  static async getOverview(): Promise<ApiResponse<SystemOverview>> {
    try {
      const response = await apiClient.analytics.getAnalyticsOverview();
      return {
        success: response.success,
        data: response.data || { engagement: 0, uptime: 99.5, performance: 85, errors: 0 },
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        data: { engagement: 0, uptime: 99.5, performance: 85, errors: 0 },
        error: error instanceof Error ? error.message : 'Failed to get system overview'
      };
    }
  }

  static async getMetrics(): Promise<ApiResponse<SystemMetric[]>> {
    try {
      const response = await apiClient.analytics.getSystemStats();
      return {
        success: response.success,
        data: Array.isArray(response.data) ? response.data : [],
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get system metrics'
      };
    }
  }

  static async exportReport(format: string, timeRange: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.analytics.exportAnalyticsReport(format, timeRange);
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
