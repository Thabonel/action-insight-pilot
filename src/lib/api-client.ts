
import { HttpClient } from './http-client';
import { ApiResponse, UserPreferences, SocialPlatformConnection, IntegrationConnection, EmailMetrics, Campaign, SocialPost, OAuthResponse } from './api-client-interface';

export class ApiClient {
  public httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  // User Preferences
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.httpClient.request<UserPreferences>('/api/user/preferences');
  }

  async updateUserPreferences(scope: string, preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> {
    return this.httpClient.request<UserPreferences>(`/api/user/preferences/${scope}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Social Platforms methods
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.httpClient.request<SocialPlatformConnection[]>('/api/social/platforms');
  }

  async connectSocialPlatform(config: { platform: string; [key: string]: any }): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/social/platforms/connect', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  get socialPlatforms() {
    return {
      getConnected: () => this.getSocialPlatforms(),
      getPlatformConnections: () => this.getSocialPlatforms(),
      initiatePlatformConnection: (platform: string) => this.connectSocialPlatform({ platform }),
      completePlatformConnection: (platform: string, code: string, state: string) => 
        this.httpClient.request<any>('/api/social/oauth/complete', {
          method: 'POST',
          body: JSON.stringify({ platform, code, state }),
        }),
      disconnectPlatform: (platform: string) => 
        this.httpClient.request<any>(`/api/social/platforms/${platform}/disconnect`, {
          method: 'DELETE',
        }),
      testPlatformConnection: (platform: string) => 
        this.httpClient.request<any>(`/api/social/platforms/${platform}/test`, {
          method: 'POST',
        }),
      syncPlatformData: (platform: string) => 
        this.httpClient.request<any>(`/api/social/platforms/${platform}/sync`, {
          method: 'POST',
        }),
    };
  }

  // Integrations methods  
  get integrations() {
    return {
      getConnections: () => this.httpClient.request<IntegrationConnection[]>('/api/integrations/connections'),
      createConnection: (data: any) => this.httpClient.request<IntegrationConnection>('/api/integrations/connections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      deleteConnection: (id: string) => this.httpClient.request<any>(`/api/integrations/connections/${id}`, {
        method: 'DELETE',
      }),
      getWebhooks: () => this.httpClient.request<any[]>('/api/integrations/webhooks'),
      createWebhook: (data: any) => this.httpClient.request<any>('/api/integrations/webhooks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      deleteWebhook: (id: string) => this.httpClient.request<any>(`/api/integrations/webhooks/${id}`, {
        method: 'DELETE',
      }),
      testWebhook: (id: string) => this.httpClient.request<any>(`/api/integrations/webhooks/${id}/test`, {
        method: 'POST',
      }),
      connectService: (service: string, apiKey: string) => this.httpClient.request<any>(`/api/integrations/${service}/connect`, {
        method: 'POST',
        body: JSON.stringify({ api_key: apiKey }),
      }),
      syncService: (service: string) => this.httpClient.request<any>(`/api/integrations/${service}/sync`, {
        method: 'POST',
      }),
      disconnectService: (service: string) => this.httpClient.request<any>(`/api/integrations/${service}/disconnect`, {
        method: 'DELETE',
      }),
    };
  }

  // Email Campaigns
  async getEmailCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.httpClient.request<Campaign[]>('/api/email/campaigns');
  }

  async createEmailCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    return this.httpClient.request<Campaign>('/api/email/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/email/analytics');
  }

  async sendEmail(emailData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async createEmailTemplateVersion(templateId: string, versionData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>(`/api/email/templates/${templateId}/versions`, {
      method: 'POST',
      body: JSON.stringify(versionData),
    });
  }

  async getEmailTemplateVersions(templateId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>(`/api/email/templates/${templateId}/versions`);
  }

  async sendPersonalizedEmail(emailData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/email/send/personalized', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async getRealTimeMetrics(campaignId?: string, timeRange: string = '24h'): Promise<ApiResponse<EmailMetrics>> {
    const url = campaignId 
      ? `/api/email/campaigns/${campaignId}/metrics?time_range=${timeRange}`
      : `/api/email/metrics?time_range=${timeRange}`;
    return this.httpClient.request<EmailMetrics>(url);
  }

  async registerEmailWebhook(webhookData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/email/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/email/events/track', {
      method: 'POST',
      body: JSON.stringify({
        email_id: emailId,
        event_type: eventType,
        metadata
      }),
    });
  }

  async generateEmailContent(campaignType: string, audience: any, options?: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/email/content/generate', {
      method: 'POST',
      body: JSON.stringify({
        campaign_type: campaignType,
        audience,
        ...options
      }),
    });
  }

  async generateABVariants(baseMessage: string): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/email/ab-variants', {
      method: 'POST',
      body: JSON.stringify({
        base_content: baseMessage
      }),
    });
  }

  async suggestSendTime(audienceProfile: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/email/send-time/optimize', {
      method: 'POST',
      body: JSON.stringify(audienceProfile),
    });
  }

  // Social Posts
  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return this.httpClient.request<SocialPost[]>('/api/social/posts');
  }

  async createSocialPost(postData: any): Promise<ApiResponse<SocialPost>> {
    return this.httpClient.request<SocialPost>('/api/social/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Additional methods needed by components
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.httpClient.request<Campaign[]>('/api/campaigns');
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    return this.httpClient.request<Campaign>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request<any[]>('/api/leads');
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/analytics');
  }

  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/agents/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async generateBlogPost(params: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/content/blog/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async generateContent(brief: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/content/generate', {
      method: 'POST',
      body: JSON.stringify(brief),
    });
  }

  async createContent(contentData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/content', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async generateSocialContent(params: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/social/content/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async scoreLeads(leadIds: string[]): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/leads/score', {
      method: 'POST',
      body: JSON.stringify({ lead_ids: leadIds }),
    });
  }

  async exportLeads(format: string = 'csv'): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>(`/api/leads/export?format=${format}`);
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/leads/sync', {
      method: 'POST',
    });
  }

  async getWorkflows(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request<any[]>('/api/workflows');
  }

  async createWorkflow(workflowData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async executeWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
    });
  }

  async getWorkflowStatus(workflowId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>(`/api/workflows/${workflowId}/status`);
  }

  async updateWorkflow(workflowId: string, updates: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>(`/api/workflows/${workflowId}`, {
      method: 'DELETE',
    });
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/system/health');
  }

  async getSocialAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request<any>('/api/social/analytics');
  }

  // Integration connection methods (direct access)
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrations.getConnections();
  }

  async createConnection(data: any): Promise<ApiResponse<IntegrationConnection>> {
    return this.integrations.createConnection(data);
  }

  async deleteConnection(id: string): Promise<ApiResponse<any>> {
    return this.integrations.deleteConnection(id);
  }

  // User preferences helper
  get userPreferences() {
    return {
      getUserPreferences: (category: string) => this.httpClient.request<any[]>(`/api/user/preferences/${category}`),
      updateUserPreferences: (category: string, preferences: any) => this.httpClient.request<any>(`/api/user/preferences/${category}`, {
        method: 'PUT',
        body: JSON.stringify(preferences),
      }),
    };
  }

  // Auth methods
  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // Analytics getter
  get analytics() {
    return {
      getCampaigns: () => this.getCampaigns(),
      getLeads: () => this.getLeads(),
      getMetrics: () => this.getAnalytics(),
    };
  }
}

export const apiClient = new ApiClient();
