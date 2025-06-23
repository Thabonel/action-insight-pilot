
import { BaseApiClient } from './api/base-api-client';
import { ApiResponse } from './api/api-client-interface';

// Unified type definitions to match the codebase
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
}

export interface BlogPost {
  id: string;
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
  content: string;
  metaDescription?: string;
  createdAt: string;
}

export interface BlogPostParams {
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
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

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  source: string;
  score: number;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  steps: WorkflowStep[];
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: any;
  order: number;
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

export interface UserPreference {
  id: string;
  user_id: string;
  preference_type: string;
  preference_data: any;
  created_at: string;
  updated_at: string;
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

class ApiClient extends BaseApiClient {
  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // User Preferences
  userPreferences = {
    getUserPreferences: async (type?: string): Promise<ApiResponse<UserPreference[]>> => {
      return {
        success: true,
        data: []
      };
    },
    updateUserPreferences: async (type: string, data: any): Promise<ApiResponse<UserPreference>> => {
      return {
        success: true,
        data: {
          id: '1',
          user_id: 'user1',
          preference_type: type,
          preference_data: data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  };

  // Social Platform methods
  socialPlatforms = {
    getAll: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return { success: true, data: [] };
    },
    connect: async (platform: string, config?: any): Promise<ApiResponse<SocialPlatformConnection>> => {
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
    },
    disconnect: async (platformId: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    },
    getPlatformConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return { success: true, data: [] };
    },
    initiatePlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { authorization_url: '#' } };
    },
    disconnectPlatform: async (platformId: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    },
    syncPlatformData: async (platformId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: {} };
    },
    testPlatformConnection: async (platformId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { status: 'connected' } };
    }
  };

  // Integration methods
  integrations = {
    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      return { success: true, data: [] };
    },
    createWebhook: async (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      return { 
        success: true, 
        data: { 
          id: '1', 
          name: webhookData.name || 'Webhook',
          url: webhookData.url || '',
          events: webhookData.events || [],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } 
      };
    },
    updateWebhook: async (id: string, webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      return { 
        success: true, 
        data: { 
          id, 
          name: webhookData.name || 'Webhook',
          url: webhookData.url || '',
          events: webhookData.events || [],
          is_active: webhookData.is_active || true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } 
      };
    },
    deleteWebhook: async (id: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    },
    testWebhook: async (id: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { status: 'success' } };
    },
    getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
      return { success: true, data: [] };
    },
    connectService: async (service: string): Promise<ApiResponse<IntegrationConnection>> => {
      return { 
        success: true, 
        data: { 
          id: '1', 
          name: service,
          type: 'oauth',
          status: 'connected',
          service_name: service,
          connection_status: 'connected',
          sync_status: 'idle'
        } 
      };
    },
    disconnectService: async (service: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    },
    syncService: async (serviceId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: {} };
    }
  };

  // Conversational Agent methods
  queryAgent: async (message: string, context?: any) => {
    return { success: true, data: { response: 'Mock response', context: {} } };
  };

  // Blog methods
  generateBlogPost: async (params: BlogPostParams): Promise<ApiResponse<BlogPost>> => {
    return {
      success: true,
      data: {
        id: '1',
        title: params.title,
        keyword: params.keyword,
        wordCount: params.wordCount,
        tone: params.tone,
        includeCTA: params.includeCTA,
        content: 'Generated blog content...',
        metaDescription: 'Generated meta description',
        createdAt: new Date().toISOString()
      }
    };
  };

  getBlogPosts: async (): Promise<ApiResponse<BlogPost[]>> => {
    return { success: true, data: [] };
  };

  // Content methods
  generateContent: async (brief: ContentBrief): Promise<ApiResponse<{ content: string }>> => {
    return { success: true, data: { content: 'Generated content...' } };
  };

  generateSocialContent: async (brief: ContentBrief): Promise<ApiResponse<{ content: string }>> => {
    return { success: true, data: { content: 'Generated social content...' } };
  };

  generateEmailContent: async (brief: string): Promise<ApiResponse<{ content: string }>> => {
    return { success: true, data: { content: 'Generated email content...' } };
  };

  // Social methods
  scheduleSocialPost: async (data: any): Promise<ApiResponse<any>> => {
    return { success: true, data: { id: '1', status: 'scheduled' } };
  };

  // Workflow methods
  workflows = {
    getAll: async (): Promise<ApiResponse<Workflow[]>> => {
      return { success: true, data: [] };
    },
    create: async (name: string, description?: string): Promise<ApiResponse<Workflow>> => {
      return { 
        success: true, 
        data: { 
          id: '1', 
          name, 
          description,
          status: 'active',
          steps: [],
          created_at: new Date().toISOString()
        } 
      };
    },
    update: async (id: string, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
      return { 
        success: true, 
        data: { 
          id, 
          name: data.name || 'Workflow',
          status: data.status || 'active',
          steps: data.steps || [],
          created_at: new Date().toISOString()
        } 
      };
    },
    delete: async (id: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    }
  };

  // Metrics methods
  getAnalytics: async (): Promise<ApiResponse<any>> => {
    const analytics = {
      getAnalyticsOverview: async (): Promise<any> => {
        return { totalCampaigns: 0, activeLeads: 0, conversionRate: 0 };
      }
    };
    return { success: true, data: analytics };
  };

  getEmailAnalytics: async (): Promise<ApiResponse<any>> => {
    return { success: true, data: { sent: 0, opened: 0, clicked: 0 } };
  };

  // Lead methods
  scoreLeads: async (): Promise<any[]> => {
    return [];
  };

  // Campaign methods
  createCampaign: async (campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> => {
    return { 
      success: true, 
      data: { 
        id: '1', 
        name: campaignData.name || 'New Campaign',
        type: campaignData.type || 'email',
        status: 'draft',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } 
    };
  };

  getCampaignById: async (id: string): Promise<ApiResponse<Campaign>> => {
    return { 
      success: true, 
      data: { 
        id, 
        name: 'Campaign',
        type: 'email',
        status: 'active',
        startDate: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } 
    };
  };

  getCampaign: async (id: string): Promise<ApiResponse<Campaign>> => {
    return this.getCampaignById(id);
  };

  // MCP Connection methods
  getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
    return { success: true, data: [] };
  };

  createConnection: async (connectionData: any): Promise<ApiResponse<IntegrationConnection>> => {
    return { 
      success: true, 
      data: { 
        id: '1', 
        name: connectionData.name,
        type: connectionData.type,
        status: 'connected',
        service_name: connectionData.service_name,
        connection_status: 'connected',
        sync_status: 'idle'
      } 
    };
  };

  deleteConnection: async (id: string): Promise<ApiResponse<boolean>> => {
    return { success: true, data: true };
  };
}

export const apiClient = new ApiClient();
