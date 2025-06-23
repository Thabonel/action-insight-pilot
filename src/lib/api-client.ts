import { HttpClient } from './http-client';
import {
  UserPreferences,
  Webhook,
  SocialPlatformConnection,
  ApiResponse,
  EmailMetrics,
  Campaign,
  SocialPost,
  IntegrationConnection,
  OAuthResponse
} from './api-client-interface';

export class ApiClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient('https://wheels-wins-orchestrator.onrender.com');
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.mockRequest([
      {
        id: '1',
        name: 'Summer Sales Campaign',
        type: 'email',
        status: 'active',
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        budget: 5000,
        target_audience: 'Existing customers',
        description: 'Boost summer sales with targeted email campaigns',
        created_at: '2024-06-01T00:00:00Z',
        updated_at: '2024-06-01T00:00:00Z'
      }
    ]);
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: campaignData.name || '',
      type: campaignData.type || 'email',
      status: campaignData.status || 'draft',
      startDate: new Date().toISOString(),
      description: campaignData.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return this.mockRequest(newCampaign);
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    const mockCampaign: Campaign = {
      id,
      name: 'Sample Campaign',
      type: 'email',
      status: 'active',
      startDate: '2024-06-01',
      description: 'Sample campaign description',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z'
    };
    return this.mockRequest(mockCampaign);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const updatedCampaign: Campaign = {
      id,
      name: updates.name || 'Updated Campaign',
      type: updates.type || 'email',
      status: updates.status || 'active',
      startDate: updates.startDate || '2024-06-01',
      description: updates.description || '',
      created_at: '2024-06-01T00:00:00Z',
      updated_at: new Date().toISOString()
    };
    return this.mockRequest(updatedCampaign);
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return this.mockRequest(undefined);
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.mockRequest([
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        campaign_id: '1',
        source: 'website',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]);
  }

  async createLead(leadData: any): Promise<ApiResponse<any>> {
    return this.mockRequest({
      id: Math.random().toString(36).substr(2, 9),
      ...leadData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  async updateLeadScore(id: string, score: number): Promise<ApiResponse<any>> {
    return this.mockRequest({ id, score });
  }

  // Content generation methods
  async generateContent(contentData: any): Promise<ApiResponse<any>> {
    return this.mockRequest({
      id: Math.random().toString(36).substr(2, 9),
      content: `Generated content for ${contentData.topic || 'your topic'}`,
      type: contentData.type || 'blog_post',
      created_at: new Date().toISOString()
    });
  }

  async generateBlogPost(postData: any): Promise<ApiResponse<any>> {
    return this.mockRequest({
      id: Math.random().toString(36).substr(2, 9),
      title: postData.title || 'Generated Blog Post',
      content: `This is a generated blog post about ${postData.keyword || 'your topic'}. ` +
               'It contains valuable insights and engaging content for your audience.',
      keyword: postData.keyword || '',
      wordCount: postData.wordCount || 500,
      created_at: new Date().toISOString()
    });
  }

  async generateEmailContent(briefData: any): Promise<ApiResponse<any>> {
    return this.mockRequest({
      id: Math.random().toString(36).substr(2, 9),
      subject: `Campaign: ${briefData.name || 'New Campaign'}`,
      content: `Email content for ${briefData.target_audience || 'your audience'}`,
      suggestions: briefData.objectives || [],
      created_at: new Date().toISOString()
    });
  }

  async generateSocialContent(contentData: any): Promise<ApiResponse<any>> {
    return this.mockRequest({
      id: Math.random().toString(36).substr(2, 9),
      content: `Social post about ${contentData.topic || 'your topic'}`,
      platform: contentData.platform || 'twitter',
      created_at: new Date().toISOString()
    });
  }

  async optimizeContent(contentData: any): Promise<ApiResponse<any>> {
    return this.mockRequest({
      id: Math.random().toString(36).substr(2, 9),
      optimized_content: `Optimized content for ${contentData.type || 'blog_post'}`,
      created_at: new Date().toISOString()
    });
  }

  // Social media methods
  async getSocialPlatforms(): Promise<ApiResponse<any[]>> {
    return this.mockRequest([
      {
        id: '1',
        name: 'Twitter',
        type: 'social',
        status: 'connected',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]);
  }

  async postToSocialPlatform(postData: any): Promise<ApiResponse<any>> {
    return this.mockRequest({
      id: Math.random().toString(36).substr(2, 9),
      ...postData,
      posted_at: new Date().toISOString()
    });
  }

  // Email methods
  async sendEmailCampaign(campaignData: any): Promise<ApiResponse<any>> {
    return this.mockRequest({
      id: Math.random().toString(36).substr(2, 9),
      ...campaignData,
      sent_at: new Date().toISOString()
    });
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    const mockEmailMetrics: EmailMetrics = {
      totalSent: 1000,
      delivered: 950,
      opened: 500,
      clicked: 100,
      bounced: 50,
      unsubscribed: 20,
      openRate: 50,
      clickRate: 10,
      bounceRate: 5,
      last_updated: new Date().toISOString()
    };
    return this.mockRequest(mockEmailMetrics);
  }

  // Analytics methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.mockRequest({
      campaigns: 10,
      leads: 100,
      conversion_rate: 5,
      revenue: 10000,
      traffic: 500,
      engagement: 200
    });
  }

  async getCampaignAnalytics(campaignId: string): Promise<ApiResponse<any>> {
    return this.mockRequest({
      campaign_id: campaignId,
      clicks: 50,
      impressions: 1000,
      conversions: 10
    });
  }

  async getPerformanceInsights(): Promise<ApiResponse<any>> {
    return this.mockRequest([
      {
        id: '1',
        type: 'trend',
        title: 'Increase in website traffic',
        description: 'Website traffic has increased by 20% in the last month',
        impact: 'positive',
        confidence: 0.8,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]);
  }

  // AI Agent methods
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return this.mockRequest({
      message: `Response to query: ${query}`,
      suggestions: ['Suggestion 1', 'Suggestion 2']
    });
  }

  async callDailyFocusAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return this.mockRequest({
      message: `Daily focus response to query: ${query}`,
      campaigns: campaigns
    });
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return this.mockRequest({
      message: `General campaign response to query: ${query}`,
      campaigns: campaigns
    });
  }

  // Integration methods - direct access
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.mockRequest([
      {
        id: '1',
        name: 'Slack Integration',
        type: 'communication',
        status: 'connected',
        service_name: 'slack',
        connection_status: 'connected',
        sync_status: 'idle',
        configuration: {},
        lastSync: '2024-01-01T00:00:00Z'
      }
    ]);
  }

  async createConnection(connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    const newConnection: IntegrationConnection = {
      id: Math.random().toString(36).substr(2, 9),
      name: connectionData.name || 'New Connection',
      type: connectionData.type || 'api',
      status: 'connected',
      service_name: connectionData.service_name || 'unknown',
      connection_status: 'connected',
      sync_status: 'idle',
      configuration: connectionData.configuration || {},
      lastSync: new Date().toISOString()
    };
    return this.mockRequest(newConnection);
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return this.mockRequest(undefined);
  }

  // Service objects for organized access
  integrations = {
    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      return this.mockRequest([
        {
          id: '1',
          name: 'Campaign Webhook',
          url: 'https://example.com/webhook',
          events: ['campaign.created', 'campaign.updated'],
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);
    },

    createWebhook: async (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      const newWebhook: Webhook = {
        id: Math.random().toString(36).substr(2, 9),
        name: webhookData.name || '',
        url: webhookData.url || '',
        events: webhookData.events || [],
        is_active: webhookData.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return this.mockRequest(newWebhook);
    },

    deleteWebhook: async (id: string): Promise<ApiResponse<void>> => {
      return this.mockRequest(undefined);
    },

    testWebhook: async (id: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ status: 'success', message: 'Webhook test successful' });
    },

    getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
      return this.getConnections();
    },

    createConnection: async (connectionData: any): Promise<ApiResponse<IntegrationConnection>> => {
      return this.createConnection(connectionData);
    },

    deleteConnection: async (id: string): Promise<ApiResponse<void>> => {
      return this.deleteConnection(id);
    },

    connectService: async (service: string, apiKey: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ service, status: 'connected' });
    },

    syncService: async (service: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ service, status: 'synced' });
    },

    disconnectService: async (service: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ service, status: 'disconnected' });
    }
  };

  analytics = {
    getAnalyticsOverview: async (): Promise<ApiResponse<any>> => {
      return this.mockRequest({
        metrics: { campaigns: 5, leads: 150, revenue: 25000 },
        insights: [],
        period: 'last_30_days'
      });
    },

    getSystemStats: async (): Promise<ApiResponse<any>> => {
      return this.mockRequest({
        cpuUsage: 45,
        memoryUsage: 62,
        diskUsage: 78,
        activeConnections: 234,
        requestsPerMinute: 150,
        uptime: 99.9
      });
    },

    exportAnalyticsReport: async (): Promise<ApiResponse<string>> => {
      return this.mockRequest('report-url');
    }
  };

  userPreferences = {
    getUserPreferences: async (category: string): Promise<ApiResponse<any[]>> => {
      return this.mockRequest([
        {
          id: '1',
          category,
          preference_data: {
            name: 'My Workspace',
            domain: 'example.com',
            industry: 'Technology',
            teamSize: '10-50'
          }
        }
      ]);
    },

    updateUserPreferences: async (category: string, preferences: any): Promise<ApiResponse<any>> => {
      return this.mockRequest(preferences);
    },

    get: async (category: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ category, data: {} });
    }
  };

  socialPlatforms = {
    getAll: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return this.mockRequest([
        {
          id: '1',
          platform: 'twitter',
          platform_name: 'Twitter',
          status: 'connected',
          connection_status: 'connected',
          username: '@example',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);
    },

    connect: async (platform: string, config: any): Promise<ApiResponse<SocialPlatformConnection>> => {
      const connection: SocialPlatformConnection = {
        id: Math.random().toString(36).substr(2, 9),
        platform,
        platform_name: platform,
        status: 'connected',
        connection_status: 'connected',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return this.mockRequest(connection);
    },

    disconnect: async (id: string): Promise<ApiResponse<void>> => {
      return this.mockRequest(undefined);
    },

    getStatus: async (platform: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ platform, status: 'connected' });
    },

    // Additional methods for compatibility
    getPlatformConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return this.socialPlatforms.getAll();
    },

    initiatePlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ 
        authorization_url: `https://auth.${platform}.com/oauth/authorize`,
        state: Math.random().toString(36).substr(2, 9)
      });
    },

    disconnectPlatform: async (platform: string): Promise<ApiResponse<void>> => {
      return this.mockRequest(undefined);
    },

    syncPlatformData: async (platform: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ platform, synced_count: 10 });
    },

    testPlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
      return this.mockRequest({ platform, status: 'healthy' });
    }
  };

  private async mockRequest<T>(data: T): Promise<ApiResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      success: true,
      data
    };
  }
}

export const apiClient = new ApiClient();
