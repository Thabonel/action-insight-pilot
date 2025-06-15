
import { BaseApiClient } from './base-api-client';
import { LeadsService } from './leads-service';

export class LeadMethods extends BaseApiClient {
  private leads: LeadsService;

  constructor() {
    super();
    this.leads = new LeadsService(this.httpClient);
  }

  async getLeads() {
    return this.leads.getLeads();
  }

  async searchLeads(query: string) {
    return this.leads.searchLeads(query);
  }

  async getLeadAnalytics() {
    return this.leads.getLeadAnalytics();
  }

  async createLead(leadData: any) {
    return this.leads.createLead(leadData);
  }

  async exportLeads(format: 'csv' | 'json' = 'csv') {
    return this.leads.exportLeads(format);
  }

  async syncLeads() {
    return this.leads.syncLeads();
  }
}
