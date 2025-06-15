
import { HttpClient } from '../http-client';

export class AnalyticsService {
  constructor(private httpClient: HttpClient) {}

  async getAnalyticsOverview() {
    return this.httpClient.request('/api/analytics/overview');
  }

  async getSystemStats() {
    return this.httpClient.request('/api/system/health');
  }

  async getPerformanceMetrics(timeRange: string = '24h') {
    return this.httpClient.request(`/api/analytics/performance?timeRange=${timeRange}`);
  }

  async getCampaignAnalytics() {
    return this.httpClient.request('/api/campaigns');
  }

  async getLeadAnalytics() {
    return this.httpClient.request('/api/leads');
  }

  async getEmailAnalytics() {
    return this.httpClient.request('/api/email/analytics');
  }

  async getSocialAnalytics() {
    return this.httpClient.request('/api/social/analytics');
  }

  async exportAnalyticsReport(format: 'pdf' | 'csv' | 'excel', timeRange: string = '30d') {
    const response = await this.httpClient.request(`/api/analytics/export?format=${format}&timeRange=${timeRange}`, {
      method: 'GET'
    });
    
    if (response.success && response.data) {
      // Create download link for the exported file
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    
    return response;
  }
}
