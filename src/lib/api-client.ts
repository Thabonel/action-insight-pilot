
import { BaseApiClient } from './api/base-api-client';
import { CampaignMethods } from './api/campaign-methods';
import { ContentMethods } from './api/content-methods';
import { LeadMethods } from './api/lead-methods';
import { AnalyticsMethods } from './api/analytics-methods';
import { IntegrationMethods } from './api/integration-methods';
import { WorkflowMethods } from './api/workflow-methods';
import { EmailMethods } from './api/email-methods';
import { SocialMethods } from './api/social-methods';
import { BrandMethods } from './api/brand-methods';
export type { ApiResponse } from './api-client-interface';
export type { Campaign } from './api-client-interface';

export class ApiClient extends BaseApiClient {
  public campaigns: CampaignMethods;
  public content: ContentMethods;
  public leads: LeadMethods;
  public analytics: AnalyticsMethods;
  public integrations: IntegrationMethods;
  public workflows: WorkflowMethods;
  public email: EmailMethods;
  public social: SocialMethods;
  public brand: BrandMethods;

  constructor() {
    super();
    this.campaigns = new CampaignMethods();
    this.content = new ContentMethods();
    this.leads = new LeadMethods();
    this.analytics = new AnalyticsMethods();
    this.integrations = new IntegrationMethods();
    this.workflows = new WorkflowMethods();
    this.email = new EmailMethods();
    this.social = new SocialMethods();
    this.brand = new BrandMethods();
  }

  // Content management methods
  async createContent(data: any) {
    return this.content.createContent(data);
  }

  async generateContent(data: any) {
    return this.content.generateContent(data);
  }

  async repurposeContent(data: any) {
    return this.content.repurposeContent(data);
  }

  async getContentVariants(contentId: string) {
    return this.content.getContentVariants(contentId);
  }

  async saveContentVariant(data: any) {
    return this.content.saveContentVariant(data);
  }

  // Campaign methods
  async createCampaign(data: any) {
    return this.campaigns.createCampaign(data);
  }

  async generateEmailContent(data: any) {
    return this.email.generateEmailContent(data);
  }

  async scoreLeads(leadIds: string[]) {
    return this.leads.scoreLeads(leadIds);
  }

  // User preferences
  async userPreferences() {
    return {
      get: async () => ({ success: true, data: {} }),
      update: async (data: any) => ({ success: true, data })
    };
  }

  // Integration methods
  async getConnections() {
    return this.integrations.getConnections();
  }

  async createConnection(data: any) {
    return this.integrations.createConnection(data);
  }

  async deleteConnection(id: string) {
    return this.integrations.deleteConnection(id);
  }

  // Legacy method compatibility
  async getCampaigns() {
    return this.campaigns.getCampaigns();
  }

  async getCampaignById(id: string) {
    return this.campaigns.getCampaignById(id);
  }

  async updateCampaign(id: string, data: any) {
    return this.campaigns.updateCampaign(id, data);
  }

  async getBlogAnalytics() {
    return this.analytics.getBlogAnalytics();
  }

  async getWorkflows() {
    return this.workflows.getWorkflows();
  }

  async createWorkflow(data: any) {
    return this.workflows.createWorkflow(data);
  }

  async updateWorkflow(id: string, data: any) {
    return this.workflows.updateWorkflow(id, data);
  }

  async deleteWorkflow(id: string) {
    return this.workflows.deleteWorkflow(id);
  }

  async executeWorkflow(id: string) {
    return this.workflows.executeWorkflow(id);
  }

  async getSocialPlatforms() {
    return this.social.getSocialPlatforms();
  }

  async connectSocialPlatform(platform: string, credentials: any) {
    return this.social.connectSocialPlatform(platform, credentials);
  }

  async scheduleSocialPost(data: any) {
    return this.social.scheduleSocialPost(data);
  }

  async getSocialPosts() {
    return this.social.getSocialPosts();
  }

  async getRealTimeMetrics(entityType: string, entityId: string) {
    return this.analytics.getRealTimeMetrics(entityType, entityId);
  }

  async queryAgent(query: string, context?: any) {
    return this.content.generateContent({
      prompt: query,
      context: context || {}
    });
  }

  async callDailyFocusAgent(data: any) {
    return this.queryAgent('Daily focus analysis', data);
  }

  async callGeneralCampaignAgent(data: any) {
    return this.queryAgent('Campaign analysis', data);
  }

  async getAnalytics() {
    return this.getBlogAnalytics();
  }

  async socialPlatforms() {
    return this.social;
  }
}

export const apiClient = new ApiClient();
