
import { ApiResponse, UserPreferences, SocialPlatformConnection, EmailMetrics, Campaign, SocialPost, IntegrationConnection, Webhook, OAuthResponse } from '@/lib/api-client-interface';
import { HttpClient } from '@/lib/http-client';
import { AnalyticsService } from '@/lib/api/analytics-service';
import { SystemMetricsService } from '@/lib/services/system-metrics-service';

// Local interfaces to avoid conflicts with imported ones
interface LocalContentBrief {
  title: string;
  content_type: string;
  target_audience: string;
  key_messages: string[];
  platform: string;
  tone?: string;
  length?: string;
  keywords?: string[];
  cta?: string;
  type: string;
  topic: string;
  audience: string;
}

interface LocalBlogPost {
  id: string;
  title: string;
  content: string;
  status: string;
  tone: string;
  includeCTA: boolean;
  created_at: string;
}

interface LocalWorkflow {
  id: string;
  name: string;
  description: string;
  status: string;
  steps: Array<{
    id: number;
    type: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    status: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface LocalCampaign {
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

export class ApiClient {
  private httpClient: HttpClient;
  public analytics: AnalyticsService;
  public systemMetrics: SystemMetricsService;

  constructor() {
    this.httpClient = new HttpClient();
    this.analytics = new AnalyticsService(this.httpClient);
    this.systemMetrics = new SystemMetricsService(this.httpClient);
  }

  // User Preferences
  public userPreferences = {
    getUserPreferences: async (category: string): Promise<ApiResponse<any[]>> => {
      return {
        success: true,
        data: []
      };
    },
    
    updateUserPreferences: async (category: string, preferences: any): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: preferences
      };
    },

    get: async (category: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: {}
      };
    }
  };

  // Social Platforms
  public socialPlatforms = {
    getConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      const mockConnections: SocialPlatformConnection[] = [
        {
          id: '1',
          platform: 'twitter',
          platform_name: 'Twitter',
          status: 'connected',
          connection_status: 'connected',
          username: 'testuser',
          platform_username: 'testuser',
          platform_user_id: '12345',
          lastSync: new Date().toISOString(),
          last_sync_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return {
        success: true,
        data: mockConnections
      };
    },

    connect: async (platform: string, config: any = {}): Promise<ApiResponse<SocialPlatformConnection>> => {
      const mockConnection: SocialPlatformConnection = {
        id: Date.now().toString(),
        platform,
        platform_name: platform.charAt(0).toUpperCase() + platform.slice(1),
        status: 'connected',
        connection_status: 'connected',
        username: config.username || 'user',
        platform_username: config.username || 'user',
        platform_user_id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return {
        success: true,
        data: mockConnection
      };
    },

    getPlatformConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return this.socialPlatforms.getConnections();
    },

    initiatePlatformConnection: async (platform: string): Promise<ApiResponse<{ platform: string; auth_url: string; authorization_url: string; }>> => {
      return {
        success: true,
        data: {
          platform,
          auth_url: `https://auth.example.com/${platform}`,
          authorization_url: `https://auth.example.com/${platform}`
        }
      };
    },

    disconnectPlatform: async (platformId: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { disconnected: true }
      };
    },

    syncPlatformData: async (platformId: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { synced: true }
      };
    },

    testPlatformConnection: async (platformId: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { test: 'passed' }
      };
    }
  };

  // Integrations
  public integrations = {
    getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
      return {
        success: true,
        data: []
      };
    },

    createConnection: async (connectionData: any): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: connectionData
      };
    },

    deleteConnection: async (id: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { deleted: true }
      };
    },

    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      return {
        success: true,
        data: []
      };
    },

    createWebhook: async (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      const webhook: Webhook = {
        id: Date.now().toString(),
        name: webhookData.name || 'New Webhook',
        url: webhookData.url || '',
        events: webhookData.events || [],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return {
        success: true,
        data: webhook
      };
    },

    deleteWebhook: async (webhookId: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { deleted: true }
      };
    },

    testWebhook: async (webhookId: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { test: 'passed' }
      };
    },

    connectService: async (service: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { connected: true }
      };
    },

    syncService: async (service: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { synced: true }
      };
    },

    disconnectService: async (service: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { disconnected: true }
      };
    }
  };

  // Core API methods
  async getCampaigns(): Promise<ApiResponse<LocalCampaign[]>> {
    return {
      success: true,
      data: []
    };
  }

  async getCampaign(id: string): Promise<ApiResponse<LocalCampaign>> {
    const mockCampaign: LocalCampaign = {
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
      data: mockCampaign
    };
  }

  async updateCampaign(id: string, updates: any): Promise<ApiResponse<LocalCampaign>> {
    const mockCampaign: LocalCampaign = {
      id,
      name: updates.name || 'Updated Campaign',
      type: updates.type || 'email',
      status: updates.status || 'active',
      startDate: updates.startDate || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates
    };
    return {
      success: true,
      data: mockCampaign
    };
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<LocalCampaign>> {
    const mockCampaign: LocalCampaign = {
      id: Date.now().toString(),
      name: campaignData.name,
      type: campaignData.type,
      status: 'draft',
      startDate: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...campaignData
    };
    return {
      success: true,
      data: mockCampaign
    };
  }

  async getLeads(): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: []
    };
  }

  async exportLeads(format: string): Promise<ApiResponse<string>> {
    return {
      success: true,
      data: 'id,name,email\n1,John Doe,john@example.com'
    };
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        synced_count: 10,
        new_leads: 5,
        updated_leads: 5,
        sync_time: new Date().toISOString(),
        sources: ['manual']
      }
    };
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { scored: true }
    };
  }

  // Content Generation
  async generateContent(brief: LocalContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        title: brief.title,
        content: 'Generated content based on brief',
        html_content: '<p>Generated content based on brief</p>',
        cta: brief.cta || 'Learn More',
        seo_score: 85,
        readability_score: 90,
        engagement_prediction: 75,
        tags: brief.keywords || [],
        status: 'generated'
      }
    };
  }

  async generateSocialContent(brief: any): Promise<ApiResponse<any>> {
    const contentBrief: LocalContentBrief = {
      title: `${brief.platform} Post`,
      content_type: 'social_post',
      target_audience: brief.audience,
      key_messages: brief.keywords || [],
      platform: brief.platform,
      tone: brief.tone,
      type: 'social',
      topic: brief.platform,
      audience: brief.audience
    };
    
    return this.generateContent(contentBrief);
  }

  // Blog
  async getBlogPosts(): Promise<ApiResponse<LocalBlogPost[]>> {
    return {
      success: true,
      data: []
    };
  }

  async createBlogPost(title: string, content: string, options: any): Promise<ApiResponse<LocalBlogPost[]>> {
    const blogPost: LocalBlogPost = {
      id: Date.now().toString(),
      title,
      content,
      status: 'draft',
      tone: options.tone || 'professional',
      includeCTA: options.includeCTA || false,
      created_at: new Date().toISOString()
    };
    return {
      success: true,
      data: [blogPost]
    };
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { deleted: true }
    };
  }

  // Content
  async createContent(contentData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: contentData
    };
  }

  // Social
  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return {
      success: true,
      data: []
    };
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<SocialPost>> {
    const socialPost: SocialPost = {
      id: Date.now().toString(),
      content: postData.content,
      platform: postData.platform,
      scheduledTime: postData.scheduledTime,
      status: 'scheduled',
      created_at: new Date().toISOString()
    };
    return {
      success: true,
      data: socialPost
    };
  }

  // Workflows
  async getWorkflows(): Promise<ApiResponse<LocalWorkflow[]>> {
    return {
      success: true,
      data: []
    };
  }

  async createWorkflow(workflowData: any): Promise<ApiResponse<LocalWorkflow>> {
    const workflow: LocalWorkflow = {
      id: Date.now().toString(),
      name: workflowData.name,
      description: workflowData.description,
      status: 'draft',
      steps: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      success: true,
      data: workflow
    };
  }

  async executeWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { executed: true }
    };
  }

  async getWorkflowStatus(workflowId: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        workflow_id: workflowId,
        status: 'running',
        current_step: 1,
        total_steps: 3,
        started_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 3600000).toISOString()
      }
    };
  }

  async updateWorkflow(workflowId: string, updates: any): Promise<ApiResponse<LocalWorkflow>> {
    const workflow: LocalWorkflow = {
      id: workflowId,
      name: updates.name || 'Updated Workflow',
      description: updates.description || '',
      status: updates.status || 'draft',
      steps: updates.steps || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      success: true,
      data: workflow
    };
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { deleted: true }
    };
  }

  // Metrics and Analytics
  async getRealTimeMetrics(): Promise<ApiResponse<EmailMetrics>> {
    const metrics: EmailMetrics = {
      totalSent: 1000,
      delivered: 950,
      opened: 380,
      clicked: 76,
      bounced: 25,
      unsubscribed: 5,
      openRate: 40,
      clickRate: 8,
      bounceRate: 2.5
    };
    return {
      success: true,
      data: metrics
    };
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        totalSent: 1000,
        openRate: 40,
        clickRate: 8
      }
    };
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: 99.9
      }
    };
  }

  // Conversational agents
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        response: `AI response to: ${query}`,
        suggestions: ['Tell me about campaigns', 'Show metrics']
      }
    };
  }

  async callDailyFocusAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        focus_summary: `Daily focus based on: ${query}`,
        explanation: 'Here are your key priorities for today'
      }
    };
  }

  async callGeneralCampaignAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        explanation: `Campaign analysis for: ${query}`,
        focus_summary: 'Campaign insights and recommendations'
      }
    };
  }

  // Analytics - using the property correctly
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.analytics.getAnalytics();
  }

  // MCP Connections
  async getConnections(): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: []
    };
  }

  async createConnection(connectionData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: connectionData
    };
  }

  async deleteConnection(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { deleted: true }
    };
  }

  // Legacy social platforms methods
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.socialPlatforms.getConnections();
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse<SocialPlatformConnection>> {
    return this.socialPlatforms.connect(config.platform, config);
  }
}

export const apiClient = new ApiClient();
