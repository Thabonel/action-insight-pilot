
import { HttpClient } from '../http-client';

export interface EmailCampaignData {
  [key: string]: unknown;
}

export interface EmailData {
  [key: string]: unknown;
}

export interface TemplateVersionData {
  [key: string]: unknown;
}

export interface WebhookData {
  [key: string]: unknown;
}

export interface EventMetadata {
  [key: string]: unknown;
}

export interface AudienceData {
  [key: string]: unknown;
}

export interface EmailOptions {
  [key: string]: unknown;
}

export class EmailService {
  constructor(private httpClient: HttpClient) {}

  async getEmailCampaigns() {
    return this.httpClient.request('/api/email/campaigns');
  }

  async createEmailCampaign(campaignData: EmailCampaignData) {
    return this.httpClient.request('/api/email/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getEmailAnalytics() {
    return this.httpClient.request('/api/email/analytics');
  }

  async sendEmail(emailData: EmailData) {
    return this.httpClient.request('/api/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async getRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.httpClient.request(`/api/email/campaigns/${campaignId}/metrics?time_range=${timeRange}`);
  }

  async generateEmailContent(campaignType: string, audience: AudienceData, options?: EmailOptions) {
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

  async optimizeSendTime(audienceData: AudienceData) {
    return this.httpClient.request('/api/email/send-time/optimize', {
      method: 'POST',
      body: JSON.stringify(audienceData),
    });
  }

  async createTemplateVersion(templateId: string, versionData: TemplateVersionData) {
    return this.httpClient.request(`/api/email/templates/${templateId}/versions`, {
      method: 'POST',
      body: JSON.stringify(versionData),
    });
  }

  async getTemplateVersions(templateId: string) {
    return this.httpClient.request(`/api/email/templates/${templateId}/versions`);
  }

  async sendPersonalizedEmail(emailData: EmailData) {
    return this.httpClient.request('/api/email/send/personalized', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async registerWebhook(webhookData: WebhookData) {
    return this.httpClient.request('/api/email/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: EventMetadata) {
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
