
import { HttpClient } from '../http-client';

export class EmailService {
  constructor(private httpClient: HttpClient) {}

  async getEmailCampaigns() {
    return this.httpClient.request('/api/email/campaigns');
  }

  async createEmailCampaign(campaignData: any) {
    return this.httpClient.request('/api/email/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getEmailAnalytics() {
    return this.httpClient.request('/api/email/analytics');
  }

  async sendEmail(emailData: any) {
    return this.httpClient.request('/api/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }
}
