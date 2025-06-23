
import { HttpClient } from '../http-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface AnalyticsMetrics {
  campaigns: number;
  leads: number;
  conversion_rate: number;
  revenue: number;
  traffic: number;
  engagement: number;
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  created_at: string;
}

export interface AnalyticsData {
  metrics: AnalyticsMetrics;
  insights: AnalyticsInsight[];
  period: string;
  last_updated: string;
}

export class AnalyticsService {
  constructor(private httpClient: HttpClient) {}

  async getAnalytics(): Promise<ApiResponse<AnalyticsData>> {
    try {
      const data = await this.httpClient.request<AnalyticsData>('/api/analytics/overview');
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics',
      };
    }
  }

  async getInsights(): Promise<ApiResponse<AnalyticsInsight[]>> {
    try {
      const response = await this.httpClient.request<any>('/api/analytics/insights');
      
      if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
        return response as ApiResponse<AnalyticsInsight[]>;
      }
      
      return {
        success: true,
        data: Array.isArray(response) ? response : []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get insights',
      };
    }
  }

  async getAnalyticsOverview(): Promise<ApiResponse<any>> {
    return this.getAnalytics();
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    try {
      const data = {
        totalCampaigns: 50,
        activeCampaigns: 12,
        totalLeads: 1500,
        newLeadsThisMonth: 230
      };
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get system stats',
      };
    }
  }

  async exportAnalyticsReport(format: string): Promise<ApiResponse<any>> {
    try {
      const data = {
        format,
        exported: true,
        downloadUrl: '/reports/analytics.pdf'
      };
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export analytics report',
      };
    }
  }
}
