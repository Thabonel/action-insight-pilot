
import { ApiResponse, Campaign, SocialPost, EmailMetrics, SocialPlatformConnection, IntegrationConnection, Webhook, UserPreferences } from './api-client-interface';

// Local interfaces to avoid conflicts
interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  keyword: string;
  wordCount: number;
  createdAt: string;
  tone: string;
  includeCTA: boolean;
}

interface ContentBrief {
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

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  created_at: string;
  updated_at: string;
  steps: any[];
}

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = '/api';
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const campaigns: Campaign[] = [
        {
          id: '1',
          name: 'Sample Campaign',
          type: 'email',
          status: 'active',
          startDate: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return { success: true, data: campaigns };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const campaign: Campaign = {
        id,
        name: 'Sample Campaign',
        type: 'email',
        status: 'active',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { success: true, data: campaign };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    try {
      const campaign: Campaign = {
        id: Math.random().toString(36).substr(2, 9),
        name: campaignData.name,
        type: campaignData.type,
        status: 'draft',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...campaignData
      };
      return { success: true, data: campaign };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Blog methods
  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    try {
      const posts: BlogPost[] = [];
      return { success: true, data: posts };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async generateBlogPost(prompt: string, keyword: string, tone: string): Promise<ApiResponse<BlogPost[]>> {
    try {
      const post: BlogPost = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Generated Blog Post',
        content: 'Generated content based on your prompt...',
        excerpt: 'Blog post excerpt...',
        author: 'AI Assistant',
        publishedAt: new Date().toISOString(),
        tags: [keyword],
        status: 'draft',
        keyword,
        wordCount: 500,
        createdAt: new Date().toISOString(),
        tone,
        includeCTA: true
      };
      return { success: true, data: [post] };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<void>> {
    try {
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Content methods
  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    try {
      const content = {
        id: Math.random().toString(36).substr(2, 9),
        title: brief.title,
        content: 'Generated content...',
        html_content: '<p>Generated HTML content...</p>',
        cta: brief.cta || 'Learn More',
        seo_score: 85,
        readability_score: 90,
        engagement_prediction: 75,
        tags: brief.keywords || [],
        status: 'generated'
      };
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createContent(contentData: any): Promise<ApiResponse<any>> {
    try {
      const content = {
        id: Math.random().toString(36).substr(2, 9),
        ...contentData,
        created_at: new Date().toISOString()
      };
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Email methods
  async generateEmailContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return this.generateContent(brief);
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    try {
      const metrics: EmailMetrics = {
        totalSent: 1000,
        delivered: 950,
        opened: 400,
        clicked: 100,
        bounced: 50,
        unsubscribed: 25,
        openRate: 42.1,
        clickRate: 25.0,
        bounceRate: 5.3
      };
      return { success: true, data: metrics };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Social methods
  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    try {
      const posts: SocialPost[] = [];
      return { success: true, data: posts };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async generateSocialContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return this.generateContent(brief);
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<SocialPost>> {
    try {
      const post: SocialPost = {
        id: Math.random().toString(36).substr(2, 9),
        content: postData.content,
        platform: postData.platform,
        scheduledTime: postData.scheduledTime,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };
      return { success: true, data: post };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Analytics methods
  async analytics(): Promise<ApiResponse<any>> {
    try {
      const data = {
        metrics: {
          campaigns: 5,
          leads: 150,
          conversion_rate: 3.2,
          revenue: 25000,
          traffic: 5000,
          engagement: 85
        },
        insights: [],
        period: '30d',
        last_updated: new Date().toISOString()
      };
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse<any[]>> {
    try {
      const leads = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'qualified',
          created_at: new Date().toISOString()
        }
      ];
      return { success: true, data: leads };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async exportLeads(format: string): Promise<ApiResponse<any>> {
    try {
      return { success: true, data: { downloadUrl: '/exports/leads.csv' } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async syncLeads(): Promise<ApiResponse<void>> {
    try {
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // AI Agent methods
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    try {
      const response = {
        message: `AI response to: ${query}`,
        suggestions: ['Try this', 'Consider that'],
        timestamp: new Date().toISOString()
      };
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async callDailyFocusAgent(context: string): Promise<ApiResponse<any>> {
    try {
      const response = {
        focus_areas: ['Priority Task 1', 'Priority Task 2'],
        recommendations: ['Focus on high-impact activities'],
        context
      };
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async callGeneralCampaignAgent(context: string): Promise<ApiResponse<any>> {
    try {
      const response = {
        campaign_suggestions: ['Email Campaign', 'Social Media Push'],
        optimization_tips: ['Improve targeting', 'A/B test subject lines'],
        context
      };
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Metrics methods
  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    try {
      const metrics = {
        active_users: 1,
        campaigns_running: 3,
        leads_today: 15,
        performance_score: 92
      };
      return { success: true, data: metrics };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    try {
      const health = {
        status: 'healthy',
        uptime: 99.9,
        response_time: 120,
        last_check: new Date().toISOString()
      };
      return { success: true, data: health };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    try {
      const workflows: Workflow[] = [];
      return { success: true, data: workflows };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createWorkflow(workflowData: any): Promise<ApiResponse<Workflow>> {
    try {
      const workflow: Workflow = {
        id: Math.random().toString(36).substr(2, 9),
        name: workflowData.name,
        description: workflowData.description,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        steps: workflowData.steps || []
      };
      return { success: true, data: workflow };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async executeWorkflow(id: string): Promise<ApiResponse<any>> {
    try {
      const result = {
        workflow_id: id,
        status: 'executing',
        started_at: new Date().toISOString()
      };
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getWorkflowStatus(id: string): Promise<ApiResponse<any>> {
    try {
      const status = {
        id,
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString()
      };
      return { success: true, data: status };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateWorkflow(id: string, workflowData: any): Promise<ApiResponse<Workflow>> {
    try {
      const workflow: Workflow = {
        id,
        name: workflowData.name,
        description: workflowData.description,
        status: workflowData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        steps: workflowData.steps || []
      };
      return { success: true, data: workflow };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    try {
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Social Platform methods
  socialPlatforms = {
    getConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      try {
        const connections: SocialPlatformConnection[] = [
          {
            id: '1',
            platform: 'twitter',
            platform_name: 'Twitter',
            status: 'connected',
            connection_status: 'connected',
            username: 'example_user',
            platform_username: 'example_user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return { success: true, data: connections };
      } catch (error) {
        return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    connect: async (platform: string, config: any): Promise<ApiResponse<SocialPlatformConnection>> => {
      try {
        const connection: SocialPlatformConnection = {
          id: Math.random().toString(36).substr(2, 9),
          platform,
          platform_name: platform,
          status: 'connected',
          connection_status: 'connected',
          username: config.username,
          platform_username: config.username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, data: connection };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    getPlatformConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return this.getConnections();
    },

    initiatePlatformConnection: async (platform: string): Promise<ApiResponse<{ platform: string; auth_url: string; }>> => {
      try {
        const data = {
          platform,
          auth_url: `https://example.com/auth/${platform}`
        };
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    disconnectPlatform: async (platform: string): Promise<ApiResponse<void>> => {
      try {
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    syncPlatformData: async (platform: string): Promise<ApiResponse<void>> => {
      try {
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    testPlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
      try {
        const result = {
          platform,
          status: 'success',
          response_time: 120
        };
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  };

  // User Preferences methods
  userPreferences = {
    getUserPreferences: async (category: string): Promise<ApiResponse<any[]>> => {
      try {
        const preferences = [
          {
            key: 'theme',
            value: 'dark',
            category
          }
        ];
        return { success: true, data: preferences };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    updateUserPreferences: async (category: string, preferences: any): Promise<ApiResponse<any>> => {
      try {
        return { success: true, data: { category, ...preferences } };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    get: async (key: string): Promise<ApiResponse<any>> => {
      try {
        return { success: true, data: { key, value: 'default_value' } };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  };

  // Integration methods - return IntegrationConnection instead of SocialPlatformConnection
  integrations = {
    getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
      try {
        const connections: IntegrationConnection[] = [
          {
            id: '1',
            name: 'Example Integration',
            type: 'social',
            status: 'connected',
            service_name: 'twitter',
            connection_status: 'connected',
            sync_status: 'idle',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return { success: true, data: connections };
      } catch (error) {
        return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    createConnection: async (connectionData: any): Promise<ApiResponse<IntegrationConnection>> => {
      try {
        const connection: IntegrationConnection = {
          id: Math.random().toString(36).substr(2, 9),
          name: connectionData.name,
          type: connectionData.type,
          status: 'connected',
          service_name: connectionData.service_name,
          connection_status: 'connected',
          sync_status: 'idle',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, data: connection };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    deleteConnection: async (id: string): Promise<ApiResponse<void>> => {
      try {
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      try {
        const webhooks: Webhook[] = [];
        return { success: true, data: webhooks };
      } catch (error) {
        return { success: false, data: [], error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    createWebhook: async (webhookData: any): Promise<ApiResponse<Webhook>> => {
      try {
        const webhook: Webhook = {
          id: Math.random().toString(36).substr(2, 9),
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, data: webhook };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    deleteWebhook: async (id: string): Promise<ApiResponse<void>> => {
      try {
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    testWebhook: async (id: string): Promise<ApiResponse<any>> => {
      try {
        return { success: true, data: { status: 'success', response_time: 150 } };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    connectService: async (serviceData: any): Promise<ApiResponse<any>> => {
      try {
        return { success: true, data: { service: serviceData.service, status: 'connected' } };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    syncService: async (serviceId: string): Promise<ApiResponse<any>> => {
      try {
        return { success: true, data: { service_id: serviceId, status: 'synced' } };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    disconnectService: async (serviceId: string): Promise<ApiResponse<void>> => {
      try {
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }
  };

  // MCP Connection methods - use integrations methods but map return types
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrations.getConnections();
  }

  async createConnection(connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    return this.integrations.createConnection(connectionData);
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return this.integrations.deleteConnection(id);
  }
}

export const apiClient = new ApiClient();
