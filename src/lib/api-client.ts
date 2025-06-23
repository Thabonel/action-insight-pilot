
import { ApiResponse } from './api-client-interface';
import type { 
  UserPreferences, 
  Webhook, 
  SocialPlatformConnection, 
  EmailMetrics, 
  Campaign as ImportedCampaign, 
  SocialPost, 
  IntegrationConnection,
  OAuthResponse 
} from './api-client-interface';

// Use imported types directly to avoid conflicts
export type ContentBrief = {
  title: string;
  content_type: string;
  target_audience: string;
  key_messages: string[];
  platform: string;
  tone?: string;
  length?: string;
  keywords?: string[];
  cta?: string;
  type?: string;
  topic?: string;
  audience?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  status: string;
  author: string;
  keyword: string;
  wordCount: number;
  createdAt: string;
  created_at?: string;
  updated_at?: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  triggers: any[];
  actions: any[];
  created_at: string;
  updated_at: string;
};

export type Campaign = ImportedCampaign;

export class ApiClient {
  private baseURL = 'https://api.example.com';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  // User Preferences
  userPreferences = {
    get: async (category: string): Promise<ApiResponse<any[]>> => {
      return { success: true, data: [] };
    },
    getUserPreferences: async (category: string): Promise<ApiResponse<any[]>> => {
      return { success: true, data: [] };
    },
    updateUserPreferences: async (category: string, preferences: any): Promise<ApiResponse<any>> => {
      return { success: true, data: preferences };
    }
  };

  // Social Platforms
  socialPlatforms = {
    getConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return { 
        success: true, 
        data: [
          {
            id: '1',
            platform: 'twitter',
            platform_name: 'Twitter',
            status: 'connected',
            connection_status: 'connected',
            username: 'testuser',
            platform_username: 'testuser',
            platform_user_id: 'user123',
            lastSync: new Date().toISOString(),
            last_sync_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
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
          auth_url: `https://auth.${platform}.com/oauth`,
          authorization_url: `https://auth.${platform}.com/oauth`
        } 
      };
    },
    disconnectPlatform: async (platformId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { message: 'Platform disconnected' } };
    },
    syncPlatformData: async (platformId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { message: 'Data synced' } };
    },
    testPlatformConnection: async (platformId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { message: 'Connection test successful' } };
    }
  };

  getSocialPlatforms = this.socialPlatforms.getConnections;
  connectSocialPlatform = this.socialPlatforms.connect;

  // Integrations
  integrations = {
    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      return { success: true, data: [] };
    },
    createWebhook: async (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      return { 
        success: true, 
        data: {
          id: Date.now().toString(),
          name: webhookData.name || '',
          url: webhookData.url || '',
          events: webhookData.events || [],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    },
    deleteWebhook: async (webhookId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { message: 'Webhook deleted' } };
    },
    testWebhook: async (webhookId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { message: 'Webhook test successful' } };
    },
    getConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return this.socialPlatforms.getConnections();
    },
    connectService: async (service: string, apiKey: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { message: 'Service connected' } };
    },
    syncService: async (service: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { message: 'Service synced' } };
    },
    disconnectService: async (service: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { message: 'Service disconnected' } };
    }
  };

  // Conversational agents
  callDailyFocusAgent = async (query: string): Promise<ApiResponse<any>> => {
    return { 
      success: true, 
      data: { 
        focus_summary: 'Based on your data, focus on email campaign optimization today.',
        explanation: 'Your email open rates have been declining. Consider A/B testing subject lines.'
      } 
    };
  };

  callGeneralCampaignAgent = async (query: string): Promise<ApiResponse<any>> => {
    return { 
      success: true, 
      data: { 
        explanation: 'Here are insights about your marketing campaigns.',
        recommendations: ['Increase social media posting frequency', 'Optimize landing pages']
      } 
    };
  };

  // Blog methods
  getBlogPosts = async (): Promise<ApiResponse<BlogPost[]>> => {
    return { 
      success: true, 
      data: [
        {
          id: '1',
          title: 'Sample Blog Post',
          content: 'This is sample content',
          status: 'published',
          author: 'John Doe',
          keyword: 'marketing',
          wordCount: 500,
          createdAt: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ] 
    };
  };

  generateBlogPost = async (brief: ContentBrief): Promise<ApiResponse<BlogPost>> => {
    return { 
      success: true, 
      data: {
        id: Date.now().toString(),
        title: brief.title,
        content: 'Generated blog content based on your brief.',
        status: 'draft',
        author: 'AI Assistant',
        keyword: brief.keywords?.[0] || 'general',
        wordCount: 800,
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  };

  deleteBlogPost = async (id: string): Promise<ApiResponse<any>> => {
    return { success: true, data: { message: 'Blog post deleted' } };
  };

  // Content methods
  generateContent = async (brief: ContentBrief): Promise<ApiResponse<any>> => {
    return { 
      success: true, 
      data: { 
        content: 'Generated content based on your brief.',
        html_content: '<p>Generated content based on your brief.</p>',
        id: Date.now().toString(),
        title: brief.title,
        cta: brief.cta || 'Learn More',
        seo_score: 85,
        readability_score: 90,
        engagement_prediction: 75,
        tags: brief.key_messages || [],
        status: 'generated'
      } 
    };
  };

  generateEmailContent = async (brief: any): Promise<ApiResponse<any>> => {
    return { 
      success: true, 
      data: { 
        content: 'Generated email content based on your campaign brief.',
        subject: brief.name || 'Email Campaign',
        template: 'professional'
      } 
    };
  };

  generateSocialContent = async (brief: ContentBrief): Promise<ApiResponse<any>> => {
    return { 
      success: true, 
      data: { 
        content: `Generated ${brief.platform} post content.`,
        platform: brief.platform,
        scheduled_time: new Date().toISOString()
      } 
    };
  };

  createContent = async (contentData: any): Promise<ApiResponse<any>> => {
    return { success: true, data: { id: Date.now().toString(), ...contentData } };
  };

  // Social methods
  getSocialPosts = async (): Promise<ApiResponse<SocialPost[]>> => {
    return { success: true, data: [] };
  };

  scheduleSocialPost = async (postData: any): Promise<ApiResponse<SocialPost>> => {
    return { 
      success: true, 
      data: {
        id: Date.now().toString(),
        content: postData.content,
        platform: postData.platform,
        scheduledTime: postData.scheduled_time || new Date().toISOString(),
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
    };
  };

  // Workflow methods
  getWorkflows = async (): Promise<ApiResponse<Workflow[]>> => {
    return { success: true, data: [] };
  };

  createWorkflow = async (workflowData: any): Promise<ApiResponse<Workflow>> => {
    return { 
      success: true, 
      data: {
        id: Date.now().toString(),
        name: workflowData.name,
        description: workflowData.description || '',
        status: 'draft',
        triggers: workflowData.triggers || [],
        actions: workflowData.actions || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  };

  executeWorkflow = async (workflowId: string, data: any): Promise<ApiResponse<any>> => {
    return { success: true, data: { message: 'Workflow executed successfully' } };
  };

  getWorkflowStatus = async (workflowId: string): Promise<ApiResponse<any>> => {
    return { success: true, data: { status: 'completed', progress: 100 } };
  };

  updateWorkflow = async (workflowId: string, updates: any): Promise<ApiResponse<Workflow>> => {
    return { 
      success: true, 
      data: {
        id: workflowId,
        name: updates.name || 'Updated Workflow',
        description: updates.description || '',
        status: updates.status || 'active',
        triggers: updates.triggers || [],
        actions: updates.actions || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  };

  deleteWorkflow = async (workflowId: string): Promise<ApiResponse<any>> => {
    return { success: true, data: { message: 'Workflow deleted' } };
  };

  // Metrics methods
  getRealTimeMetrics = async (): Promise<ApiResponse<any>> => {
    return { 
      success: true, 
      data: { 
        active_campaigns: 5,
        total_leads: 150,
        conversion_rate: 12.5,
        revenue: 45000
      } 
    };
  };

  getEmailMetrics = async (): Promise<ApiResponse<EmailMetrics>> => {
    return { 
      success: true, 
      data: {
        totalSent: 1000,
        delivered: 950,
        opened: 380,
        clicked: 76,
        bounced: 50,
        unsubscribed: 5,
        openRate: 40,
        clickRate: 8,
        bounceRate: 5
      }
    };
  };

  // Leads methods
  getLeads = async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] };
  };

  scoreLeads = async (): Promise<ApiResponse<any>> => {
    return { success: true, data: { message: 'Leads scored successfully' } };
  };

  exportLeads = async (format: string): Promise<ApiResponse<any>> => {
    return { success: true, data: { download_url: 'https://example.com/leads.csv' } };
  };

  syncLeads = async (): Promise<ApiResponse<any>> => {
    return { success: true, data: { message: 'Leads synced successfully' } };
  };

  // Campaign methods
  getCampaigns = async (): Promise<ApiResponse<Campaign[]>> => {
    return { success: true, data: [] };
  };

  getCampaign = async (id: string): Promise<ApiResponse<Campaign>> => {
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
  };

  getCampaignById = this.getCampaign;

  updateCampaign = async (id: string, updates: any): Promise<ApiResponse<Campaign>> => {
    return { 
      success: true, 
      data: {
        id,
        name: updates.name || 'Updated Campaign',
        type: updates.type || 'email',
        status: updates.status || 'active',
        startDate: updates.startDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  };

  // Analytics methods
  analytics = async (): Promise<ApiResponse<any>> => {
    return { 
      success: true, 
      data: { 
        overview: {
          total_campaigns: 10,
          active_leads: 500,
          conversion_rate: 15.2
        }
      } 
    };
  };

  getAnalytics = this.analytics;

  getSystemHealth = async (): Promise<ApiResponse<any>> => {
    return { 
      success: true, 
      data: { 
        status: 'healthy',
        uptime: '99.9%',
        response_time: '150ms'
      } 
    };
  };

  // MCP Connection methods
  getConnections = async (): Promise<ApiResponse<IntegrationConnection[]>> => {
    return { success: true, data: [] };
  };

  createConnection = async (connectionData: any): Promise<ApiResponse<IntegrationConnection>> => {
    return { 
      success: true, 
      data: {
        id: Date.now().toString(),
        name: connectionData.name,
        type: connectionData.type,
        status: 'connected',
        service_name: connectionData.service_name,
        connection_status: 'connected',
        sync_status: 'idle',
        last_sync_at: new Date().toISOString()
      }
    };
  };

  deleteConnection = async (connectionId: string): Promise<ApiResponse<any>> => {
    return { success: true, data: { message: 'Connection deleted' } };
  };
}

export const apiClient = new ApiClient();
