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
    // Mock implementation for content repurposing
    return {
      success: true,
      data: {
        variants: [
          {
            format: data.targetFormat,
            content: `Repurposed content for ${data.targetFormat}`,
            platform: data.platform
          }
        ]
      }
    };
  }

  async getContentVariants(contentId: string) {
    // Mock implementation for content variants
    return {
      success: true,
      data: [
        {
          id: '1',
          contentId,
          format: 'social',
          content: 'Social media version',
          platform: 'twitter'
        }
      ]
    };
  }

  async saveContentVariant(data: any) {
    // Mock implementation for saving content variant
    return {
      success: true,
      data: { id: 'variant-1', ...data }
    };
  }

  // Campaign methods
  async createCampaign(data: any) {
    return this.campaigns.createCampaign(data);
  }

  async generateEmailContent(data: any) {
    return this.email.generateEmailContent(data);
  }

  async scoreLeads(leadIds: string[]) {
    // Mock implementation for lead scoring
    return {
      success: true,
      data: leadIds.map(id => ({
        id,
        score: Math.floor(Math.random() * 100),
        factors: ['engagement', 'company_size', 'intent']
      }))
    };
  }

  // User preferences
  async userPreferences() {
    return {
      get: async () => ({ success: true, data: {} }),
      update: async (data: any) => ({ success: true, data }),
      getUserPreferences: async () => ({ success: true, data: {} }),
      updateUserPreferences: async (data: any) => ({ success: true, data })
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
    // Mock implementation for analytics
    return {
      success: true,
      data: {
        views: 1250,
        uniqueViews: 980,
        engagement: 4.2,
        shares: 23,
        timeOnPage: 180,
        bounceRate: 0.35,
        conversionRate: 0.08,
        leads: 12,
        revenue: 2400
      }
    };
  }

  async getWorkflows() {
    // Mock implementation for workflows
    return {
      success: true,
      data: []
    };
  }

  async createWorkflow(data: any) {
    return { success: true, data: { id: 'workflow-1', ...data } };
  }

  async updateWorkflow(id: string, data: any) {
    return { success: true, data: { id, ...data } };
  }

  async deleteWorkflow(id: string) {
    return { success: true, data: { id, deleted: true } };
  }

  async executeWorkflow(id: string) {
    return { success: true, data: { id, status: 'executed' } };
  }

  async getSocialPlatforms() {
    // Mock implementation for social platforms
    return {
      success: true,
      data: [
        {
          id: 'twitter',
          platform: 'twitter',
          account_name: '@example',
          status: 'connected',
          connection_status: 'connected',
          last_sync: new Date().toISOString(),
          follower_count: 1000
        }
      ]
    };
  }

  async connectSocialPlatform(data: any) {
    // Mock implementation for connecting social platform
    return {
      success: true,
      data: {
        platform: data.platform,
        status: 'connected',
        connected_at: new Date().toISOString()
      }
    };
  }

  async scheduleSocialPost(data: any) {
    return this.social.scheduleSocialPost(data);
  }

  async getSocialPosts() {
    // Mock implementation for social posts
    return {
      success: true,
      data: []
    };
  }

  async getRealTimeMetrics(entityType: string, entityId: string) {
    // Mock implementation for real-time metrics
    return {
      success: true,
      data: {
        views: Math.floor(Math.random() * 1000),
        engagement: Math.random() * 10,
        conversions: Math.floor(Math.random() * 50)
      }
    };
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

  async getEmailAnalytics() {
    return this.getBlogAnalytics();
  }

  async getLeads() {
    // Mock implementation for leads
    return {
      success: true,
      data: []
    };
  }

  async socialPlatforms() {
    return this.social;
  }
}

export const apiClient = new ApiClient();
