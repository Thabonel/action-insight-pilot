
import { HttpClient } from './http-client';
import { 
  Campaign, 
  EmailMetrics, 
  UserPreferences, 
  ApiResponse, 
  SocialPlatformConnection, 
  IntegrationConnection 
} from './api-client-interface';

export class ApiClient {
  public httpClient: HttpClient;
  public integrations: any;
  public analytics: any;
  public userPreferences: any;
  public socialPlatforms: any;

  constructor(baseURL?: string) {
    this.httpClient = new HttpClient(baseURL);
    this.setupNestedObjects();
  }

  private setupNestedObjects() {
    this.integrations = {
      getConnections: () => this.getIntegrationConnections(),
      createConnection: (data: any) => this.createIntegrationConnection(data),
      deleteConnection: (id: string) => this.deleteIntegrationConnection(id)
    };

    this.analytics = {
      getAnalyticsOverview: () => this.getAnalyticsOverview(),
      getSystemStats: () => this.getSystemStats(),
      exportAnalyticsReport: (format: string, timeRange: string) => this.exportAnalyticsReport(format, timeRange)
    };

    this.userPreferences = {
      get: () => this.getUserPreferences(),
      getUserPreferences: (category: string) => this.getUserPreferences(category),
      updateUserPreferences: (category: string, preferences: any) => this.updateUserPreferences(category, preferences)
    };

    this.socialPlatforms = {
      getConnected: () => this.getSocialPlatforms()
    };
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.httpClient.get<Campaign[]>('/api/campaigns');
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return this.httpClient.get<Campaign>(`/api/campaigns/${id}`);
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.httpClient.post<Campaign>('/api/campaigns', campaign);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.httpClient.put<Campaign>(`/api/campaigns/${id}`, updates);
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.httpClient.get<any[]>('/api/leads');
  }

  async exportLeads(format: string = 'csv'): Promise<ApiResponse<string>> {
    return this.httpClient.get<string>(`/api/leads/export?format=${format}`);
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/leads/sync');
  }

  async executeAgentTask(taskType: string, data?: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/agents/execute', { taskType, data });
  }

  async scoreLeads(criteria: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/leads/score', criteria);
  }

  // Analytics methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.get<any>('/api/analytics');
  }

  async getRealTimeMetrics(): Promise<ApiResponse<EmailMetrics>> {
    return this.httpClient.get<EmailMetrics>('/api/metrics/realtime');
  }

  async getAnalyticsOverview(): Promise<ApiResponse<any>> {
    return this.httpClient.get<any>('/api/analytics/overview');
  }

  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.httpClient.get<any>('/api/system/stats');
  }

  async exportAnalyticsReport(format: string, timeRange: string): Promise<ApiResponse<any>> {
    return this.httpClient.get<any>(`/api/analytics/export?format=${format}&timeRange=${timeRange}`);
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.get<any>('/api/analytics/email');
  }

  async getSocialAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.get<any>('/api/analytics/social');
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.httpClient.get<any>('/api/system/health');
  }

  // Social Platform methods
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.httpClient.get<SocialPlatformConnection[]>('/api/social/platforms');
  }

  async connectSocialPlatform(platform: string, config: any = {}): Promise<ApiResponse<SocialPlatformConnection>> {
    return this.httpClient.post<SocialPlatformConnection>('/api/social/connect', { platform, config });
  }

  async scheduleSocialPost(data: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/social/schedule', data);
  }

  // User Preferences methods
  async getUserPreferences(category?: string): Promise<ApiResponse<UserPreferences[]>> {
    const url = category ? `/api/user/preferences?category=${category}` : '/api/user/preferences';
    return this.httpClient.get<UserPreferences[]>(url);
  }

  async updateUserPreferences(category: string, preferences: any): Promise<ApiResponse<UserPreferences[]>> {
    return this.httpClient.put<UserPreferences[]>(`/api/user/preferences/${category}`, preferences);
  }

  // Integration methods
  async getIntegrationConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.httpClient.get<IntegrationConnection[]>('/api/integrations');
  }

  async createIntegrationConnection(data: any): Promise<ApiResponse<IntegrationConnection>> {
    return this.httpClient.post<IntegrationConnection>('/api/integrations', data);
  }

  async deleteIntegrationConnection(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/integrations/${id}`);
  }

  // Content methods
  async createContent(data: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/content', data);
  }

  async generateSocialContent(data: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/content/social/generate', data);
  }

  async generateEmailContent(data: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/content/email/generate', data);
  }

  async generateABVariants(data: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/content/ab-variants', data);
  }

  async suggestSendTime(data: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/content/send-time', data);
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<any[]>> {
    return this.httpClient.get<any[]>('/api/workflows');
  }

  async createWorkflow(data: any): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/workflows', data);
  }

  async executeWorkflow(id: string): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>(`/api/workflows/${id}/execute`);
  }

  async getWorkflowStatus(id: string): Promise<ApiResponse<any>> {
    return this.httpClient.get<any>(`/api/workflows/${id}/status`);
  }

  async updateWorkflow(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.httpClient.put<any>(`/api/workflows/${id}`, updates);
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/workflows/${id}`);
  }

  // Agent methods
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/agents/query', { query });
  }

  async callDailyFocusAgent(query: string, campaigns: any[], context: any[]): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/agents/daily-focus', { query, campaigns, context });
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[], context: any[]): Promise<ApiResponse<any>> {
    return this.httpClient.post<any>('/api/agents/general-campaign', { query, campaigns, context });
  }
}

export const apiClient = new ApiClient();
