
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

  async getRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.httpClient.request(`/api/email/campaigns/${campaignId}/metrics?time_range=${timeRange}`);
  }

  async generateEmailContent(campaignType: string, audience: any, options?: any) {
    return this.httpClient.request('/api/email/content/generate', {
      method: 'POST',
      body: JSON.stringify({
        campaign_type: campaignType,
        audience,
        ...options
      }),
    });
  }

  async generateABVariants(baseContent: string) {
    return this.httpClient.request('/api/email/ab-variants', {
      method: 'POST',
      body: JSON.stringify({
        base_content: baseContent
      }),
    });
  }

  async optimizeSendTime(audienceData: any) {
    return this.httpClient.request('/api/email/send-time/optimize', {
      method: 'POST',
      body: JSON.stringify(audienceData),
    });
  }

  // Legacy methods for compatibility
  async createTemplateVersion(templateId: string, versionData: any) {
    return this.httpClient.request(`/api/email/templates/${templateId}/versions`, {
      method: 'POST',
      body: JSON.stringify(versionData),
    });
  }

  async getTemplateVersions(templateId: string) {
    return this.httpClient.request(`/api/email/templates/${templateId}/versions`);
  }

  async sendPersonalizedEmail(emailData: any) {
    return this.httpClient.request('/api/email/send/personalized', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async registerWebhook(webhookData: any) {
    return this.httpClient.request('/api/email/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any) {
    return this.httpClient.request('/api/email/events/track', {
      method: 'POST',
      body: JSON.stringify({
        email_id: emailId,
        event_type: eventType,
        metadata
      }),
    });
  }
}
