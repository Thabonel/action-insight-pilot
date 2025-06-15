
import { ClientCore } from './client-core';
import { LeadMethods } from './lead-methods';

export class LeadApi extends ClientCore {
  private leadMethods: LeadMethods;

  constructor() {
    super();
    this.leadMethods = new LeadMethods();
  }

  setToken(token: string) {
    super.setToken(token);
    this.leadMethods.setToken(token);
  }

  async getLeads() {
    return this.leadMethods.getLeads();
  }

  async searchLeads(query: string) {
    return this.leadMethods.searchLeads(query);
  }

  async getLeadAnalytics() {
    return this.leadMethods.getLeadAnalytics();
  }

  async createLead(leadData: any) {
    return this.leadMethods.createLead(leadData);
  }

  async exportLeads(format: 'csv' | 'json' = 'csv') {
    return this.leadMethods.exportLeads(format);
  }

  async syncLeads() {
    return this.leadMethods.syncLeads();
  }
}
