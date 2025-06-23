import { 
  ApiResponse, 
  IntegrationConnection, 
  Webhook, 
  UserPreferences, 
  Workflow,
  Campaign,
  SocialPlatformConnection,
  IntegrationMethods,
  UserPreferencesMethods,
  WorkflowMethods
} from './api-client-interface';

export class ApiClient {
  // Make properties public so components can access them
  public integrations: IntegrationMethods;
  public socialPlatforms: SocialMethods;
  public userPreferences: UserPreferencesMethods;
  public workflows: WorkflowMethods;

  constructor() {
    this.integrations = {
      getConnections: this.getConnections.bind(this),
      getWebhooks: this.getWebhooks.bind(this),
      createWebhook: this.createWebhook.bind(this),
      deleteWebhook: this.deleteWebhook.bind(this),
      testWebhook: this.testWebhook.bind(this),
      connectService: this.connectService.bind(this),
      syncService: this.syncService.bind(this),
      disconnectService: this.disconnectService.bind(this)
    };

    this.socialPlatforms = {
      getSocialMediaPosts: this.getSocialMediaPosts.bind(this),
      createSocialPost: this.createSocialPost.bind(this),
      getSocialAnalytics: this.getSocialAnalytics.bind(this),
      generateSocialContent: this.generateSocialContent.bind(this),
      getPlatformConnections: this.getPlatformConnections.bind(this),
      initiatePlatformConnection: this.initiatePlatformConnection.bind(this),
      disconnectPlatform: this.disconnectPlatform.bind(this),
      syncPlatformData: this.syncPlatformData.bind(this),
      testPlatformConnection: this.testPlatformConnection.bind(this)
    };

    this.userPreferences = {
      get: this.getUserPrefs.bind(this),
      update: this.updateUserPrefs.bind(this),
      getUserPreferences: this.getUserPreferences.bind(this),
      updateUserPreferences: this.updateUserPreferences.bind(this)
    };

    this.workflows = {
      getAll: this.getWorkflows.bind(this),
      create: this.createWorkflow.bind(this),
      update: this.updateWorkflow.bind(this),
      delete: this.deleteWorkflow.bind(this),
      execute: this.executeWorkflow.bind(this)
    };
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Email Campaign 1',
          description: 'Marketing email campaign',
          type: 'email',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id: 'campaign-' + Date.now(),
        name: campaignData.name || 'New Campaign',
        description: campaignData.description || '',
        type: campaignData.type || 'email',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  // Content methods
  async generateContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated content for ${brief.topic || 'your campaign'}`,
        suggestions: ['Use engaging headlines', 'Include call-to-action']
      }
    };
  }

  async generateEmailContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        subject: `Email about ${brief.topic || 'your campaign'}`,
        content: `Generated email content for ${brief.audience || 'your audience'}...`,
        preview: 'Email preview text...'
      }
    };
  }

  // Integration methods
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Mailchimp',
          type: 'email',
          status: 'connected',
          config: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Campaign Webhook',
          url: 'https://example.com/webhook',
          events: ['campaign.sent'],
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  async createWebhook(data: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    return {
      success: true,
      data: {
        id: 'webhook-' + Date.now(),
        name: data.name || 'New Webhook',
        url: data.url || '',
        events: data.events || [],
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  async testWebhook(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { status: 'success', response_code: 200 }
    };
  }

  async connectService(service: string, apiKey: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { service, status: 'connected' }
    };
  }

  async syncService(service: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { service, last_sync: new Date().toISOString() }
    };
  }

  async disconnectService(service: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { service, status: 'disconnected' }
    };
  }

  // Social platform methods
  async getSocialMediaPosts(): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [
        { id: '1', content: 'Post 1', likes: 10, shares: 5 },
        { id: '2', content: 'Post 2', likes: 15, shares: 8 }
      ]
    };
  }

  async createSocialPost(postData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'post-' + Date.now(),
        ...postData,
        created_at: new Date().toISOString()
      }
    };
  }

  async getSocialAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        followers: 1234,
        engagement: 567,
        reach: 890
      }
    };
  }

  async generateSocialContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated social content for ${brief.topic || 'your brand'}`,
        suggestions: ['Use relevant hashtags', 'Engage with followers']
      }
    };
  }

  async getPlatformConnections(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return {
      success: true,
      data: [
        {
          id: 'twitter-1',
          platform: 'Twitter',
          account_name: '@company',
          status: 'connected',
          connection_status: 'connected',
          last_sync: new Date().toISOString(),
          follower_count: 1250
        }
      ]
    };
  }

  async initiatePlatformConnection(platform: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { platform, status: 'pending' }
    };
  }

  async disconnectPlatform(platform: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  async syncPlatformData(platform: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { platform, last_sync: new Date().toISOString() }
    };
  }

  async testPlatformConnection(platform: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { platform, status: 'connected' }
    };
  }

  // User preferences methods
  async getUserPrefs(): Promise<ApiResponse<UserPreferences>> {
    return {
      success: true,
      data: {
        theme: 'light',
        notifications: true,
        language: 'en',
        timezone: 'UTC'
      }
    };
  }

  async updateUserPrefs(data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return {
      success: true,
      data: { theme: 'light', notifications: true, language: 'en', timezone: 'UTC', ...data }
    };
  }

  async getUserPreferences(category?: string): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          user_id: 'user-1',
          preference_category: category || 'general',
          preference_data: {
            theme: 'light',
            notifications: true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  async updateUserPreferences(category: string, data: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: '1',
        user_id: 'user-1',
        preference_category: category,
        preference_data: data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Email Campaign Workflow',
          description: 'Automated email sequence',
          steps: [],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  async createWorkflow(workflow: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: {
        id: 'workflow-' + Date.now(),
        name: workflow.name || 'New Workflow',
        description: workflow.description || '',
        steps: workflow.steps || [],
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: {
        id,
        name: workflow.name || 'Updated Workflow',
        description: workflow.description || '',
        steps: workflow.steps || [],
        status: workflow.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  async executeWorkflow(id: string, input?: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { workflow_id: id, status: 'executed', result: input }
    };
  }

  // Other existing methods
  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    console.log('Querying agent with:', query, context);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        message: `Response to: ${query}`,
        context
      }
    };
  }

  async getBlogAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        views: 1234,
        shares: 56,
        likes: 78,
        comments: 23,
        leads: 12,
        conversionRate: 0.05
      }
    };
  }

  async getEmailMetrics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        totalSent: 1000,
        delivered: 950,
        opened: 250,
        clicked: 50,
        bounced: 20,
        unsubscribed: 10,
        openRate: 0.25,
        clickRate: 0.05,
        bounceRate: 0.02
      }
    };
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        scored_leads: 25,
        total_leads: 100,
        average_score: 75
      }
    };
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        totalCampaigns: 5,
        activeLeads: 150,
        conversionRate: 0.15
      }
    };
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }

  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }

  async getLeads(): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', score: 85 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', score: 92 }
      ]
    };
  }

  async callGeneralCampaignAgent(message: string, campaigns?: any[]): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        message: `Based on your ${campaigns?.length || 0} campaigns, here's my analysis: ${message}`,
        suggestions: ['Consider A/B testing', 'Optimize send times']
      }
    };
  }
}

// Define SocialMethods interface locally
interface SocialMethods {
  getSocialMediaPosts: () => Promise<ApiResponse<any[]>>;
  createSocialPost: (postData: any) => Promise<ApiResponse<any>>;
  getSocialAnalytics: () => Promise<ApiResponse<any>>;
  generateSocialContent: (brief: any) => Promise<ApiResponse<any>>;
  getPlatformConnections: () => Promise<ApiResponse<SocialPlatformConnection[]>>;
  initiatePlatformConnection: (platform: string) => Promise<ApiResponse<any>>;
  disconnectPlatform: (platform: string) => Promise<ApiResponse<void>>;
  syncPlatformData: (platform: string) => Promise<ApiResponse<any>>;
  testPlatformConnection: (platform: string) => Promise<ApiResponse<any>>;
}

export const apiClient = new ApiClient();
