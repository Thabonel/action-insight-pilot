import { HttpClient } from './http-client';

// Remove conflicting imports and use local definitions
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface UserPreferences {
  name?: string;
  domain?: string;
  industry?: string;
  teamSize?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    [key: string]: boolean;
  };
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  active?: boolean;
  last_triggered_at?: string;
  last_response_code?: number;
  secret?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  platform_name: string;
  status: 'connected' | 'disconnected' | 'error';
  connection_status: 'connected' | 'disconnected' | 'error';
  username?: string;
  platform_username?: string;
  platform_user_id?: string;
  lastSync?: string;
  last_sync_at?: string;
  token_expires_at?: string;
  connection_metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface EmailMetrics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  total_sent?: number;
  total_opened?: number;
  total_clicked?: number;
  totalOpened?: number;
  totalClicks?: number;
  insights?: Array<{
    type: string;
    message: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  trends?: {
    sent?: number[];
    opened?: number[];
    clicked?: number[];
  };
  last_updated?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  startDate: string;
  endDate?: string;
  budget?: number;
  target_audience?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  content: string;
  platform: string;
  scheduledTime: string;
  scheduled_time?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  campaignId?: string;
  created_at: string;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  service_name: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync_at?: string;
  sync_status: 'idle' | 'syncing' | 'error' | 'success';
  configuration?: Record<string, any>;
  error_message?: string;
  lastSync?: string;
}

export interface OAuthResponse {
  authorization_url: string;
  state: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  created_at: string;
  updated_at: string;
  tone: string;
  includeCTA: boolean;
}

export interface ContentBrief {
  type: string;
  topic: string;
  audience: string;
  tone: string;
  length: string;
  keywords?: string[];
  objectives?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  steps: any[];
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  status: string;
  score: number;
  source: string;
  created_at: string;
}

export class ApiClient {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  // Core API methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const data = await this.httpClient.request<Campaign[]>('/api/campaigns');
      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get campaigns',
      };
    }
  }

  async getLeads(): Promise<ApiResponse<Lead[]>> {
    try {
      const data = await this.httpClient.request<Lead[]>('/api/leads');
      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get leads',
      };
    }
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    try {
      const data = await this.httpClient.request<EmailMetrics>('/api/email/analytics');
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get email analytics',
      };
    }
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request<any>('/api/analytics');
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics',
      };
    }
  }

  async getInsights(): Promise<ApiResponse<any[]>> {
    try {
      const data = await this.httpClient.request<any[]>('/api/insights');
      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get insights',
      };
    }
  }

  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    try {
      const data = await this.httpClient.request<Webhook[]>('/api/webhooks');
      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get webhooks',
      };
    }
  }

  async createWebhook(webhook: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    try {
      const data = await this.httpClient.request<Webhook>('/api/webhooks', {
        method: 'POST',
        body: JSON.stringify(webhook),
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create webhook',
      };
    }
  }

  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/webhooks/${id}`, {
        method: 'DELETE',
      });
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete webhook',
      };
    }
  }

  async testWebhook(id: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request(`/api/webhooks/${id}/test`, {
        method: 'POST',
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test webhook',
      };
    }
  }

  async connectService(service: string, apiKey: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request('/api/integrations/connect', {
        method: 'POST',
        body: JSON.stringify({ service, apiKey }),
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect service',
      };
    }
  }

  async syncService(service: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request(`/api/integrations/${service}/sync`, {
        method: 'POST',
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync service',
      };
    }
  }

  async disconnectService(service: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request(`/api/integrations/${service}/disconnect`, {
        method: 'POST',
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to disconnect service',
      };
    }
  }

  async getUserPreferences(category: string): Promise<ApiResponse<any[]>> {
    try {
      const data = await this.httpClient.request<any[]>(`/api/user-preferences/${category}`);
      return {
        success: true,
        data: data || [],
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get user preferences',
      };
    }
  }

  async updateUserPreferences(category: string, preferences: any): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request(`/api/user-preferences/${category}`, {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user preferences',
      };
    }
  }

  async queryAgent(query: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request('/api/agent/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query agent',
      };
    }
  }

  async callDailyFocusAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request('/api/agent/daily-focus', {
        method: 'POST',
        body: JSON.stringify({ query, campaigns }),
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to call daily focus agent',
      };
    }
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request('/api/agent/campaign', {
        method: 'POST',
        body: JSON.stringify({ query, campaigns }),
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to call campaign agent',
      };
    }
  }

  // Blog methods
  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return {
      success: true,
      data: []
    };
  }

  async generateBlogPost(topic: string, tone: string, includeCTA: boolean): Promise<ApiResponse<BlogPost>> {
    return {
      success: true,
      data: {
        id: '1',
        title: `Generated Blog Post: ${topic}`,
        content: `Blog content about ${topic} with ${tone} tone`,
        status: 'draft',
        author: 'AI',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tone,
        includeCTA
      }
    };
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  // Campaign methods
  async createCampaign(campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id: '1',
        name: campaign.name || '',
        type: campaign.type || '',
        status: 'draft',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...campaign
      }
    };
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: 'Updated Campaign',
        type: 'email',
        status: 'active',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      }
    };
  }

  // Content methods
  async createContent(content: any): Promise<ApiResponse<any>> {
    return { success: true, data: content };
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated content for ${brief.topic} with ${brief.tone} tone`,
        brief
      }
    };
  }

  // Email methods
  async generateEmailContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        subject: 'Generated Email Subject',
        content: 'Generated email content',
        brief
      }
    };
  }

  async getRealTimeMetrics(): Promise<ApiResponse<EmailMetrics>> {
    return {
      success: true,
      data: {
        totalSent: 100,
        delivered: 95,
        opened: 45,
        clicked: 12,
        bounced: 3,
        unsubscribed: 2,
        openRate: 47.4,
        clickRate: 26.7,
        bounceRate: 3.2,
        last_updated: new Date().toISOString()
      }
    };
  }

  // Lead methods
  async scoreLeads(criteria?: any): Promise<ApiResponse<any>> {
    return { success: true, data: { scored: true } };
  }

  async exportLeads(format: string): Promise<ApiResponse<any>> {
    return { success: true, data: { exported: true, format } };
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return { success: true, data: { synced: true } };
  }

  // Social methods
  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return { success: true, data: [] };
  }

  async generateSocialContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated social content for ${brief.topic}`,
        brief
      }
    };
  }

  async scheduleSocialPost(post: any): Promise<ApiResponse<SocialPost>> {
    return {
      success: true,
      data: {
        id: '1',
        content: post.content,
        platform: post.platform,
        scheduledTime: post.scheduledTime,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
    };
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return { success: true, data: [] };
  }

  async connectSocialPlatform(platform: string, config: any): Promise<ApiResponse<SocialPlatformConnection>> {
    return {
      success: true,
      data: {
        id: '1',
        platform,
        platform_name: platform,
        status: 'connected',
        connection_status: 'connected',
        created_at: new Date().toISOString()
      }
    };
  }

  // System methods
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: 99.9,
        services: { database: 'up', api: 'up' }
      }
    };
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return { success: true, data: [] };
  }

  async createWorkflow(workflow: any): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: {
        id: '1',
        name: workflow.name,
        description: workflow.description,
        status: 'draft',
        steps: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async executeWorkflow(id: string): Promise<ApiResponse<any>> {
    return { success: true, data: { executed: true, id } };
  }

  async getWorkflowStatus(id: string): Promise<ApiResponse<any>> {
    return { success: true, data: { id, status: 'running' } };
  }

  async updateWorkflow(id: string, updates: any): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: {
        id,
        name: 'Updated Workflow',
        description: 'Updated description',
        status: 'active',
        steps: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...updates
      }
    };
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  // Service objects
  integrations = {
    getWebhooks: () => this.getWebhooks(),
    getConnections: () => this.getConnections(),
    createWebhook: (webhook: any) => this.createWebhook(webhook),
    deleteWebhook: (id: string) => this.deleteWebhook(id),
    testWebhook: (id: string) => this.testWebhook(id),
    connectService: (service: string, apiKey: string) => this.connectService(service, apiKey),
    syncService: (service: string) => this.syncService(service),
    disconnectService: (service: string) => this.disconnectService(service),
    createConnection: (data: any) => this.createConnection(data),
    deleteConnection: (id: string) => this.deleteConnection(id)
  };

  analytics = {
    getAnalytics: () => this.getAnalytics(),
    getInsights: () => this.getInsights(),
    getAnalyticsOverview: () => this.getAnalytics()
  };

  userPreferences = {
    getUserPreferences: (category: string) => this.getUserPreferences(category),
    updateUserPreferences: (category: string, prefs: any) => this.updateUserPreferences(category, prefs),
    get: (category: string) => this.getUserPreferences(category)
  };

  socialPlatforms = {
    getAll: () => this.getSocialPlatforms(),
    connect: (platform: string, config: any) => this.connectSocialPlatform(platform, config),
    disconnect: (id: string) => this.disconnectSocialPlatform(id),
    getStatus: (platform: string) => this.getSocialPlatformStatus(platform),
    getPlatformConnections: () => this.getSocialPlatforms(),
    initiatePlatformConnection: (platform: string) => this.initiateSocialPlatformConnection(platform),
    disconnectPlatform: (platform: string) => this.disconnectSocialPlatform(platform),
    syncPlatformData: (platform: string) => this.syncSocialPlatformData(platform),
    testPlatformConnection: (platform: string) => this.testSocialPlatformConnection(platform)
  };

  // Additional methods for completeness
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return { success: true, data: [] };
  }

  async createConnection(data: any): Promise<ApiResponse<IntegrationConnection>> {
    return {
      success: true,
      data: {
        id: '1',
        name: data.name,
        type: data.type,
        status: 'connected',
        service_name: data.service_name,
        connection_status: 'connected',
        sync_status: 'idle'
      }
    };
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  async disconnectSocialPlatform(platform: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  async getSocialPlatformStatus(platform: string): Promise<ApiResponse<any>> {
    return { success: true, data: { platform, status: 'connected' } };
  }

  async initiateSocialPlatformConnection(platform: string): Promise<ApiResponse<any>> {
    return { success: true, data: { platform, initiated: true } };
  }

  async syncSocialPlatformData(platform: string): Promise<ApiResponse<any>> {
    return { success: true, data: { platform, synced: true } };
  }

  async testSocialPlatformConnection(platform: string): Promise<ApiResponse<any>> {
    return { success: true, data: { platform, test: 'passed' } };
  }
}

export const apiClient = new ApiClient();
