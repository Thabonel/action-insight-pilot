import { HttpClient } from './http-client';
import { ApiResponse, UserPreferences, SocialPlatformConnection, IntegrationConnection, EmailMetrics, Campaign, SocialPost } from './api-client-interface';

export class ApiClient {
  public httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  // User Preferences
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.httpClient.request<ApiResponse<UserPreferences>>('/api/user/preferences');
  }

  async updateUserPreferences(scope: string, preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> {
    return this.httpClient.request<ApiResponse<UserPreferences>>(`/api/user/preferences/${scope}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Social Platforms methods
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.httpClient.request<ApiResponse<SocialPlatformConnection[]>>('/api/social/platforms');
  }

  async connectSocialPlatform(config: { platform: string; [key: string]: any }): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/social/platforms/connect', {
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
        this.httpClient.request<ApiResponse<any>>('/api/social/oauth/complete', {
          method: 'POST',
          body: JSON.stringify({ platform, code, state }),
        }),
      disconnectPlatform: (platform: string) => 
        this.httpClient.request<ApiResponse<any>>(`/api/social/platforms/${platform}/disconnect`, {
          method: 'DELETE',
        }),
      testPlatformConnection: (platform: string) => 
        this.httpClient.request<ApiResponse<any>>(`/api/social/platforms/${platform}/test`, {
          method: 'POST',
        }),
      syncPlatformData: (platform: string) => 
        this.httpClient.request<ApiResponse<any>>(`/api/social/platforms/${platform}/sync`, {
          method: 'POST',
        }),
    };
  }

  // Integrations methods  
  get integrations() {
    return {
      getConnections: () => this.httpClient.request<ApiResponse<IntegrationConnection[]>>('/api/integrations/connections'),
      createConnection: (data: any) => this.httpClient.request<ApiResponse<IntegrationConnection>>('/api/integrations/connections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      deleteConnection: (id: string) => this.httpClient.request<ApiResponse<any>>(`/api/integrations/connections/${id}`, {
        method: 'DELETE',
      }),
      getWebhooks: () => this.httpClient.request<ApiResponse<any[]>>('/api/integrations/webhooks'),
      createWebhook: (data: any) => this.httpClient.request<ApiResponse<any>>('/api/integrations/webhooks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      deleteWebhook: (id: string) => this.httpClient.request<ApiResponse<any>>(`/api/integrations/webhooks/${id}`, {
        method: 'DELETE',
      }),
      testWebhook: (id: string) => this.httpClient.request<ApiResponse<any>>(`/api/integrations/webhooks/${id}/test`, {
        method: 'POST',
      }),
      connectService: (service: string, apiKey: string) => this.httpClient.request<ApiResponse<any>>(`/api/integrations/${service}/connect`, {
        method: 'POST',
        body: JSON.stringify({ api_key: apiKey }),
      }),
      syncService: (service: string) => this.httpClient.request<ApiResponse<any>>(`/api/integrations/${service}/sync`, {
        method: 'POST',
      }),
      disconnectService: (service: string) => this.httpClient.request<ApiResponse<any>>(`/api/integrations/${service}/disconnect`, {
        method: 'DELETE',
      }),
    };
  }

  // Email Campaigns
  async getEmailCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.httpClient.request<ApiResponse<Campaign[]>>('/api/email/campaigns');
  }

  async createEmailCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    return this.httpClient.request<ApiResponse<Campaign>>('/api/email/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/email/analytics');
  }

  async sendEmail(emailData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async createEmailTemplateVersion(templateId: string, versionData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>(`/api/email/templates/${templateId}/versions`, {
      method: 'POST',
      body: JSON.stringify(versionData),
    });
  }

  async getEmailTemplateVersions(templateId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>(`/api/email/templates/${templateId}/versions`);
  }

  async sendPersonalizedEmail(emailData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/email/send/personalized', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async getRealTimeMetrics(campaignId: string, timeRange: string = '24h'): Promise<ApiResponse<EmailMetrics>> {
    return this.httpClient.request<ApiResponse<EmailMetrics>>(`/api/email/campaigns/${campaignId}/metrics?time_range=${timeRange}`);
  }

  async registerEmailWebhook(webhookData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/email/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/email/events/track', {
      method: 'POST',
      body: JSON.stringify({
        email_id: emailId,
        event_type: eventType,
        metadata
      }),
    });
  }

  async generateEmailContent(campaignType: string, audience: any, options?: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/email/content/generate', {
      method: 'POST',
      body: JSON.stringify({
        campaign_type: campaignType,
        audience,
        ...options
      }),
    });
  }

  async generateABVariants(baseMessage: string): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/email/ab-variants', {
      method: 'POST',
      body: JSON.stringify({
        base_content: baseMessage
      }),
    });
  }

  async suggestSendTime(audienceProfile: any): Promise<ApiResponse<any>> {
    return this.httpClient.request<ApiResponse<any>>('/api/email/send-time/optimize', {
      method: 'POST',
      body: JSON.stringify(audienceProfile),
    });
  }

  // Social Posts
  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return this.httpClient.request<ApiResponse<SocialPost[]>>('/api/social/posts');
  }

  async createSocialPost(postData: any): Promise<ApiResponse<SocialPost>> {
    return this.httpClient.request<ApiResponse<SocialPost>>('/api/social/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }
}

export const apiClient = new ApiClient();
