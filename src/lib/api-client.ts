import { ApiResponse, UserPreferences, Webhook, SocialPlatformConnection, EmailMetrics, Campaign, SocialPost, IntegrationConnection, OAuthResponse } from '@/lib/api-client-interface';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  keyword: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  author?: string;
  tags?: string[];
}

export interface ContentBrief {
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

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'running';
  trigger_type: string;
  actions: any[];
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  source: string;
  status: string;
  score?: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'mixed';
  status: 'draft' | 'active' | 'paused' | 'completed';
  description?: string;
  budget?: number;
  target_audience?: string;
  timeline?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  content: string;
  platform: string;
  scheduled_time?: string;
  status: 'scheduled' | 'posted' | 'failed';
  created_at?: string;
  updated_at?: string;
}

export class ApiClient {
  private baseUrl = '';
  private token = '';

  setToken(token: string) {
    this.token = token;
  }

  async getLeads(): Promise<ApiResponse<Lead[]>> {
    return {
      success: true,
      data: []
    };
  }

  async getLeadById(id: string): Promise<ApiResponse<Lead>> {
    return {
      success: true,
      data: {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        source: 'website',
        status: 'new',
        created_at: new Date().toISOString()
      }
    };
  }

  async createLead(leadData: any): Promise<ApiResponse<Lead>> {
    return {
      success: true,
      data: {
        id: '1',
        ...leadData,
        created_at: new Date().toISOString()
      }
    };
  }

  async updateLead(id: string, leadData: any): Promise<ApiResponse<Lead>> {
    return {
      success: true,
      data: {
        id,
        ...leadData,
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteLead(id: string): Promise<ApiResponse<void>> {
    return {
      success: true
    };
  }

  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return {
      success: true,
      data: []
    };
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: 'Sample Campaign',
        type: 'email',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Campaign
    };
  }

  async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: campaignData.name || 'Updated Campaign',
        type: campaignData.type || 'email',
        status: campaignData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Campaign
    };
  }

  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return {
      success: true,
      data: []
    };
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<void>> {
    return {
      success: true
    };
  }

  async generateBlogPost(topic: string, audience: string, tone: string): Promise<ApiResponse<BlogPost>> {
    return {
      success: true,
      data: {
        id: '1',
        title: `Generated Blog: ${topic}`,
        content: `Generated content for ${topic} targeting ${audience} with ${tone} tone`,
        excerpt: 'Generated excerpt',
        status: 'draft',
        keyword: topic,
        wordCount: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id: '1',
        name: campaignData.name || '',
        type: campaignData.type || 'email',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        budget: typeof campaignData.budget === 'string' ? parseFloat(campaignData.budget) : campaignData.budget
      } as Campaign
    };
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: '1',
        title: brief.title,
        content: `Generated content for ${brief.topic}`,
        html_content: `<p>Generated content for ${brief.topic}</p>`,
        cta: brief.cta || 'Learn More',
        seo_score: 85,
        readability_score: 78,
        engagement_prediction: 82,
        tags: brief.keywords || [],
        status: 'generated'
      }
    };
  }

  async generateEmailContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        subject: `Email about ${brief.name || brief.topic}`,
        content: `Generated email content for ${brief.target_audience}`,
        suggestions: [
          'Consider adding personalization',
          'Include a clear call-to-action',
          'Test different subject lines'
        ]
      }
    };
  }

  async createContent(contentData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: '1',
        ...contentData,
        created_at: new Date().toISOString()
      }
    };
  }

  async scoreLeads(leadIds: string[]): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: leadIds.map(id => ({
        id,
        score: Math.floor(Math.random() * 100),
        factors: ['Email engagement', 'Website activity']
      }))
    };
  }

  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return {
      success: true,
      data: []
    };
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<SocialPost>> {
    return {
      success: true,
      data: {
        id: '1',
        content: postData.content,
        platform: postData.platform,
        scheduled_time: postData.scheduled_time,
        status: 'scheduled'
      } as SocialPost
    };
  }

  async generateSocialContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated social content for ${brief.platform}`,
        hashtags: brief.keywords || [],
        engagement_prediction: 75
      }
    };
  }

  async connectSocialPlatform(platform: string, config: any): Promise<ApiResponse<SocialPlatformConnection>> {
    return {
      success: true,
      data: {
        id: '1',
        platform,
        status: 'connected',
        connected_at: new Date().toISOString()
      } as SocialPlatformConnection
    };
  }

  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        campaigns: 10,
        leads: 150,
        emails_sent: 2500,
        open_rate: 25.5,
        click_rate: 3.2
      }
    };
  }

  async exportLeads(filters: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        download_url: '/exports/leads.csv',
        expires_at: new Date(Date.now() + 3600000).toISOString()
      }
    };
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        synced_count: 25,
        new_leads: 5,
        updated_leads: 20
      }
    };
  }

  async getSystemHealth(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        status: 'healthy',
        uptime: 99.9,
        response_time: 150
      }
    };
  }

  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return {
      success: true,
      data: []
    };
  }

  async createWorkflow(workflowData: any): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: {
        id: '1',
        name: workflowData.name,
        description: workflowData.description,
        status: 'active',
        trigger_type: workflowData.trigger_type,
        actions: workflowData.actions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async executeWorkflow(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        execution_id: '1',
        status: 'running',
        started_at: new Date().toISOString()
      }
    };
  }

  async getWorkflowStatus(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        status: 'completed',
        completed_at: new Date().toISOString()
      }
    };
  }

  async updateWorkflow(id: string, workflowData: any): Promise<ApiResponse<Workflow>> {
    return {
      success: true,
      data: {
        id,
        name: workflowData.name,
        description: workflowData.description,
        status: workflowData.status,
        trigger_type: workflowData.trigger_type,
        actions: workflowData.actions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return {
      success: true
    };
  }

  integrations = {
    getConnections: async () => ({
      success: true,
      data: []
    }),
    createConnection: async (connectionData: any) => ({
      success: true,
      data: { id: '1', ...connectionData }
    }),
    deleteConnection: async (id: string) => ({
      success: true
    })
  };

  analytics = {
    getOverview: async () => ({
      success: true,
      data: {}
    }),
    getSystemStats: async () => ({
      success: true,
      data: {}
    }),
    getAnalyticsOverview: async () => ({
      success: true,
      data: {}
    }),
    exportAnalyticsReport: async (format: string) => ({
      success: true,
      data: { format, exported: true }
    })
  };

  userPreferences = {
    getUserPreferences: async (type: string) => ({
      success: true,
      data: []
    }),
    updateUserPreferences: async (type: string, preferences: any) => ({
      success: true,
      data: { type, ...preferences }
    })
  };

  socialPlatforms = {
    getAll: async () => ({
      success: true,
      data: []
    }),
    connect: async (platform: string, config: any) => ({
      success: true,
      data: { platform, ...config }
    }),
    disconnect: async (id: string) => ({
      success: true
    }),
    getStatus: async (platform: string) => ({
      success: true,
      data: { platform, status: 'connected' }
    }),
    getPlatformConnections: async () => ({
      success: true,
      data: []
    }),
    initiatePlatformConnection: async (platform: string) => ({
      success: true,
      data: { platform, auth_url: `https://auth.${platform}.com` }
    }),
    disconnectPlatform: async (id: string) => ({
      success: true
    }),
    syncPlatformData: async (id: string) => ({
      success: true,
      data: { synced: true }
    }),
    testPlatformConnection: async (id: string) => ({
      success: true,
      data: { status: 'connected' }
    })
  };
}

export const apiClient = new ApiClient();
