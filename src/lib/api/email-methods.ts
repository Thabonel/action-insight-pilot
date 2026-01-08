
import { BaseApiClient } from './base-api-client';
import { EmailService } from './email-service';

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

export class EmailMethods extends BaseApiClient {
  private email: EmailService;

  constructor() {
    super();
    this.email = new EmailService(this.httpClient);
  }

  async getEmailCampaigns() {
    return this.email.getEmailCampaigns();
  }

  async createEmailCampaign(campaignData: EmailCampaignData) {
    return this.email.createEmailCampaign(campaignData);
  }

  async getEmailAnalytics() {
    return this.email.getEmailAnalytics();
  }

  async sendEmail(emailData: EmailData) {
    return this.email.sendEmail(emailData);
  }

  async createEmailTemplateVersion(templateId: string, versionData: TemplateVersionData) {
    return this.email.createTemplateVersion(templateId, versionData);
  }

  async getEmailTemplateVersions(templateId: string) {
    return this.email.getTemplateVersions(templateId);
  }

  async sendPersonalizedEmail(emailData: EmailData) {
    return this.email.sendPersonalizedEmail(emailData);
  }

  async getEmailRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.email.getRealTimeMetrics(campaignId, timeRange);
  }

  async registerEmailWebhook(webhookData: WebhookData) {
    return this.email.registerWebhook(webhookData);
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: EventMetadata) {
    return this.email.trackEmailEvent(emailId, eventType, metadata);
  }

  async generateEmailContent(campaignType: string, audience: AudienceData, options?: EmailOptions) {
    return this.email.generateEmailContent(campaignType, audience, options);
  }

  async generateABVariants(baseMessage: string) {
    return this.email.generateABVariants(baseMessage);
  }

  async suggestSendTime(audienceProfile: AudienceData) {
    return this.email.optimizeSendTime(audienceProfile);
  }
}
