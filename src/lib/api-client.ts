import { ApiResponse, SocialPlatformConnection, IntegrationConnection, Webhook, Campaign, UserPreferences, Workflow } from './api-client-interface';

export class ApiClient {
  // Add missing methods to ApiClient
  setToken(token: string): void {
    console.log('Setting API token:', token ? 'Token provided' : 'No token');
    // Mock implementation - in real app would set auth headers
  }

  async createContent(content: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'content-' + Date.now(),
        ...content,
        created_at: new Date().toISOString()
      }
    };
  }

  async createConnection(connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    return {
      success: true,
      data: {
        id: 'conn-' + Date.now(),
        name: connectionData.name || 'New Connection',
        type: connectionData.type || 'api',
        status: 'connected',
        config: connectionData.config || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return {
      success: true,
      data: undefined
    };
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'scheduled-post-' + Date.now(),
        ...postData,
        status: 'scheduled',
        scheduled_at: postData.scheduledTime
      }
    };
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return {
      success: true,
      data: [
        {
          id: 'twitter-1',
          platform: 'twitter',
          account_name: '@company',
          status: 'connected',
          connection_status: 'connected',
          last_sync: new Date().toISOString(),
          follower_count: 1250
        },
        {
          id: 'linkedin-1',
          platform: 'linkedin',
          account_name: 'Company Page',
          status: 'disconnected',
          connection_status: 'disconnected',
          last_sync: new Date().toISOString(),
          follower_count: 850
        }
      ]
    };
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'social-' + Date.now(),
        platform: config.platform,
        status: 'connected'
      }
    };
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: `Campaign ${id}`,
        description: 'Mock campaign description',
        type: 'email',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return {
      success: true,
      data: {
        id,
        name: data.name || `Campaign ${id}`,
        description: data.description || 'Updated campaign',
        type: data.type || 'email',
        status: data.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Campaign 1',
          description: 'First campaign',
          type: 'email',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    };
  }

  // Create a socialPlatforms object with methods
  socialPlatforms = {
    getPlatformConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return this.getSocialPlatforms();
    },
    
    initiatePlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: {
          platform,
          status: 'connected',
          connected_at: new Date().toISOString()
        }
      };
    },
    
    disconnectPlatform: async (platform: string): Promise<ApiResponse<void>> => {
      return { success: true, data: undefined };
    },
    
    syncPlatformData: async (platform: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { synced_at: new Date().toISOString() } };
    },
    
    testPlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { status: 'connected', tested_at: new Date().toISOString() } };
    }
  };

  // Create integrations object with methods
  integrations = {
    getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
      return {
        success: true,
        data: [
          {
            id: '1',
            name: 'Test Integration',
            type: 'api',
            status: 'connected',
            config: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };
    },
    
    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      return {
        success: true,
        data: [
          {
            id: '1',
            name: 'Test Webhook',
            url: 'https://example.com/webhook',
            events: ['user.created'],
            active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };
    },
    
    createWebhook: async (data: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      return {
        success: true,
        data: {
          id: 'webhook-' + Date.now(),
          name: data.name || 'New Webhook',
          url: data.url || '',
          events: data.events || [],
          active: data.active || true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    },
    
    deleteWebhook: async (id: string): Promise<ApiResponse<void>> => {
      return { success: true, data: undefined };
    },
    
    testWebhook: async (id: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { status: 'success', tested_at: new Date().toISOString() } };
    },
    
    connectService: async (service: string, apiKey: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { service, status: 'connected' } };
    },
    
    syncService: async (service: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { service, synced_at: new Date().toISOString() } };
    },
    
    disconnectService: async (service: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { service, status: 'disconnected' } };
    }
  };

  // Create userPreferences object with methods
  userPreferences = {
    getUserPreferences: async (category?: string): Promise<ApiResponse<any>> => {
      return {
        success: true,
        data: [
          {
            preference_data: {
              theme: 'light',
              notifications: true,
              language: 'en'
            }
          }
        ]
      };
    },
    
    updateUserPreferences: async (category: string, data: any): Promise<ApiResponse<any>> => {
      return { success: true, data };
    },
    
    get: async (): Promise<ApiResponse<UserPreferences>> => {
      return {
        success: true,
        data: {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      };
    },
    
    update: async (data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> => {
      return { success: true, data: data as UserPreferences };
    }
  };

  async queryAgent(query: string, context: any): Promise<ApiResponse<any>> {
    console.log('Querying agent with:', query, context);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        message: `Response to: ${query}`,
        context
      }
    };
  }

  async getBlogAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        views: 1234,
        shares: 56,
        likes: 78,
        comments: 23,
        leads: 12,
        conversionRate: 0.05
      }
    };
  }

  async getEmailMetrics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        totalSent: 1000,
        delivered: 950,
        opened: 250,
        clicked: 50,
        bounced: 20,
        unsubscribed: 10,
        openRate: 0.25,
        clickRate: 0.05,
        bounceRate: 0.02
      }
    };
  }

  async getSocialMediaPosts(): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [
        { id: '1', content: 'Post 1', likes: 10, shares: 5 },
        { id: '2', content: 'Post 2', likes: 15, shares: 8 }
      ]
    };
  }

  async createSocialPost(postData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'new-post-' + Date.now(),
        ...postData,
        created_at: new Date().toISOString()
      }
    };
  }

  async getSocialAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        followers: 1234,
        engagement: 567,
        reach: 890
      }
    };
  }

  async generateSocialContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        content: `Generated social content for ${brief.topic || 'your brand'}`,
        suggestions: ['Use relevant hashtags', 'Engage with followers']
      }
    };
  }

  async generateEmailContent(brief: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        subject: `Email about ${brief.topic || 'your campaign'}`,
        content: `Generated email content for ${brief.audience || 'your audience'}...`,
        preview: 'Email preview text...'
      }
    };
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        scored_leads: 25,
        total_leads: 100,
        average_score: 75
      }
    };
  }

  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrations.getConnections();
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        totalCampaigns: Math.floor(Math.random() * 50) + 10,
        activeLeads: Math.floor(Math.random() * 100) + 50,
        conversionRate: Math.random() * 0.1 + 0.05,
        totalUsers: Math.floor(Math.random() * 1000) + 100,
        activeFeatures: ['campaigns', 'leads', 'analytics'],
        recentActions: [
          { action: 'Campaign Created', timestamp: new Date(), feature: 'campaigns' },
          { action: 'Lead Scored', timestamp: new Date(), feature: 'leads' }
        ],
        systemHealth: {
          status: 'healthy',
          uptime: 99.9,
          lastCheck: new Date()
        }
      }
    };
  }

  async getLeads(): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', score: 85 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', score: 92 }
      ]
    };
  }

  async callGeneralCampaignAgent(message: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        message: `Based on your ${campaigns.length} campaigns, here's my analysis: ${message}`,
        suggestions: ['Consider A/B testing', 'Optimize send times']
      }
    };
  }

  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.getEmailMetrics();
  }
}

export const apiClient = new ApiClient();
