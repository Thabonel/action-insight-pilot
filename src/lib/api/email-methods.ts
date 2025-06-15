
import { BaseApiClient } from './base-api-client';
import { EmailService } from './email-service';

export class EmailMethods extends BaseApiClient {
  private email: EmailService;

  constructor() {
    super();
    this.email = new EmailService(this.httpClient);
  }

  async getEmailCampaigns() {
    return this.email.getEmailCampaigns();
  }

  async createEmailCampaign(campaignData: any) {
    return this.email.createEmailCampaign(campaignData);
  }

  async getEmailAnalytics() {
    return this.email.getEmailAnalytics();
  }

  async sendEmail(emailData: any) {
    return this.email.sendEmail(emailData);
  }

  async createEmailTemplateVersion(templateId: string, versionData: any) {
    return this.email.createTemplateVersion(templateId, versionData);
  }

  async getEmailTemplateVersions(templateId: string) {
    return this.email.getTemplateVersions(templateId);
  }

  async sendPersonalizedEmail(emailData: any) {
    return this.email.sendPersonalizedEmail(emailData);
  }

  async getEmailRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.email.getRealTimeMetrics(campaignId, timeRange);
  }

  async registerEmailWebhook(webhookData: any) {
    return this.email.registerWebhook(webhookData);
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any) {
    return this.email.trackEmailEvent(emailId, eventType, metadata);
  }

  async generateEmailContent(campaignType: string, audience: any, options?: any) {
    return this.email.generateEmailContent(campaignType, audience, options);
  }

  async generateABVariants(baseMessage: string) {
    return this.email.generateABVariants(baseMessage);
  }

  async suggestSendTime(audienceProfile: any) {
    return this.email.optimizeSendTime(audienceProfile);
  }
}
