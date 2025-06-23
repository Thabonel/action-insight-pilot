import { ApiResponse, Campaign, ContentBrief, IntegrationConnection, SocialPlatformConnection } from './api-client-interface';

export class ApiClient {
  setToken(token: string) {
    console.log('Setting API token:', token ? 'Token provided' : 'No token');
  }

  // Content methods
  async createContent(content: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'content-' + Date.now(),
        ...content,
        created_at: new Date().toISOString()
      }
    };
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated content for ${brief.topic || 'your topic'}`,
        suggestions: ['Optimize for SEO', 'Add call-to-action']
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

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Summer Email Campaign',
        description: 'Targeted email campaign for summer products',
        type: 'email',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    return { success: true, data: mockCampaigns };
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id: 'campaign-' + Date.now(),
        name: campaignData.name || 'New Campaign',
        description: campaignData.description || '',
        type: campaignData.type || 'email',
        status: 'draft' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: 'Sample Campaign',
        description: 'A sample campaign',
        type: 'email',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: updates.name || 'Updated Campaign',
        description: updates.description || '',
        type: updates.type || 'email',
        status: updates.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  // Query and AI methods
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

  // Social media methods
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

  // Email methods
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

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }

  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }

  // Integration methods
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Sample Connection',
          type: 'api',
          status: 'connected',
          config: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
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

  // Social platform integration methods
  get socialPlatforms() {
    return {
      getPlatformConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
        return {
          success: true,
          data: [
            {
              id: '1',
              platform: 'twitter',
              account_name: '@example',
              status: 'connected',
              connection_status: 'connected',
              last_sync: new Date().toISOString(),
              follower_count: 1000
            }
          ]
        };
      },
      initiatePlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
        return {
          success: true,
          data: { platform, status: 'connected', connected_at: new Date().toISOString() }
        };
      },
      disconnectPlatform: async (platform: string): Promise<ApiResponse<void>> => {
        return { success: true, data: undefined };
      },
      syncPlatformData: async (platform: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { synced_at: new Date().toISOString() } };
      },
      testPlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
        return { success: true, data: { status: 'connected', tested_at: new Date().toISOString() } };
      },
      getSocialMediaPosts: async (): Promise<ApiResponse<any[]>> => {
        return this.getSocialMediaPosts();
      },
      createSocialPost: async (postData: any): Promise<ApiResponse<any>> => {
        return this.createSocialPost(postData);
      },
      getSocialAnalytics: async (): Promise<ApiResponse<any>> => {
        return this.getSocialAnalytics();
      },
      generateSocialContent: async (brief: any): Promise<ApiResponse<any>> => {
        return this.generateSocialContent(brief);
      }
    };
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.socialPlatforms.getPlatformConnections();
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse<any>> {
    return this.socialPlatforms.initiatePlatformConnection(config.platform);
  }

  // Integration property
  get integrations() {
    return {
      getConnections: () => this.getConnections(),
      getWebhooks: async () => ({ success: true, data: [] }),
      connectService: async (service: string, apiKey: string) => ({ success: true }),
      syncService: async (service: string) => ({ success: true }),
      disconnectService: async (service: string) => ({ success: true }),
      createWebhook: async (webhookData: any) => ({ success: true, data: webhookData }),
      deleteWebhook: async (id: string) => ({ success: true }),
      testWebhook: async (id: string) => ({ success: true })
    };
  }

  // User preferences property
  get userPreferences() {
    return {
      getUserPreferences: async (category: string) => ({
        success: true,
        data: [{ id: '1', category, preference_data: {} }]
      }),
      updateUserPreferences: async (category: string, data: any) => ({
        success: true,
        data: { category, preference_data: data }
      })
    };
  }

  // Workflows property
  get workflows() {
    return {
      getWorkflows: async () => ({ success: true, data: [] }),
      createWorkflow: async (workflow: any) => ({
        success: true,
        data: { id: 'workflow-' + Date.now(), ...workflow }
      }),
      updateWorkflow: async (id: string, updates: any) => ({
        success: true,
        data: { id, ...updates }
      }),
      deleteWorkflow: async (id: string) => ({ success: true }),
      executeWorkflow: async (id: string) => ({ success: true })
    };
  }

  // Other utility methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        totalUsers: Math.floor(Math.random() * 1000) + 100,
        activeFeatures: ['campaigns', 'leads', 'analytics'],
        recentActions: [
          { action: 'Campaign Created', timestamp: new Date(), feature: 'campaigns' },
          { action: 'Lead Scored', timestamp: new Date(), feature: 'leads' }
        ],
        systemHealth: { status: 'healthy', uptime: 99.9, lastCheck: new Date() }
      }
    };
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
}

export const apiClient = new ApiClient();
