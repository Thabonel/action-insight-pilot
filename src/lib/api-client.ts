
import { BaseApiClient } from './api/base-api-client';
import { CampaignMethods } from './api/campaign-methods';
import { BrandMethods } from './api/brand-methods';
import { WorkflowMethods } from './api/workflow-methods';
import { ApiResponse, Campaign, EmailMetrics, IntegrationConnection, Webhook, UserPreferences, ChatSession, ChatMessage, SocialPlatformConnection, ContentBrief } from './api-client-interface';

export interface BlogPostParams {
  topic: string;
  audience: string;
  tone: string;
  length: string;
  keywords?: string[];
}

class ApiClient extends BaseApiClient {
  private campaignMethods: CampaignMethods;
  private brandMethods: BrandMethods;
  private workflowMethods: WorkflowMethods;

  constructor() {
    super();
    this.campaignMethods = new CampaignMethods();
    this.brandMethods = new BrandMethods();
    this.workflowMethods = new WorkflowMethods();
  }

  setToken(token: string) {
    super.setToken(token);
    this.campaignMethods.setToken(token);
    this.brandMethods.setToken(token);
    this.workflowMethods.setToken(token);
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.campaignMethods.getCampaigns();
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.campaignMethods.createCampaign(campaign);
  }

  async bulkCreateCampaigns(campaigns: Partial<Campaign>[]): Promise<ApiResponse<Campaign[]>> {
    return this.campaignMethods.bulkCreateCampaigns(campaigns);
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return this.campaignMethods.getCampaignById(id);
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return this.campaignMethods.updateCampaign(id, updates);
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return this.campaignMethods.deleteCampaign(id);
  }

  // Content generation methods
  async generateBlogPost(params: BlogPostParams): Promise<ApiResponse<{ title: string; content: string; seoScore: number }>> {
    try {
      const mockResponse = {
        title: `${params.topic}: A Comprehensive Guide`,
        content: `This is a ${params.length} blog post about ${params.topic} targeting ${params.audience} with a ${params.tone} tone.`,
        seoScore: Math.floor(Math.random() * 40) + 60
      };

      return {
        success: true,
        data: mockResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate blog post'
      };
    }
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<{ content: string; title: string }>> {
    try {
      const mockContent = {
        title: `${brief.topic} Content`,
        content: `Generated content for ${brief.platform} targeting ${brief.audience} with ${brief.tone} tone.`
      };

      return {
        success: true,
        data: mockContent
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content'
      };
    }
  }

  // Email metrics
  async getEmailMetrics(): Promise<ApiResponse<EmailMetrics>> {
    try {
      const mockMetrics: EmailMetrics = {
        totalSent: 1500,
        delivered: 1425,
        opened: 356,
        clicked: 89,
        bounced: 75,
        unsubscribed: 12,
        openRate: 0.25,
        clickRate: 0.06,
        bounceRate: 0.05
      };

      return {
        success: true,
        data: mockMetrics
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch email metrics'
      };
    }
  }

  async getRealTimeMetrics(): Promise<ApiResponse<{ views: number; engagement: number; conversions: number }>> {
    try {
      const mockMetrics = {
        views: Math.floor(Math.random() * 1000) + 500,
        engagement: Math.floor(Math.random() * 200) + 100,
        conversions: Math.floor(Math.random() * 50) + 20
      };

      return {
        success: true,
        data: mockMetrics
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch real-time metrics'
      };
    }
  }

  // Integration methods
  get integrations() {
    return {
      getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
        try {
          const mockWebhooks: Webhook[] = [
            {
              id: '1',
              name: 'Campaign Webhook',
              url: 'https://api.example.com/webhook',
              events: ['campaign.created', 'campaign.updated'],
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ];

          return {
            success: true,
            data: mockWebhooks
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch webhooks'
          };
        }
      },

      createWebhook: async (data: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
        try {
          const newWebhook: Webhook = {
            id: 'webhook-' + Date.now(),
            name: data.name || 'New Webhook',
            url: data.url || '',
            events: data.events || [],
            active: data.active || true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          return {
            success: true,
            data: newWebhook
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create webhook'
          };
        }
      },

      deleteWebhook: async (id: string): Promise<ApiResponse<void>> => {
        try {
          return {
            success: true,
            data: undefined
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete webhook'
          };
        }
      },

      testWebhook: async (id: string): Promise<ApiResponse<any>> => {
        try {
          return {
            success: true,
            data: {
              status: 'success',
              message: 'Webhook test completed successfully'
            }
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to test webhook'
          };
        }
      },

      getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
        try {
          const mockConnections: IntegrationConnection[] = [
            {
              id: '1',
              name: 'Email Service',
              type: 'email',
              status: 'connected',
              config: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              service_name: 'Email Provider',
              connection_status: 'connected',
              description: 'Email integration service'
            }
          ];

          return {
            success: true,
            data: mockConnections
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch connections'
          };
        }
      },

      connectService: async (service: string, apiKey: string): Promise<ApiResponse<any>> => {
        try {
          return {
            success: true,
            data: {
              status: 'connected',
              service: service
            }
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to connect service'
          };
        }
      },

      syncService: async (service: string): Promise<ApiResponse<any>> => {
        try {
          return {
            success: true,
            data: {
              status: 'synced',
              service: service
            }
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to sync service'
          };
        }
      },

      disconnectService: async (service: string): Promise<ApiResponse<any>> => {
        try {
          return {
            success: true,
            data: {
              status: 'disconnected',
              service: service
            }
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to disconnect service'
          };
        }
      }
    };
  }

  // User preferences
  get userPreferences() {
    return {
      get: async (): Promise<ApiResponse<UserPreferences>> => {
        try {
          const mockPreferences: UserPreferences = {
            theme: 'light',
            notifications: true,
            language: 'en',
            timezone: 'UTC'
          };

          return {
            success: true,
            data: mockPreferences
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch preferences'
          };
        }
      },

      update: async (data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> => {
        try {
          const updatedPreferences: UserPreferences = {
            theme: data.theme || 'light',
            notifications: data.notifications || true,
            language: data.language || 'en',
            timezone: data.timezone || 'UTC',
            ...data
          };

          return {
            success: true,
            data: updatedPreferences
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update preferences'
          };
        }
      },

      getUserPreferences: async (category?: string): Promise<ApiResponse<UserPreferences>> => {
        try {
          const mockPreferences: UserPreferences = {
            theme: 'light',
            notifications: true,
            language: 'en',
            timezone: 'UTC'
          };

          return {
            success: true,
            data: mockPreferences
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user preferences'
          };
        }
      },

      updateUserPreferences: async (category: string, data: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> => {
        try {
          const updatedPreferences: UserPreferences = {
            theme: data.theme || 'light',
            notifications: data.notifications || true,
            language: data.language || 'en',
            timezone: data.timezone || 'UTC',
            ...data
          };

          return {
            success: true,
            data: updatedPreferences
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update user preferences'
          };
        }
      }
    };
  }

  // Workflow methods
  get workflows() {
    return this.workflowMethods;
  }

  // Brand methods
  async analyzeBrandVoice(content: string, brandId?: string) {
    return this.brandMethods.analyzeBrandVoice(content, brandId);
  }

  async getBrandDocuments() {
    return this.brandMethods.getBrandDocuments();
  }

  async getBrandTerminology(brandId?: string) {
    return this.brandMethods.getBrandTerminology(brandId);
  }

  async suggestBrandAlternatives(text: string, brandId?: string) {
    return this.brandMethods.suggestBrandAlternatives(text, brandId);
  }

  async enhanceBrandVoice(content: string, targetVoice: string, brandId?: string) {
    return this.brandMethods.enhanceBrandVoice(content, targetVoice, brandId);
  }

  // Chat methods
  async getChatSessions(): Promise<ApiResponse<ChatSession[]>> {
    try {
      const mockSessions: ChatSession[] = [
        {
          id: '1',
          title: 'Marketing Strategy Discussion',
          messages: [],
          createdAt: new Date(),
          updated_at: new Date().toISOString()
        }
      ];

      return {
        success: true,
        data: mockSessions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch chat sessions'
      };
    }
  }

  async createChatSession(title: string): Promise<ApiResponse<ChatSession>> {
    try {
      const newSession: ChatSession = {
        id: 'session-' + Date.now(),
        title: title,
        messages: [],
        createdAt: new Date(),
        updated_at: new Date().toISOString()
      };

      return {
        success: true,
        data: newSession
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create chat session'
      };
    }
  }

  // Social platform connections
  async getSocialPlatformConnections(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    try {
      const mockConnections: SocialPlatformConnection[] = [
        {
          id: '1',
          platform: 'facebook',
          account_name: 'Business Page',
          status: 'connected',
          connection_status: 'connected',
          last_sync: new Date().toISOString(),
          follower_count: 1250
        }
      ];

      return {
        success: true,
        data: mockConnections
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch social platform connections'
      };
    }
  }

  get enhancedCampaigns() {
    return this.campaignMethods.enhancedCampaigns;
  }
}

export const apiClient = new ApiClient();
