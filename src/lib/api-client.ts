import { HttpClient } from './http-client';
import { ApiResponse } from './api-response';

export class ApiClient {
  public httpClient: HttpClient;
  private token: string | null = null;

  constructor() {
    this.httpClient = new HttpClient();
  }

  setToken(token: string) {
    this.token = token;
    this.httpClient.setToken(token);
  }

  clearToken() {
    this.token = null;
    this.httpClient.setToken('');
  }

  // Basic API methods
  async getCampaigns(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/campaigns');
  }

  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/leads');
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/analytics');
  }

  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/agent/query?query=${encodeURIComponent(query)}`);
  }

  // Blog creation methods
  async generateBlogPost(params: {
    title: string;
    keyword: string;
    wordCount: number;
    tone: string;
    includeCTA: boolean;
  }): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/content/blog/generate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getBlogPosts(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/content/blog');
  }

  // Campaign methods
  async createCampaign(campaignData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
  }

  async getCampaignById(id: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/campaigns/${id}`);
  }

  async updateCampaign(id: string, updates: any): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Content methods
  async createContent(contentData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/content', {
      method: 'POST',
      body: JSON.stringify(contentData)
    });
  }

  async generateContent(brief: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/content/generate', {
      method: 'POST',
      body: JSON.stringify(brief)
    });
  }

  // Email methods
  async generateEmailContent(campaignType: any, audience?: any, options?: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/email/generate', {
      method: 'POST',
      body: JSON.stringify({ campaignType, audience, options })
    });
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/email/analytics');
  }

  async getRealTimeMetrics(entityId?: string, entityType?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams();
    if (entityId) params.append('entityId', entityId);
    if (entityType) params.append('entityType', entityType);
    return this.httpClient.request(`/api/metrics/realtime?${params.toString()}`);
  }

  // Lead methods
  async scoreLeads(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/leads/score', {
      method: 'POST'
    });
  }

  async exportLeads(format: string = 'csv'): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/leads/export?format=${format}`);
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/leads/sync', {
      method: 'POST'
    });
  }

  // Social methods
  async createSocialPost(postData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/social/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async getSocialPlatforms(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/social/platforms');
  }

  async connectSocialPlatform(platformData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/social/connect', {
      method: 'POST',
      body: JSON.stringify(platformData)
    });
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/social/schedule', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  async getSocialAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/social/analytics');
  }

  // User preferences methods
  async getUserPreferences(category?: string): Promise<ApiResponse<any>> {
    const url = category ? `/api/user/preferences?category=${category}` : '/api/user/preferences';
    return this.httpClient.request(url);
  }

  async updateUserPreferences(category: string, preferences: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify({ category, preferences })
    });
  }

  // Integration methods
  async getConnections(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/integrations/connections');
  }

  async createConnection(connectionData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/integrations/connections', {
      method: 'POST',
      body: JSON.stringify(connectionData)
    });
  }

  async deleteConnection(connectionId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/connections/${connectionId}`, {
      method: 'DELETE'
    });
  }

  // Webhook methods
  async getWebhooks(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/integrations/webhooks');
  }

  async createWebhook(webhookData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/integrations/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData)
    });
  }

  async deleteWebhook(webhookId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/webhooks/${webhookId}`, {
      method: 'DELETE'
    });
  }

  async testWebhook(webhookId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/webhooks/${webhookId}/test`, {
      method: 'POST'
    });
  }

  async connectService(service: string, apiKey: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/${service}/connect`, {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey })
    });
  }

  async syncService(service: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/${service}/sync`, {
      method: 'POST'
    });
  }

  async disconnectService(service: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/${service}/disconnect`, {
      method: 'DELETE'
    });
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/workflows');
  }

  async createWorkflow(workflowData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData)
    });
  }

  async executeWorkflow(workflowId: string, input?: any): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify(input || {})
    });
  }

  async getWorkflowStatus(workflowId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/workflows/${workflowId}/status`);
  }

  async updateWorkflow(workflowId: string, updates: any): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/workflows/${workflowId}`, {
      method: 'DELETE'
    });
  }

  // Agent methods
  async callDailyFocusAgent(query: string, campaigns: any[], context: any[]): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/agents/daily-focus', {
      method: 'POST',
      body: JSON.stringify({ query, campaigns, context })
    });
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[], context: any[]): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/agents/general-campaign', {
      method: 'POST',
      body: JSON.stringify({ query, campaigns, context })
    });
  }

  // System methods
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/system/health');
  }

  // Nested object properties for backward compatibility
  get integrations() {
    return {
      getConnections: () => this.getConnections(),
      createConnection: (data: any) => this.createConnection(data),
      deleteConnection: (id: string) => this.deleteConnection(id),
      getWebhooks: () => this.getWebhooks(),
      createWebhook: (data: any) => this.createWebhook(data),
      deleteWebhook: (id: string) => this.deleteWebhook(id),
      testWebhook: (id: string) => this.testWebhook(id),
      connectService: (service: string, apiKey: string) => this.connectService(service, apiKey),
      syncService: (service: string) => this.syncService(service),
      disconnectService: (service: string) => this.disconnectService(service)
    };
  }

  get userPreferences() {
    return {
      getUserPreferences: (category?: string) => this.getUserPreferences(category),
      updateUserPreferences: (category: string, preferences: any) => this.updateUserPreferences(category, preferences),
      get: () => this.getUserPreferences()
    };
  }

  get socialPlatforms() {
    return {
      getConnected: () => this.getSocialPlatforms()
    };
  }

  get analytics() {
    return {
      getAnalyticsOverview: () => this.getAnalytics(),
      getSystemStats: () => this.getAnalytics(),
      exportAnalyticsReport: (format: string, timeRange: string) => this.httpClient.request(`/api/analytics/export?format=${format}&timeRange=${timeRange}`)
    };
  }
}

// Export an instance for convenience
export const apiClient = new ApiClient();
