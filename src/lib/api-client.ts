
import { ApiResponse, UserPreferences, Webhook, SocialPlatformConnection, EmailMetrics, Campaign as ImportedCampaign, SocialPost, IntegrationConnection, OAuthResponse } from '@/lib/api-client-interface';

// Local interfaces to avoid conflicts
interface BlogPost {
  id: string;
  title: string;
  content: string;
  status: string;
  tone: string;
  includeCTA: boolean;
  keyword: string;
  wordCount: number;
  createdAt: string;
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

interface Campaign {
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

interface Workflow {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  steps: any[];
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  // User Preferences
  userPreferences = {
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
            platform_user_id: '123',
            lastSync: new Date().toISOString(),
            last_sync_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };
    },

    connect: async (platform: string, config: any): Promise<ApiResponse<SocialPlatformConnection>> => {
      return {
        success: true,
        data: {
          id: '1',
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

    initiatePlatformConnection: async (platform: string): Promise<ApiResponse<OAuthResponse>> => {
      return {
        success: true,
        data: {
          authorization_url: `https://example.com/oauth/${platform}`,
          state: 'random-state'
        }
      };
    },

    disconnectPlatform: async (platformId: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { message: 'Platform disconnected successfully' }
      };
    },

    syncPlatformData: async (platformId: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { message: 'Platform data synced successfully' }
      };
    },

    testPlatformConnection: async (platformId: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { message: 'Platform connection test successful' }
      };
    }
  };

  // Analytics
  analytics = {
    getAnalyticsOverview: async (): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: {
          overview: {
            totalRevenue: 125000,
            conversionRate: 3.2,
            customerAcquisitionCost: 45,
            lifetimeValue: 1200
          }
        }
      };
    },

    getSystemStats: async (): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: {
          totalCampaigns: 50,
          activeCampaigns: 12,
          totalLeads: 1500,
          newLeadsThisMonth: 230
        }
      };
    },

    exportAnalyticsReport: async (format: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: {
          format,
          exported: true,
          downloadUrl: '/reports/analytics.pdf'
        }
      };
    }
  };

  // Integrations
  integrations = {
    getConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
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
        data: { message: 'Connection deleted successfully' }
      };
    },

    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      return {
        success: true,
        data: []
      };
    },

    createWebhook: async (webhookData: any): Promise<ApiResponse<Webhook>> => {
      return {
        success: true,
        data: {
          id: '1',
          name: webhookData.name,
          url: webhookData.url,
          events: webhookData.events,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    },

    deleteWebhook: async (id: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { message: 'Webhook deleted successfully' }
      };
    },

    testWebhook: async (id: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { message: 'Webhook test successful' }
      };
    },

    connectService: async (serviceName: string, config: any): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { message: 'Service connected successfully' }
      };
    },

    syncService: async (serviceName: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { message: 'Service synced successfully' }
      };
    },

    disconnectService: async (serviceName: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: { message: 'Service disconnected successfully' }
      };
    }
  };

  // Campaign methods
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
          endDate: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
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
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id: '1',
        name: campaignData.name,
        type: campaignData.type,
        status: 'draft',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...campaignData
      }
    };
  }

  async updateCampaign(id: string, campaignData: any): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: campaignData.name,
        type: campaignData.type,
        status: campaignData.status,
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...campaignData
      }
    };
  }

  // Content generation methods
  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: '1',
        title: brief.title,
        content: 'Generated content based on your brief',
        html_content: '<p>Generated content based on your brief</p>',
        cta: brief.cta || 'Learn More',
        seo_score: 85,
        readability_score: 90,
        engagement_prediction: 75,
        tags: brief.keywords || [],
        status: 'generated'
      }
    };
  }

  async generateBlogPost(title: string, keywords: string[], seoFocus: string): Promise<ApiResponse<BlogPost[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          title,
          content: 'Generated blog content',
          status: 'draft',
          tone: 'professional',
          includeCTA: true,
          keyword: keywords[0] || '',
          wordCount: 1200,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  async generateEmailContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        subject: `Email about ${brief.name}`,
        content: 'Generated email content',
        html_content: '<p>Generated email content</p>'
      }
    };
  }

  async generateSocialContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: 'Generated social media content',
        hashtags: ['#marketing', '#social'],
        platform: brief.platform
      }
    };
  }

  // Lead methods
  async scoreLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { message: 'Leads scored successfully' }
    };
  }

  // Agent methods
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        message: `AI response to: ${query}`,
        confidence: 0.85
      }
    };
  }

  async callDailyFocusAgent(message: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        message: `Daily focus response: ${message}`,
        type: 'daily_focus'
      }
    };
  }

  async callGeneralCampaignAgent(message: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        message: `Campaign agent response: ${message}`,
        type: 'campaign'
      }
    };
  }

  // Analytics methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        metrics: {
          campaigns: 10,
          leads: 150,
          conversion_rate: 3.2,
          revenue: 125000,
          traffic: 25000,
          engagement: 85
        },
        insights: [],
        period: 'monthly',
        last_updated: new Date().toISOString()
      }
    };
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    return {
      success: true,
      data: {
        totalSent: 1000,
        delivered: 950,
        opened: 380,
        clicked: 76,
        bounced: 25,
        unsubscribed: 5,
        openRate: 40,
        clickRate: 8,
        bounceRate: 2.5
      }
    };
  }

  // Social platform methods
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.socialPlatforms.getConnections();
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse<SocialPlatformConnection>> {
    return this.socialPlatforms.connect(config.platform, config);
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Sample Workflow',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          steps: []
        }
      ]
    };
  }
}

export const apiClient = new ApiClient();
