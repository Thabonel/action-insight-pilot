
import { ClientCore } from './client-core';
import { EmailMethods } from './email-methods';

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

export class EmailApi extends ClientCore {
  private emailMethods: EmailMethods;

  constructor() {
    super();
    this.emailMethods = new EmailMethods();
  }

  setToken(token: string) {
    super.setToken(token);
    this.emailMethods.setToken(token);
  }

  async getEmailCampaigns() {
    return this.emailMethods.getEmailCampaigns();
  }

  async createEmailCampaign(campaignData: EmailCampaignData) {
    return this.emailMethods.createEmailCampaign(campaignData);
  }

  async getEmailAnalytics() {
    return this.emailMethods.getEmailAnalytics();
  }

  async sendEmail(emailData: EmailData) {
    return this.emailMethods.sendEmail(emailData);
  }

  async createEmailTemplateVersion(templateId: string, versionData: TemplateVersionData) {
    return this.emailMethods.createEmailTemplateVersion(templateId, versionData);
  }

  async getEmailTemplateVersions(templateId: string) {
    return this.emailMethods.getEmailTemplateVersions(templateId);
  }

  async sendPersonalizedEmail(emailData: EmailData) {
    return this.emailMethods.sendPersonalizedEmail(emailData);
  }

  async getEmailRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.emailMethods.getEmailRealTimeMetrics(campaignId, timeRange);
  }

  async registerEmailWebhook(webhookData: WebhookData) {
    return this.emailMethods.registerEmailWebhook(webhookData);
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: EventMetadata) {
    return this.emailMethods.trackEmailEvent(emailId, eventType, metadata);
  }

  async generateEmailContent(campaignType: string, audience: AudienceData, options?: EmailOptions) {
    return this.emailMethods.generateEmailContent(campaignType, audience, options);
  }

  async generateABVariants(baseMessage: string) {
    return this.emailMethods.generateABVariants(baseMessage);
  }

  async suggestSendTime(audienceProfile: AudienceData) {
    return this.emailMethods.suggestSendTime(audienceProfile);
  }
}
