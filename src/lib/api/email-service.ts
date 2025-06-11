
import { HttpClient } from '../http-client';

export interface EmailTemplateVersion {
  id: string;
  template_id: string;
  version: number;
  subject_line: string;
  performance_score: number;
  created_at: string;
  status: string;
}

export interface RealTimeMetrics {
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  engagement_score: number;
  trends: Array<{
    timestamp: string;
    opens: number;
    clicks: number;
  }>;
  insights: Array<{
    type: string;
    metric: string;
    message: string;
    recommendation: string;
  }>;
  last_updated: string;
}

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

  // New enhanced methods
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
    return this.httpClient.request('/api/email/send-personalized', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async getRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.httpClient.request(`/api/email/campaigns/${campaignId}/metrics?time_range=${timeRange}`);
  }

  async registerWebhook(webhookData: any) {
    return this.httpClient.request('/api/email/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any) {
    return this.httpClient.request(`/api/email/track/${emailId}/${eventType}`, {
      method: 'POST',
      body: JSON.stringify(metadata || {}),
    });
  }
}
