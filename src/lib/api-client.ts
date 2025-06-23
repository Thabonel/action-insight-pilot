import { HttpClient } from './http-client';
import { 
  ApiResponse, 
  UserPreferences, 
  Webhook, 
  SocialPlatformConnection, 
  EmailMetrics, 
  Campaign, 
  SocialPost, 
  IntegrationConnection,
  OAuthResponse 
} from './api-client-interface';

export class ApiClient {
  private httpClient: HttpClient;

  // Service objects for organized API methods
  public integrations: {
    getWebhooks: () => Promise<ApiResponse<Webhook[]>>;
    getConnections: () => Promise<ApiResponse<IntegrationConnection[]>>;
    createWebhook: (data: Partial<Webhook>) => Promise<ApiResponse<Webhook>>;
    deleteWebhook: (id: string) => Promise<ApiResponse<void>>;
    testWebhook: (id: string) => Promise<ApiResponse<any>>;
    connectService: (service: string, apiKey: string) => Promise<ApiResponse<any>>;
    syncService: (service: string) => Promise<ApiResponse<any>>;
    disconnectService: (service: string) => Promise<ApiResponse<any>>;
    createConnection: (data: any) => Promise<ApiResponse<IntegrationConnection>>;
    deleteConnection: (id: string) => Promise<ApiResponse<void>>;
  };

  public analytics: {
    getAnalyticsOverview: () => Promise<ApiResponse<any>>;
    getSystemStats: () => Promise<ApiResponse<any>>;
    exportAnalyticsReport: () => Promise<ApiResponse<string>>;
  };

  public userPreferences: {
    getUserPreferences: (category: string) => Promise<ApiResponse<any[]>>;
    updateUserPreferences: (category: string, preferences: UserPreferences) => Promise<ApiResponse<UserPreferences>>;
    get: (category: string) => Promise<ApiResponse<any>>;
  };

  public socialPlatforms: {
    getAll: () => Promise<ApiResponse<SocialPlatformConnection[]>>;
    connect: (platform: string, config: any) => Promise<ApiResponse<SocialPlatformConnection>>;
    disconnect: (id: string) => Promise<ApiResponse<void>>;
    getStatus: (platform: string) => Promise<ApiResponse<any>>;
  };

  constructor(baseURL: string = '') {
    this.httpClient = new HttpClient(baseURL);
    
    // Initialize service objects
    this.integrations = {
      getWebhooks: () => this.mockResponse([]),
      getConnections: () => this.mockResponse([]),
      createWebhook: (data) => this.mockResponse(data as Webhook),
      deleteWebhook: (id) => this.mockResponse(undefined),
      testWebhook: (id) => this.mockResponse({ success: true }),
      connectService: (service, apiKey) => this.mockResponse({ service, connected: true }),
      syncService: (service) => this.mockResponse({ service, synced: true }),
      disconnectService: (service) => this.mockResponse({ service, disconnected: true }),
      createConnection: (data) => this.mockResponse(data),
      deleteConnection: (id) => this.mockResponse(undefined)
    };

    this.analytics = {
      getAnalyticsOverview: () => this.mockResponse({}),
      getSystemStats: () => this.mockResponse({}),
      exportAnalyticsReport: () => this.mockResponse('')
    };

    this.userPreferences = {
      getUserPreferences: (category) => this.mockResponse([]),
      updateUserPreferences: (category, preferences) => this.mockResponse(preferences),
      get: (category) => this.mockResponse({})
    };

    this.socialPlatforms = {
      getAll: () => this.mockResponse([]),
      connect: (platform, config) => this.mockResponse({ platform, ...config } as SocialPlatformConnection),
      disconnect: (id) => this.mockResponse(undefined),
      getStatus: (platform) => this.mockResponse({ platform, status: 'disconnected' })
    };
  }

  private async mockResponse<T>(data: T): Promise<ApiResponse<T>> {
    return { success: true, data };
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // Content methods
  async createContent(data: any): Promise<ApiResponse<any>> {
    return this.mockResponse({ id: Date.now().toString(), ...data });
  }

  async generateContent(brief: any): Promise<ApiResponse<any>> {
    return this.mockResponse({ 
      id: Date.now().toString(),
      content: `Generated content for: ${brief.title}`,
      html_content: `<p>Generated content for: ${brief.title}</p>`,
      ...brief 
    });
  }

  async generateEmailContent(data: any): Promise<ApiResponse<any>> {
    return this.mockResponse({ 
      subject: `Generated: ${data.campaignName}`,
      content: `Email content for ${data.campaignName}`,
      ...data 
    });
  }

  async generateSocialContent(data: any): Promise<ApiResponse<any>> {
    return this.mockResponse({ 
      content: `Social post for ${data.platform}: ${data.prompt}`,
      ...data 
    });
  }

  // Lead methods
  async scoreLeads(): Promise<ApiResponse<any>> {
    return this.mockResponse({ scored: true, count: 100 });
  }

  async exportLeads(format: string): Promise<ApiResponse<string>> {
    return this.mockResponse(`lead1,lead2,lead3\ndata1,data2,data3`);
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return this.mockResponse({ 
      synced_count: 50,
      new_leads: 10,
      updated_leads: 5,
      sync_time: new Date().toISOString(),
      sources: ['CRM', 'Website']
    });
  }

  // Metrics methods
  async getRealTimeMetrics(): Promise<ApiResponse<EmailMetrics>> {
    return this.mockResponse({
      totalSent: 1000,
      delivered: 950,
      opened: 400,
      clicked: 80,
      bounced: 50,
      unsubscribed: 10,
      openRate: 42.1,
      clickRate: 8.4,
      bounceRate: 5.3
    });
  }

  // Social platform methods
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.socialPlatforms.getAll();
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse<SocialPlatformConnection>> {
    return this.socialPlatforms.connect(config.platform, config);
  }

  async scheduleSocialPost(data: SocialPost): Promise<ApiResponse<SocialPost>> {
    return this.mockResponse({ ...data, id: Date.now().toString() });
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<any[]>> {
    return this.mockResponse([]);
  }

  async createWorkflow(data: any): Promise<ApiResponse<any>> {
    return this.mockResponse({ id: Date.now().toString(), ...data });
  }

  async executeWorkflow(id: string): Promise<ApiResponse<any>> {
    return this.mockResponse({ id, status: 'executing' });
  }

  async getWorkflowStatus(id: string): Promise<ApiResponse<any>> {
    return this.mockResponse({ 
      workflow_id: id,
      status: 'running',
      current_step: 2,
      total_steps: 5,
      started_at: new Date().toISOString(),
      estimated_completion: new Date(Date.now() + 3600000).toISOString()
    });
  }

  async updateWorkflow(id: string, data: any): Promise<ApiResponse<any>> {
    return this.mockResponse({ id, ...data });
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<any>> {
    return this.mockResponse({ id, deleted: true });
  }

  // Campaign methods
  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return this.mockResponse({
      id,
      name: `Campaign ${id}`,
      type: 'email',
      status: 'active',
      startDate: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // Blog methods
  async getBlogPosts(): Promise<ApiResponse<any[]>> {
    return this.mockResponse([
      {
        id: '1',
        title: 'Sample Blog Post 1',
        keyword: 'digital marketing',
        wordCount: 1200,
        createdAt: '2024-01-15',
        content: 'This is a sample blog post about digital marketing...',
        status: 'published'
      },
      {
        id: '2',
        title: 'Sample Blog Post 2',
        keyword: 'SEO optimization',
        wordCount: 800,
        createdAt: '2024-01-10',
        content: 'This is a sample blog post about SEO optimization...',
        status: 'draft'
      }
    ]);
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<void>> {
    return this.mockResponse(undefined);
  }

  // Existing methods (keeping for compatibility)
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.mockResponse([]);
  }

  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.mockResponse([]);
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    return this.getRealTimeMetrics();
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.mockResponse({});
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.mockResponse({ status: 'healthy' });
  }

  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return this.mockResponse([]);
  }

  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return this.mockResponse({ 
      message: `Response to: ${query}`,
      suggestions: ['Try this', 'Consider that']
    });
  }

  async callDailyFocusAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return this.mockResponse({ 
      focus: `Daily focus based on: ${query}`,
      campaigns: campaigns.length
    });
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return this.mockResponse({ 
      analysis: `Campaign analysis for: ${query}`,
      campaigns: campaigns.length
    });
  }
}

export const apiClient = new ApiClient();
