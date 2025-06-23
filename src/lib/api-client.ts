import { ApiResponse, Campaign, ContentBrief, SocialPlatformConnection, IntegrationConnection, Webhook, UserPreferences, Workflow } from './api-client-interface';

export class ApiClient {
  private token: string = '';

  setToken(token: string) {
    this.token = token;
  }

  // Social Platforms Methods
  get socialPlatforms() {
    return {
      getPlatformConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
        console.log('Getting platform connections');
        const mockConnections: SocialPlatformConnection[] = [
          {
            id: '1',
            platform: 'twitter',
            account_name: '@example',
            status: 'connected',
            connection_status: 'connected',
            last_sync: new Date().toISOString(),
            follower_count: 1000
          }
        ];
        return { success: true, data: mockConnections };
      },

      initiatePlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
        console.log('Initiating platform connection for:', platform);
        return {
          success: true,
          data: {
            platform,
            status: 'connected',
            connected_at: new Date().toISOString()
          }
        };
      },

      disconnectPlatform: async (platform: string): Promise<ApiResponse<void>> => {
        console.log('Disconnecting platform:', platform);
        return { success: true, data: undefined };
      },

      syncPlatformData: async (platform: string): Promise<ApiResponse<any>> => {
        console.log('Syncing platform data for:', platform);
        return { success: true, data: { synced_at: new Date().toISOString() } };
      },

      testPlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
        console.log('Testing platform connection for:', platform);
        return { success: true, data: { status: 'connected', tested_at: new Date().toISOString() } };
      },

      getSocialMediaPosts: async (): Promise<ApiResponse<any[]>> => {
        console.log('Getting social media posts');
        return { success: true, data: [] };
      },

      createSocialPost: async (postData: any): Promise<ApiResponse<any>> => {
        console.log('Creating social post:', postData);
        return { success: true, data: { id: 'post-1', ...postData } };
      },

      getSocialAnalytics: async (): Promise<ApiResponse<any>> => {
        console.log('Getting social analytics');
        return { success: true, data: { views: 100, engagement: 50 } };
      },

      generateSocialContent: async (brief: any): Promise<ApiResponse<any>> => {
        console.log('Generating social content:', brief);
        return { success: true, data: { content: 'Generated content', suggestions: [] } };
      }
    };
  }

  // Integrations Methods
  get integrations() {
    return {
      getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
        return { success: true, data: [] };
      },

      connectService: async (service: string, apiKey: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { service, connected_at: new Date() } };
      },

      syncService: async (service: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { service, synced_at: new Date() } };
      },

      disconnectService: async (service: string): Promise<ApiResponse<any>> => {
        return { success: true, data: undefined };
      },

      getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
        return { success: true, data: [] };
      },

      createWebhook: async (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
        return { 
          success: true, 
          data: { 
            id: 'webhook-' + Date.now(), 
            url: webhookData.url || '', 
            events: webhookData.events || [],
            ...webhookData 
          } as Webhook 
        };
      },

      deleteWebhook: async (id: string): Promise<ApiResponse<void>> => {
        return { success: true, data: undefined };
      },

      testWebhook: async (id: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { tested: true } };
      }
    };
  }

  // User Preferences Methods
  get userPreferences() {
    return {
      getUserPreferences: async (category?: string): Promise<ApiResponse<any[]>> => {
        return { 
          success: true, 
          data: [{ 
            id: '1', 
            category: category || 'general', 
            preference_data: {} 
          }] 
        };
      },

      updateUserPreferences: async (category: string, data: any): Promise<ApiResponse<any>> => {
        return { 
          success: true, 
          data: { id: '1', category, preference_data: data } 
        };
      },

      get: async (): Promise<ApiResponse<UserPreferences>> => {
        return { 
          success: true, 
          data: { theme: 'light', notifications: true } 
        };
      },

      update: async (preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> => {
        return { success: true, data: preferences };
      }
    };
  }

  // Workflows Methods
  get workflows() {
    return {
      getWorkflows: async (): Promise<ApiResponse<Workflow[]>> => {
        return { success: true, data: [] };
      },

      getAll: async (): Promise<ApiResponse<Workflow[]>> => {
        return { success: true, data: [] };
      },

      create: async (workflow: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
        return { 
          success: true, 
          data: { 
            id: 'workflow-' + Date.now(), 
            name: workflow.name || 'New Workflow',
            ...workflow 
          } as Workflow 
        };
      },

      createWorkflow: async (workflow: any): Promise<ApiResponse<any>> => {
        return { success: true, data: { id: 'workflow-' + Date.now(), ...workflow } };
      },

      update: async (id: string, updates: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
        return { 
          success: true, 
          data: { id, ...updates } as Workflow 
        };
      },

      updateWorkflow: async (id: string, updates: any): Promise<ApiResponse<any>> => {
        return { success: true, data: { id, ...updates } };
      },

      delete: async (id: string): Promise<ApiResponse<void>> => {
        return { success: true, data: undefined };
      },

      deleteWorkflow: async (id: string): Promise<ApiResponse<any>> => {
        return { success: true, data: undefined };
      },

      execute: async (id: string, input?: any): Promise<ApiResponse<any>> => {
        return { success: true, data: { executed: true, result: 'Success' } };
      },

      executeWorkflow: async (id: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { executed: true } };
      }
    };
  }

  // Campaign Methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return { success: true, data: [] };
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return { 
      success: true, 
      data: { 
        id, 
        name: 'Sample Campaign', 
        type: 'email', 
        status: 'draft',
        description: 'Sample description',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Campaign 
    };
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    return { 
      success: true, 
      data: { 
        id: 'campaign-' + Date.now(), 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...campaignData 
      } as Campaign 
    };
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return { 
      success: true, 
      data: { 
        id,
        updated_at: new Date().toISOString(),
        ...updates 
      } as Campaign 
    };
  }

  // Content Methods
  async createContent(contentData: any): Promise<ApiResponse<any>> {
    console.log('Creating content:', contentData);
    return {
      success: true,
      data: {
        id: 'content-' + Date.now(),
        ...contentData,
        created_at: new Date().toISOString()
      }
    };
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated content for ${brief.title}`,
        suggestions: ['Use more engaging headlines', 'Add call-to-action']
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

  // Lead Methods
  async getLeads(): Promise<ApiResponse<any[]>> {
    console.log('Getting leads');
    return {
      success: true,
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', score: 85 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', score: 92 }
      ]
    };
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    console.log('Scoring leads');
    return {
      success: true,
      data: {
        scored_count: 150,
        updated_at: new Date().toISOString()
      }
    };
  }

  // Analytics Methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    console.log('Getting analytics');
    return {
      success: true,
      data: {
        totalUsers: Math.floor(Math.random() * 1000) + 100,
        totalCampaigns: Math.floor(Math.random() * 50) + 10,
        activeLeads: Math.floor(Math.random() * 200) + 50,
        conversionRate: Math.round((Math.random() * 0.1 + 0.05) * 100) / 100
      }
    };
  }

  // Connection Methods
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrations.getConnections();
  }

  async createConnection(connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    return {
      success: true,
      data: {
        id: 'conn-' + Date.now(),
        name: connectionData.name || 'New Connection',
        type: connectionData.type || 'api',
        status: 'connected',
        config: connectionData.config || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return { success: true, data: undefined };
  }

  // Social Platform Methods (top-level for compatibility)
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.socialPlatforms.getPlatformConnections();
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'social-' + Date.now(),
        platform: config.platform,
        status: 'connected'
      }
    };
  }

  // Chat/Agent Methods
  async callGeneralCampaignAgent(message: string, campaigns?: any[]): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        message: `Based on your ${campaigns?.length || 0} campaigns, here's my analysis: ${message}`,
        suggestions: ['Consider A/B testing', 'Optimize send times']
      }
    };
  }

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

  // Other Methods
  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'scheduled-post-' + Date.now(),
        ...postData,
        status: 'scheduled',
        scheduled_at: postData.scheduled_for
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

  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }
}

export const apiClient = new ApiClient();
