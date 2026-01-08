
import { BaseApiClient } from './base-api-client';
import { ApiResponse } from '../api-client-interface';

export interface BlogAnalytics {
  [key: string]: unknown;
}

export interface RealTimeMetrics {
  [key: string]: unknown;
}

export interface PerformanceMetrics {
  [key: string]: unknown;
}

export class AnalyticsMethods extends BaseApiClient {
  async getBlogAnalytics(): Promise<ApiResponse<BlogAnalytics>> {
    throw new Error('getBlogAnalytics not implemented - use Supabase client directly');
  }

  async getRealTimeMetrics(entityType: string, entityId: string): Promise<ApiResponse<RealTimeMetrics>> {
    throw new Error('getRealTimeMetrics not implemented - use Supabase client directly');
  }

  async getPerformanceMetrics(): Promise<ApiResponse<PerformanceMetrics>> {
    throw new Error('getPerformanceMetrics not implemented - use Supabase client directly');
  }
}
