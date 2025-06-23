
import { HttpClient } from './http-client';
import { UserPreferencesService } from './api/user-preferences-service';

// Use the existing interfaces from api-client-interface.ts
import { 
  ApiResponse, 
  UserPreferences, 
  EmailMetrics, 
  Campaign, 
  SocialPost, 
  IntegrationConnection, 
  SocialPlatformConnection,
  OAuthResponse 
} from './api-client-interface';

// Local interfaces to avoid conflicts
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
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  tone?: string;
  includeCTA?: boolean;
}

interface BlogPostParams {
  title: string;
  topic: string;
  audience: string;
  tone: string;
  length: string;
  keywords: string[];
  includeCTA: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  steps: any[];
  created_at: string;
  updated_at: string;
}

interface Lead {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  status: string;
  lead_score: number;
  created_at: string;
}

export class ApiClient {
  private httpClient: HttpClient;
  public userPreferences: UserPreferencesService;
  private authToken: string | null = null;

  constructor() {
    this.httpClient = new HttpClient();
    this.userPreferences = new UserPreferencesService(this.httpClient);
  }

  setToken(token: string) {
    this.authToken = token;
    this.httpClient.setAuthToken(token);
  }

  // User Preferences
  async getUserPreferences(): Promise<ApiResponse<UserPreferences>> {
    return this.userPreferences.getUserPreferences();
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return this.userPreferences.updateUserPreferences('general', preferences);
  }

  // Social Platforms
  socialPlatforms = {
    getAll: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return {
        success: true,
        data: [
          {
            id: '1',
            platform: 'twitter',
            platform_name: 'Twitter',
            status: 'connected',
            connection_status: 'connected',
            username: 'example_user',
            platform_username: 'example_user',
            created_at: new Date().toISOString()
          }
        ]
      };
    },

    connect: async (platform: string, config: any = {}): Promise<ApiResponse<SocialPlatformConnection>> => {
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          platform,
          platform_name: platform,
          status: 'connected',
          connection_status: 'connected',
          username: config.username || 'user',
          platform_username: config.username || 'user',
          created_at: new Date().toISOString()
        }
      };
    },

    disconnect: async (platformId: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    }
  };

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.socialPlatforms.getAll();
  }

  async connectSocialPlatform(data: { platform: string; [key: string]: any }): Promise<ApiResponse<SocialPlatformConnection>> {
    return this.socialPlatforms.connect(data.platform, data);
  }

  // Integrations
  integrations = {
    getWebhooks: async (): Promise<ApiResponse<any[]>> => {
      return { success: true, data: [] };
    },

    createWebhook: async (webhookData: any): Promise<ApiResponse<any>> => {
      return { success: true, data: { id: Date.now().toString(), ...webhookData } };
    },

    updateWebhook: async (id: string, webhookData: any): Promise<ApiResponse<any>> => {
      return { success: true, data: { id, ...webhookData } };
    },

    deleteWebhook: async (id: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    },

    getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
      return {
        success: true,
        data: [
          {
            id: '1',
            name: 'Example Integration',
            type: 'social',
            status: 'connected',
            service_name: 'example',
            connection_status: 'connected',
            sync_status: 'idle',
            configuration: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };
    },

    createConnection: async (connectionData: any): Promise<ApiResponse<IntegrationConnection>> => {
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          name: connectionData.name || 'New Connection',
          type: connectionData.type || 'integration',
          status: 'connected',
          service_name: connectionData.service_name || 'service',
          connection_status: 'connected',
          sync_status: 'idle',
          configuration: connectionData.configuration || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    },

    deleteConnection: async (id: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    },

    connectService: async (service: string): Promise<ApiResponse<OAuthResponse>> => {
      return {
        success: true,
        data: {
          authorization_url: `https://example.com/oauth/${service}`,
          state: 'state123'
        }
      };
    },

    disconnectService: async (service: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    }
  };

  async getIntegrations(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrations.getConnections();
  }

  async getOAuthUrl(platform: string, redirectUri: string): Promise<ApiResponse<{ auth_url: string }>> {
    return {
      success: true,
      data: {
        auth_url: `https://example.com/oauth/${platform}?redirect_uri=${encodeURIComponent(redirectUri)}`
      }
    };
  }

  // Conversational/Chat/AI Agent
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        response: `AI response to: ${query}`,
        message: `AI response to: ${query}`,
        suggestions: ['Follow up suggestion 1', 'Follow up suggestion 2']
      }
    };
  }

  async callDailyFocusAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        focus_summary: `Daily focus response for: ${query}`,
        priority_items: ['Priority 1', 'Priority 2'],
        business_impact: 'High impact on conversion rates',
        recommended_actions: ['Action 1', 'Action 2']
      }
    };
  }

  async callGeneralCampaignAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        explanation: `Campaign analysis for: ${query}`,
        business_impact: 'Moderate impact on brand awareness',
        recommended_actions: ['Review metrics', 'Optimize targeting']
      }
    };
  }

  // Blog
  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          title: 'Sample Blog Post',
          content: 'This is sample content',
          status: 'published',
          created_at: new Date().toISOString(),
          tone: 'professional',
          includeCTA: true
        }
      ]
    };
  }

  async generateBlogPost(params: BlogPostParams): Promise<ApiResponse<BlogPost>> {
    const contentBrief: ContentBrief = {
      title: params.title,
      content_type: 'blog_post',
      target_audience: params.audience,
      key_messages: [params.topic],
      platform: 'website',
      tone: params.tone,
      length: params.length,
      keywords: params.keywords,
      cta: params.includeCTA ? 'Read more' : undefined
    };

    const contentResponse = await this.generateContent(contentBrief);
    
    if (contentResponse.success && contentResponse.data) {
      return {
        success: true,
        data: {
          id: Date.now().toString(),
          title: params.title,
          content: contentResponse.data.content || 'Generated blog content',
          status: 'draft',
          created_at: new Date().toISOString(),
          tone: params.tone,
          includeCTA: params.includeCTA
        }
      };
    }

    return { success: false, error: 'Failed to generate blog post' };
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<boolean>> {
    return { success: true, data: true };
  }

  // Content
  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        title: brief.title,
        content: `Generated content for ${brief.title}`,
        html_content: `<p>Generated content for ${brief.title}</p>`,
        cta: brief.cta || 'Learn More',
        seo_score: 85,
        readability_score: 90,
        engagement_prediction: 75,
        tags: brief.keywords || [],
        status: 'generated'
      }
    };
  }

  async createContent(content: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        ...content,
        created_at: new Date().toISOString()
      }
    };
  }

  async generateEmailContent(subject: string, audience: string): Promise<ApiResponse<any>> {
    const brief: ContentBrief = {
      title: subject,
      content_type: 'email',
      target_audience: audience,
      key_messages: [subject],
      platform: 'email'
    };

    return this.generateContent(brief);
  }

  // Social
  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          content: 'Sample social post',
          platform: 'twitter',
          scheduledTime: new Date().toISOString(),
          status: 'scheduled',
          created_at: new Date().toISOString()
        }
      ]
    };
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<SocialPost>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        content: postData.content,
        platform: postData.platform,
        scheduledTime: postData.scheduledTime || new Date().toISOString(),
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
    };
  }

  // Workflows
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Sample Workflow',
          description: 'A sample workflow',
          status: 'active',
          steps: [
            { id: 1, type: 'trigger', title: 'Email Trigger', description: 'Trigger on email', icon: 'mail', color: 'blue', status: 'active' }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  async createWorkflow(workflowData: any): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        name: workflowData.name,
        description: workflowData.description,
        status: 'draft',
        steps: workflowData.steps || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async executeWorkflow(workflowId: string, data?: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        workflow_id: workflowId,
        status: 'running',
        started_at: new Date().toISOString()
      }
    };
  }

  async getWorkflowStatus(workflowId: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        workflow_id: workflowId,
        status: 'completed',
        current_step: 3,
        total_steps: 3,
        started_at: new Date().toISOString(),
        estimated_completion: new Date().toISOString()
      }
    };
  }

  async updateWorkflow(workflowId: string, updates: any): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: {
        id: workflowId,
        name: updates.name || 'Updated Workflow',
        description: updates.description || 'Updated description',
        status: updates.status || 'active',
        steps: updates.steps || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<boolean>> {
    return { success: true, data: true };
  }

  // Metrics & Analytics
  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        campaigns: 5,
        leads: 150,
        conversion_rate: 12.5,
        revenue: 25000
      }
    };
  }

  async getEmailMetrics(): Promise<ApiResponse<EmailMetrics>> {
    return {
      success: true,
      data: {
        totalSent: 1000,
        delivered: 950,
        opened: 380,
        clicked: 95,
        bounced: 50,
        unsubscribed: 5,
        openRate: 40,
        clickRate: 25,
        bounceRate: 5
      }
    };
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }

  analytics = async (): Promise<ApiResponse<any>> => {
    return {
      success: true,
      data: {
        overview: {
          total_campaigns: 10,
          active_campaigns: 5,
          total_leads: 500,
          conversion_rate: 15.2
        },
        getAnalyticsOverview: () => ({
          campaigns: 10,
          leads: 500,
          revenue: 50000,
          growth: 12.5
        })
      }
    };
  };

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.analytics();
  }

  // Leads
  async getLeads(): Promise<ApiResponse<Lead[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          email: 'lead@example.com',
          first_name: 'John',
          last_name: 'Doe',
          company: 'Example Corp',
          status: 'new',
          lead_score: 75,
          created_at: new Date().toISOString()
        }
      ]
    };
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        scored_leads: 50,
        average_score: 65,
        high_score_leads: 15
      }
    };
  }

  async exportLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        export_url: 'https://example.com/export/leads.csv',
        total_exported: 100
      }
    };
  }

  async syncLeads(): Promise<ApiResponse<void>> {
    return { success: true };
  }

  // Campaigns
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Sample Campaign',
          type: 'email',
          status: 'active',
          startDate: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        name: campaignData.name,
        type: campaignData.type || 'email',
        status: campaignData.status || 'draft',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: campaignData.description,
        budget: campaignData.budget
      }
    };
  }

  async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: 'Sample Campaign',
        type: 'email',
        status: 'active',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return this.getCampaign(id);
  }

  async updateCampaign(id: string, updates: any): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: updates.name || 'Updated Campaign',
        type: updates.type || 'email',
        status: updates.status || 'active',
        startDate: updates.startDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        description: updates.description,
        budget: updates.budget
      }
    };
  }

  // System Health
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: '99.9%',
        response_time: '120ms',
        active_connections: 150
      }
    };
  }
}

export const apiClient = new ApiClient();
