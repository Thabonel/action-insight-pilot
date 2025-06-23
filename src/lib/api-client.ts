import { HttpClient } from './http-client';
import { ApiResponse, UserPreferences, Webhook, SocialPlatformConnection, EmailMetrics, Campaign, SocialPost, IntegrationConnection, OAuthResponse } from './api-client-interface';
import { SystemHealthService } from './api/system-health-service';
import { AnalyticsService } from './api/analytics-service';

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
  active?: boolean; // Alternative property name for backward compatibility
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

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
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
  // Alternative property names for backward compatibility
  total_sent?: number;
  total_opened?: number;
  total_clicked?: number;
  totalOpened?: number;
  totalClicks?: number;
  // Additional properties for dashboard
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
  scheduled_time?: string; // Alternative property name
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
  keyword: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  steps: any[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  score?: number;
  source: string;
  status: string;
  createdAt: string;
}

export class ApiClient {
  private httpClient: HttpClient;
  public systemHealth: SystemHealthService;
  public analytics: AnalyticsService;
  public userPreferences: {
    getUserPreferences: (category: string) => Promise<ApiResponse<any[]>>;
    updateUserPreferences: (category: string, preferences: any) => Promise<ApiResponse<any>>;
    get: (category: string) => Promise<ApiResponse<any>>;
  };
  public integrations: {
    getWebhooks: () => Promise<ApiResponse<Webhook[]>>;
    createWebhook: (data: Partial<Webhook>) => Promise<ApiResponse<Webhook>>;
    deleteWebhook: (id: string) => Promise<ApiResponse<void>>;
    testWebhook: (id: string) => Promise<ApiResponse<any>>;
    getConnections: () => Promise<ApiResponse<IntegrationConnection[]>>;
    createConnection: (data: any) => Promise<ApiResponse<IntegrationConnection>>;
    deleteConnection: (id: string) => Promise<ApiResponse<void>>;
    connectService: (service: string, apiKey: string) => Promise<ApiResponse<any>>;
    syncService: (service: string) => Promise<ApiResponse<any>>;
    disconnectService: (service: string) => Promise<ApiResponse<any>>;
  };
  public socialPlatforms: {
    getAll: () => Promise<ApiResponse<SocialPlatformConnection[]>>;
    connect: (platform: string, config: any) => Promise<ApiResponse<SocialPlatformConnection>>;
    disconnect: (id: string) => Promise<ApiResponse<void>>;
    getStatus: (platform: string) => Promise<ApiResponse<any>>;
    getPlatformConnections: () => Promise<ApiResponse<SocialPlatformConnection[]>>;
    initiatePlatformConnection: (platform: string) => Promise<ApiResponse<OAuthResponse>>;
    disconnectPlatform: (platform: string) => Promise<ApiResponse<void>>;
    syncPlatformData: (platform: string) => Promise<ApiResponse<any>>;
    testPlatformConnection: (platform: string) => Promise<ApiResponse<any>>;
  };

  constructor(baseURL?: string) {
    this.httpClient = new HttpClient(baseURL);
    this.systemHealth = new SystemHealthService(this.httpClient);
    this.analytics = new AnalyticsService(this.httpClient);

    // Initialize userPreferences service
    this.userPreferences = {
      getUserPreferences: async (category: string) => {
        return {
          success: true,
          data: [{ preference_data: {} }]
        };
      },
      updateUserPreferences: async (category: string, preferences: any) => {
        return {
          success: true,
          data: preferences
        };
      },
      get: async (category: string) => {
        return {
          success: true,
          data: {}
        };
      }
    };

    // Initialize integrations service
    this.integrations = {
      getWebhooks: async () => {
        return {
          success: true,
          data: []
        };
      },
      createWebhook: async (data: Partial<Webhook>) => {
        const webhook: Webhook = {
          id: Date.now().toString(),
          name: data.name || '',
          url: data.url || '',
          events: data.events || [],
          is_active: data.is_active || true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return {
          success: true,
          data: webhook
        };
      },
      deleteWebhook: async (id: string) => {
        return {
          success: true
        };
      },
      testWebhook: async (id: string) => {
        return {
          success: true,
          data: { status: 'success' }
        };
      },
      getConnections: async () => {
        return {
          success: true,
          data: []
        };
      },
      createConnection: async (data: any) => {
        const connection: IntegrationConnection = {
          id: Date.now().toString(),
          name: data.name || '',
          type: data.type || '',
          status: 'connected',
          service_name: data.service_name || '',
          connection_status: 'connected',
          sync_status: 'idle'
        };
        return {
          success: true,
          data: connection
        };
      },
      deleteConnection: async (id: string) => {
        return {
          success: true
        };
      },
      connectService: async (service: string, apiKey: string) => {
        return {
          success: true,
          data: { service, connected: true }
        };
      },
      syncService: async (service: string) => {
        return {
          success: true,
          data: { service, synced: true }
        };
      },
      disconnectService: async (service: string) => {
        return {
          success: true,
          data: { service, disconnected: true }
        };
      }
    };

    // Initialize socialPlatforms service
    this.socialPlatforms = {
      getAll: async () => {
        return {
          success: true,
          data: []
        };
      },
      connect: async (platform: string, config: any) => {
        const connection: SocialPlatformConnection = {
          id: Date.now().toString(),
          platform,
          platform_name: platform,
          status: 'connected',
          connection_status: 'connected'
        };
        return {
          success: true,
          data: connection
        };
      },
      disconnect: async (id: string) => {
        return {
          success: true
        };
      },
      getStatus: async (platform: string) => {
        return {
          success: true,
          data: { platform, status: 'connected' }
        };
      },
      getPlatformConnections: async () => {
        return {
          success: true,
          data: []
        };
      },
      initiatePlatformConnection: async (platform: string) => {
        return {
          success: true,
          data: {
            authorization_url: `https://auth.${platform}.com/oauth`,
            state: 'mock-state'
          }
        };
      },
      disconnectPlatform: async (platform: string) => {
        return {
          success: true
        };
      },
      syncPlatformData: async (platform: string) => {
        return {
          success: true,
          data: { platform, synced: true }
        };
      },
      testPlatformConnection: async (platform: string) => {
        return {
          success: true,
          data: { platform, test: 'success' }
        };
      }
    };
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return {
      success: true,
      data: []
    };
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    const campaign: Campaign = {
      id,
      name: 'Sample Campaign',
      type: 'email',
      status: 'active',
      startDate: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      success: true,
      data: campaign
    };
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: campaignData.name || '',
      type: campaignData.type || 'email',
      status: campaignData.status || 'draft',
      startDate: campaignData.startDate || new Date().toISOString(),
      endDate: campaignData.endDate,
      budget: campaignData.budget,
      target_audience: campaignData.target_audience,
      description: campaignData.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      success: true,
      data: campaign
    };
  }

  async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const campaign: Campaign = {
      id,
      name: campaignData.name || '',
      type: campaignData.type || 'email',
      status: campaignData.status || 'draft',
      startDate: campaignData.startDate || new Date().toISOString(),
      endDate: campaignData.endDate,
      budget: campaignData.budget,
      target_audience: campaignData.target_audience,
      description: campaignData.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      success: true,
      data: campaign
    };
  }

  // Blog post methods
  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return {
      success: true,
      data: []
    };
  }

  async generateBlogPost(prompt: string, keyword: string, wordCount: number): Promise<ApiResponse<BlogPost>> {
    const blogPost: BlogPost = {
      id: Date.now().toString(),
      title: `Generated Blog Post about ${keyword}`,
      content: `This is a generated blog post about ${keyword}...`,
      keyword,
      wordCount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return {
      success: true,
      data: blogPost
    };
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<void>> {
    return {
      success: true
    };
  }

  // Content methods
  async generateContent(prompt: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { content: `Generated content for: ${prompt}` }
    };
  }

  async createContent(contentData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id: Date.now().toString(), ...contentData }
    };
  }

  // Email methods
  async generateEmailContent(prompt: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { 
        subject: `Generated Email Subject`,
        content: `Generated email content for: ${prompt}`
      }
    };
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    const metrics: EmailMetrics = {
      totalSent: 1000,
      delivered: 950,
      opened: 300,
      clicked: 50,
      bounced: 25,
      unsubscribed: 5,
      openRate: 30,
      clickRate: 5,
      bounceRate: 2.5
    };
    return {
      success: true,
      data: metrics
    };
  }

  // Social methods
  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return {
      success: true,
      data: []
    };
  }

  async generateSocialContent(prompt: string, platform: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { content: `Generated ${platform} content for: ${prompt}` }
    };
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<SocialPost>> {
    const post: SocialPost = {
      id: Date.now().toString(),
      content: postData.content || '',
      platform: postData.platform || '',
      scheduledTime: postData.scheduledTime || new Date().toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString()
    };
    return {
      success: true,
      data: post
    };
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return {
      success: true,
      data: []
    };
  }

  async connectSocialPlatform(platform: string, credentials: any): Promise<ApiResponse<SocialPlatformConnection>> {
    const connection: SocialPlatformConnection = {
      id: Date.now().toString(),
      platform,
      platform_name: platform,
      status: 'connected',
      connection_status: 'connected'
    };
    return {
      success: true,
      data: connection
    };
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse<Lead[]>> {
    return {
      success: true,
      data: []
    };
  }

  async scoreLeads(leads: Lead[]): Promise<ApiResponse<Lead[]>> {
    const scoredLeads = leads.map(lead => ({
      ...lead,
      score: Math.floor(Math.random() * 100)
    }));
    return {
      success: true,
      data: scoredLeads
    };
  }

  async exportLeads(format: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { format, exported: true }
    };
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { synced: true }
    };
  }

  // Metrics methods
  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        visitors: 100,
        conversions: 5,
        revenue: 1000
      }
    };
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: 99.9,
        lastCheck: new Date().toISOString()
      }
    };
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return {
      success: true,
      data: []
    };
  }

  async createWorkflow(workflowData: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    const workflow: Workflow = {
      id: Date.now().toString(),
      name: workflowData.name || '',
      description: workflowData.description || '',
      status: workflowData.status || 'draft',
      steps: workflowData.steps || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return {
      success: true,
      data: workflow
    };
  }

  async executeWorkflow(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id, executed: true }
    };
  }

  async getWorkflowStatus(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id, status: 'running' }
    };
  }

  async updateWorkflow(id: string, workflowData: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    const workflow: Workflow = {
      id,
      name: workflowData.name || '',
      description: workflowData.description || '',
      status: workflowData.status || 'draft',
      steps: workflowData.steps || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return {
      success: true,
      data: workflow
    };
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return {
      success: true
    };
  }

  // Analytics methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        metrics: {
          campaigns: 5,
          leads: 100,
          conversion_rate: 2.5,
          revenue: 10000,
          traffic: 5000,
          engagement: 15
        }
      }
    };
  }

  // Agent methods
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { response: `AI response to: ${query}` }
    };
  }

  async callDailyFocusAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { focus: `Daily focus based on: ${query}` }
    };
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { analysis: `Campaign analysis for: ${query}` }
    };
  }

  // Connection methods
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return {
      success: true,
      data: []
    };
  }

  async createConnection(connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    const connection: IntegrationConnection = {
      id: Date.now().toString(),
      name: connectionData.name || '',
      type: connectionData.type || '',
      status: 'connected',
      service_name: connectionData.service_name || '',
      connection_status: 'connected',
      sync_status: 'idle'
    };
    return {
      success: true,
      data: connection
    };
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return {
      success: true
    };
  }

  // User preferences methods
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return {
      success: true,
      data: {}
    };
  }

  async updateUserPreferences(preferences: UserPreferences): Promise<ApiResponse<UserPreferences>> {
    return {
      success: true,
      data: preferences
    };
  }
}

export const apiClient = new ApiClient();
