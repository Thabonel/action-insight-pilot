
import { ClientCore } from './client-core';
import { EmailMethods } from './email-methods';

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

  async createEmailCampaign(campaignData: any) {
    return this.emailMethods.createEmailCampaign(campaignData);
  }

  async getEmailAnalytics() {
    return this.emailMethods.getEmailAnalytics();
  }

  async sendEmail(emailData: any) {
    return this.emailMethods.sendEmail(emailData);
  }

  async createEmailTemplateVersion(templateId: string, versionData: any) {
    return this.emailMethods.createEmailTemplateVersion(templateId, versionData);
  }

  async getEmailTemplateVersions(templateId: string) {
    return this.emailMethods.getEmailTemplateVersions(templateId);
  }

  async sendPersonalizedEmail(emailData: any) {
    return this.emailMethods.sendPersonalizedEmail(emailData);
  }

  async getEmailRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.emailMethods.getEmailRealTimeMetrics(campaignId, timeRange);
  }

  async registerEmailWebhook(webhookData: any) {
    return this.emailMethods.registerEmailWebhook(webhookData);
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any) {
    return this.emailMethods.trackEmailEvent(emailId, eventType, metadata);
  }

  async generateEmailContent(campaignType: string, audience: any, options?: any) {
    return this.emailMethods.generateEmailContent(campaignType, audience, options);
  }

  async generateABVariants(baseMessage: string) {
    return this.emailMethods.generateABVariants(baseMessage);
  }

  async suggestSendTime(audienceProfile: any) {
    return this.emailMethods.suggestSendTime(audienceProfile);
  }
}
