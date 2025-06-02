
import { HttpClient } from '../http-client';

export class AnalyticsService {
  constructor(private httpClient: HttpClient) {}

  async getAnalyticsOverview() {
    return this.httpClient.request('/api/analytics/overview');
  }

  async getSystemStats() {
    return this.httpClient.request('/api/system/stats');
  }

  async getPerformanceMetrics() {
    return this.httpClient.request('/api/analytics/performance');
  }
}
