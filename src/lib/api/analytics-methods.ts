
import { BaseApiClient } from './base-api-client';
import { ApiResponse } from '../api-client-interface';

export class AnalyticsMethods extends BaseApiClient {
  async getBlogAnalytics(): Promise<ApiResponse<any>> {
    throw new Error('getBlogAnalytics not implemented - use Supabase client directly');
  }

  async getRealTimeMetrics(entityType: string, entityId: string): Promise<ApiResponse<any>> {
    throw new Error('getRealTimeMetrics not implemented - use Supabase client directly');
  }

  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    throw new Error('getPerformanceMetrics not implemented - use Supabase client directly');
  }
}
