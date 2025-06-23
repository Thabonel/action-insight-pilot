
import { CampaignMethods } from './api/campaign-methods';
import { BrandMethods } from './api/brand-methods';
import { BaseApiClient } from './api/base-api-client';
import type { 
  ApiResponse, 
  Workflow, 
  WorkflowMethods, 
  UserPreferences, 
  UserPreferencesMethods,
  IntegrationMethods,
  IntegrationConnection,
  Webhook,
  EmailMetrics,
  ContentBrief,
  BlogPostParams,
  Campaign,
  SocialPlatformConnection
} from './api-client-interface';

export class ApiClient extends BaseApiClient {
  public campaigns: CampaignMethods;
  public brand: BrandMethods;
  public workflows: WorkflowMethods;
  public userPreferences: UserPreferencesMethods;
  public integrations: IntegrationMethods;
  public socialPlatforms: {
    getSocialMediaPosts: () => Promise<ApiResponse<any[]>>;
    createSocialPost: (postData: any) => Promise<ApiResponse<any>>;
    getSocialAnalytics: () => Promise<ApiResponse<any>>;
    generateSocialContent: (brief: any) => Promise<ApiResponse<any>>;
  };

  constructor() {
    super();
    this.campaigns = new CampaignMethods();
    this.brand = new BrandMethods();
    
    // Initialize workflows methods
    this.workflows = {
      getAll: async () => {
        const mockWorkflows: Workflow[] = [
          {
            id: 'workflow-1',
            name: 'Email Nurture Sequence',
            description: 'Automated email sequence for new leads',
            steps: [],
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return { success: true, data: mockWorkflows };
      },
      create: async (workflow: Partial<Workflow>) => {
        const newWorkflow: Workflow = {
          id: 'workflow-' + Date.now(),
          name: workflow.name || 'New Workflow',
          description: workflow.description || '',
          steps: workflow.steps || [],
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, data: newWorkflow };
      },
      update: async (id: string, workflow: Partial<Workflow>) => {
        const updatedWorkflow: Workflow = {
          id,
          name: workflow.name || 'Updated Workflow',
          description: workflow.description || '',
          steps: workflow.steps || [],
          status: workflow.status || 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, data: updatedWorkflow };
      },
      delete: async (id: string) => {
        return { success: true, data: undefined };
      },
      execute: async (id: string, input?: any) => {
        return { success: true, data: { result: 'Workflow executed successfully' } };
      }
    };

    // Initialize user preferences methods
    this.userPreferences = {
      get: async () => {
        const defaultPrefs: UserPreferences = {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC'
        };
        return { success: true, data: defaultPrefs };
      },
      update: async (data: Partial<UserPreferences>) => {
        return { success: true, data: data as UserPreferences };
      },
      getUserPreferences: async (category?: string) => {
        const defaultPrefs: UserPreferences = {
          theme: 'light',
          notifications: true,
          language: 'en',
          timezone: 'UTC'
        };
        return { success: true, data: defaultPrefs };
      },
      updateUserPreferences: async (category: string, data: Partial<UserPreferences>) => {
        return { success: true, data: data as UserPreferences };
      }
    };

    // Initialize integrations methods
    this.integrations = {
      getWebhooks: async () => {
        const mockWebhooks: Webhook[] = [];
        return { success: true, data: mockWebhooks };
      },
      createWebhook: async (data: Partial<Webhook>) => {
        const newWebhook: Webhook = {
          id: 'webhook-' + Date.now(),
          name: data.name || 'New Webhook',
          url: data.url || '',
          events: data.events || [],
          active: data.active || true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, data: newWebhook };
      },
      deleteWebhook: async (id: string) => {
        return { success: true, data: undefined };
      },
      testWebhook: async (id: string) => {
        return { success: true, data: { status: 'test successful' } };
      },
      getConnections: async () => {
        const mockConnections: IntegrationConnection[] = [];
        return { success: true, data: mockConnections };
      },
      connectService: async (service: string, apiKey: string) => {
        return { success: true, data: { status: 'connected' } };
      },
      syncService: async (service: string) => {
        return { success: true, data: { service, status: 'synced' } };
      },
      disconnectService: async (service: string) => {
        return { success: true, data: { service, status: 'disconnected' } };
      }
    };

    // Initialize social platforms methods
    this.socialPlatforms = {
      getSocialMediaPosts: async () => {
        return { success: true, data: [] };
      },
      createSocialPost: async (postData: any) => {
        return { success: true, data: { id: 'post-' + Date.now(), ...postData } };
      },
      getSocialAnalytics: async () => {
        return { success: true, data: { impressions: 0, engagement: 0 } };
      },
      generateSocialContent: async (brief: any) => {
        return { success: true, data: { content: 'Generated content based on brief' } };
      }
    };
  }

  // Campaign methods
  async getCampaigns() {
    return this.campaigns.getCampaigns();
  }

  async createCampaign(campaign: Partial<Campaign>) {
    return this.campaigns.createCampaign(campaign);
  }

  async getCampaignById(id: string) {
    return this.campaigns.getCampaignById(id);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>) {
    return this.campaigns.updateCampaign(id, updates);
  }

  async deleteCampaign(id: string) {
    return this.campaigns.deleteCampaign(id);
  }

  // Content generation methods
  async generateBlogPost(params: BlogPostParams): Promise<ApiResponse<{ title: string; content: string; seoScore: number }>> {
    return {
      success: true,
      data: {
        title: `Blog Post: ${params.topic}`,
        content: `Generated blog post content about ${params.topic} for ${params.targetAudience}`,
        seoScore: 85
      }
    };
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<{ content: string; suggestions: string[] }>> {
    return {
      success: true,
      data: {
        content: `Generated content for ${brief.topic}`,
        suggestions: ['Consider adding more keywords', 'Include call-to-action']
      }
    };
  }

  // Email methods
  async getEmailMetrics(): Promise<ApiResponse<EmailMetrics>> {
    const mockMetrics: EmailMetrics = {
      totalSent: 1000,
      delivered: 950,
      opened: 380,
      clicked: 76,
      bounced: 50,
      unsubscribed: 5,
      openRate: 40,
      clickRate: 20,
      bounceRate: 5
    };
    return { success: true, data: mockMetrics };
  }

  // Query agent method
  async queryAgent(query: string, context?: any): Promise<ApiResponse<{ response: string }>> {
    return {
      success: true,
      data: {
        response: `AI response to: ${query}`
      }
    };
  }

  // Social platform connections
  async getSocialPlatformConnections(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    const mockConnections: SocialPlatformConnection[] = [
      {
        id: '1',
        platform: 'Twitter',
        account_name: '@example',
        status: 'connected',
        connection_status: 'connected',
        last_sync: new Date().toISOString(),
        follower_count: 1500
      }
    ];
    return { success: true, data: mockConnections };
  }

  async connectSocialPlatform(platform: string, credentials: any): Promise<ApiResponse<SocialPlatformConnection>> {
    const newConnection: SocialPlatformConnection = {
      id: Date.now().toString(),
      platform,
      account_name: credentials.username || '@user',
      status: 'connected',
      connection_status: 'connected',
      last_sync: new Date().toISOString(),
      follower_count: 0
    };
    return { success: true, data: newConnection };
  }

  async disconnectSocialPlatform(id: string): Promise<ApiResponse<void>> {
    return { success: true, data: undefined };
  }

  // Lead scoring method
  async updateLeadScore(leadId: string): Promise<ApiResponse<{ leadId: string; newScore: number }>> {
    return {
      success: true,
      data: {
        leadId,
        newScore: Math.floor(Math.random() * 100)
      }
    };
  }
}

export const apiClient = new ApiClient();

// Export types
export type { 
  ApiResponse, 
  Workflow, 
  WorkflowStep, 
  UserPreferences, 
  Campaign, 
  ContentBrief, 
  BlogPostParams,
  EmailMetrics,
  IntegrationConnection,
  SocialPlatformConnection 
} from './api-client-interface';
