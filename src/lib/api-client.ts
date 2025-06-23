import { ApiResponse, Campaign, EmailMetrics, UserPreferences, Webhook, SocialPost, IntegrationConnection, SocialPlatformConnection } from './api-client-interface';

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use environment-specific URLs
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://wheels-wins-orchestrator.onrender.com'
      : 'http://localhost:8000';
  }

  setToken(token: string | null) {
    this.token = token;
  }

  public async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data, response: data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.makeRequest<Campaign[]>('/api/campaigns');
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.makeRequest<Campaign>('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
  }

  // Email metrics methods
  async getRealTimeMetrics(): Promise<ApiResponse<EmailMetrics>> {
    return this.makeRequest<EmailMetrics>('/api/email/metrics/realtime');
  }

  // User preferences methods
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.makeRequest<UserPreferences>('/api/user/preferences');
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return this.makeRequest<UserPreferences>('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Analytics methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/analytics');
  }

  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/api/leads');
  }

  // Integration methods
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.makeRequest<IntegrationConnection[]>('/api/integrations/connections');
  }

  async createConnection(connection: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> {
    return this.makeRequest<IntegrationConnection>('/api/integrations/connections', {
      method: 'POST',
      body: JSON.stringify(connection),
    });
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/integrations/connections/${id}`, {
      method: 'DELETE',
    });
  }

  // Webhook methods
  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    return this.makeRequest<Webhook[]>('/api/webhooks');
  }

  async createWebhook(webhook: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    return this.makeRequest<Webhook>('/api/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhook),
    });
  }

  async updateWebhook(id: string, webhook: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    return this.makeRequest<Webhook>(`/api/webhooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(webhook),
    });
  }

  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/api/webhooks/${id}`, {
      method: 'DELETE',
    });
  }

  async testWebhook(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/webhooks/${id}/test`, {
      method: 'POST',
    });
  }

  async syncService(serviceId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/integrations/sync/${serviceId}`, {
      method: 'POST',
    });
  }

  // Social media methods
  async createSocialPost(post: Partial<SocialPost>): Promise<ApiResponse<SocialPost>> {
    return this.makeRequest<SocialPost>('/api/social/posts', {
      method: 'POST',
      body: JSON.stringify(post),
    });
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.makeRequest<SocialPlatformConnection[]>('/api/social/platforms');
  }

  async connectSocialPlatform(platform: string, config: any): Promise<ApiResponse<SocialPlatformConnection>> {
    return this.makeRequest<SocialPlatformConnection>('/api/social/platforms/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, config }),
    });
  }

  // AI Agent methods
  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/agents/query', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });
  }

  async getDailyFocus(query: string, campaigns: any[], context: any[] = []): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/agents/daily-focus', {
      method: 'POST',
      body: JSON.stringify({ query, campaigns, context }),
    });
  }

  // Content methods
  async createContent(content: { title: string; content: string; platform: string; scheduled_for?: string; status?: string }): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async generateSocialContent(platform: string, contentTheme: string, brandVoice?: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/social/generate-content', {
      method: 'POST',
      body: JSON.stringify({ platform, contentTheme, brandVoice }),
    });
  }

  // Email methods
  async generateEmailContent(campaignType: string, audience: any, options?: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/email/generate-content', {
      method: 'POST',
      body: JSON.stringify({ campaignType, audience, options }),
    });
  }

  async generateABVariants(baseMessage: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/email/ab-variants', {
      method: 'POST',
      body: JSON.stringify({ baseMessage }),
    });
  }

  async suggestSendTime(audienceProfile: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/email/suggest-send-time', {
      method: 'POST',
      body: JSON.stringify({ audienceProfile }),
    });
  }

  // Lead management methods
  async executeAgentTask(task: string, context?: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/leads/agent-task', {
      method: 'POST',
      body: JSON.stringify({ task, context }),
    });
  }

  async scoreLeads(leads: any[]): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/leads/score', {
      method: 'POST',
      body: JSON.stringify({ leads }),
    });
  }
}

export const apiClient = new ApiClient();

// Export the interface for use in other files
export type { IntegrationConnection };
