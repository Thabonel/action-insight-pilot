
import { HttpClient } from '../http-client';

export interface LeadData {
  [key: string]: unknown;
}

export class LeadsService {
  constructor(private httpClient: HttpClient) {}

  async getLeads() {
    return this.httpClient.request('/api/leads');
  }

  async searchLeads(query: string) {
    return this.httpClient.request(`/api/leads/search?q=${encodeURIComponent(query)}`);
  }

  async getLeadAnalytics() {
    return this.httpClient.request('/api/leads/analytics/overview');
  }

  async createLead(leadData: LeadData) {
    return this.httpClient.request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async exportLeads(format: 'csv' | 'json' = 'csv') {
    return this.httpClient.request(`/api/leads/export?format=${format}`, {
      method: 'GET',
    });
  }

  async syncLeads() {
    return this.httpClient.request('/api/leads/sync', {
      method: 'POST',
    });
  }
}
