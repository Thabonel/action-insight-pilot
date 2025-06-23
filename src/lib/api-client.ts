import { HttpClient } from './http-client';
import { UserPreferencesService } from './user-preferences-service';
import { SocialPlatformsService } from './social-platforms-service';
import { ConversationalAgentService } from './conversational-agent-service';
import { WorkflowService } from './workflow-service';
import { ContentService, ContentBrief } from './content-service';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  type: string;
  status: string;
  service_name: string;
  connection_status: string;
  sync_status: string;
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  platform_name: string;
  status: string;
  connection_status: string;
}

export interface BlogPostParams {
  title: string;
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
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

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  score: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  startDate: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class BaseApiClient {
  protected httpClient: HttpClient;
  private token: string | null = null;

  constructor() {
    this.httpClient = new HttpClient();
  }

  setToken(token: string) {
    this.token = token;
    this.httpClient.setToken(token);
  }
}

class ApiClient extends BaseApiClient {
  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  userPreferences = {
    get: async (): Promise<ApiResponse<any>> => {
      return { success: true, data: {} };
    },
    update: async (data: any): Promise<ApiResponse<any>> => {
      return { success: true, data: {} };
    }
  };

  socialPlatforms = {
    get: async (): Promise<ApiResponse<any>> => {
      return { success: true, data: {} };
    },
    update: async (data: any): Promise<ApiResponse<any>> => {
      return { success: true, data: {} };
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
    },
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
    },
    deleteConnection: async (id: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    }
  };

  conversationalAgent = {
    getAgent: async (): Promise<ApiResponse<any>> => {
      return { success: true, data: {} };
    },
    updateAgent: async (data: any): Promise<ApiResponse<any>> => {
      return { success: true, data: {} };
    }
  };

  // Blog methods
  generateBlogPost = async (params: BlogPostParams): Promise<ApiResponse<BlogPost>> => {
    return {
      success: true,
      data: {
        id: Date.now().toString(),
        title: params.title,
        keyword: params.keyword,
        wordCount: params.wordCount,
        tone: params.tone,
        includeCTA: params.includeCTA,
        content: `This is a generated blog post about "${params.title}". The content would be optimized for the keyword "${params.keyword}" and written in a ${params.tone} tone with approximately ${params.wordCount} words.${params.includeCTA ? '\n\nCall to Action: Contact us today to learn more!' : ''}`,
        metaDescription: `Learn about ${params.title} in this comprehensive guide optimized for ${params.keyword}.`,
        createdAt: new Date().toISOString()
      }
    };
  };

  getBlogPosts = async (): Promise<ApiResponse<BlogPost[]>> => {
    return { success: true, data: [] };
  };

  // Content methods
  generateContent = async (brief: ContentBrief): Promise<ApiResponse<{ content: string }>> => {
    return { success: true, data: { content: 'Generated content...' } };
  };

  generateSocialContent = async (brief: ContentBrief): Promise<ApiResponse<{ content: string }>> => {
    return { success: true, data: { content: 'Generated social content...' } };
  };

  generateEmailContent = async (brief: string): Promise<ApiResponse<{ content: string }>> => {
    return { success: true, data: { content: 'Generated email content...' } };
  };

  createContent = async (contentData: any): Promise<ApiResponse<any>> => {
    return { success: true, data: { id: '1', ...contentData } };
  };

  // Social methods
  scheduleSocialPost = async (data: any): Promise<ApiResponse<any>> => {
    return { success: true, data: { id: '1', status: 'scheduled' } };
  };

  getSocialPlatforms = async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
    return { success: true, data: [] };
  };

  connectSocialPlatform = async (platform: string): Promise<ApiResponse<SocialPlatformConnection>> => {
    return { 
      success: true, 
      data: { 
        id: '1', 
        platform, 
        platform_name: platform,
        status: 'connected',
        connection_status: 'connected'
      } 
    };
  };

  getSocialPosts = async (): Promise<ApiResponse<any[]>> => {
    return { success: true, data: [] };
  };

  workflows = {
    getAll: async (): Promise<ApiResponse<Workflow[]>> => {
      return { success: true, data: [] };
    },
    getById: async (id: string): Promise<ApiResponse<Workflow>> => {
      return { success: true, data: { id, name: 'Workflow', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } };
    },
    create: async (name: string, description?: string): Promise<ApiResponse<Workflow>> => {
      return { success: true, data: { id: '1', name, description, is_active: true, created_at: new Date().toISOString(), updatedAt: new Date().toISOString() } };
    },
    update: async (id: string, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
      return { success: true, data: { id, name: data.name || 'Workflow', description: data.description, is_active: data.is_active !== undefined ? data.is_active : true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } };
    },
    delete: async (id: string): Promise<ApiResponse<boolean>> => {
      return { success: true, data: true };
    }
  };

  // Metrics methods
  getAnalytics = async (): Promise<ApiResponse<any>> => {
    const analytics = {
      getAnalyticsOverview: async (): Promise<any> => {
        return { totalCampaigns: 0, activeLeads: 0, conversionRate: 0 };
      }
    };
    return { success: true, data: analytics };
  };

  getEmailAnalytics = async (): Promise<ApiResponse<any>> => {
    return { success: true, data: { sent: 0, opened: 0, clicked: 0 } };
  };

  getRealTimeMetrics = async (): Promise<ApiResponse<any>> => {
    return { success: true, data: {} };
  };

  // Lead methods
  scoreLeads = async (): Promise<boolean> => {
    return true;
  };

  getLeads = async (): Promise<ApiResponse<Lead[]>> => {
    return { success: true, data: [] };
  };

  getCampaigns = async (): Promise<ApiResponse<Campaign[]>> => {
    return { success: true, data: [] };
  };

  // Campaign methods
  createCampaign = async (campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> => {
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

  updateCampaign = async (id: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> => {
    return { 
      success: true, 
      data: { 
        id, 
        name: campaignData.name || 'Updated Campaign',
        type: campaignData.type || 'email',
        status: campaignData.status || 'active',
        startDate: campaignData.startDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } 
    };
  };

  getCampaignById = async (id: string): Promise<ApiResponse<Campaign>> => {
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

  getCampaign = async (id: string): Promise<ApiResponse<Campaign>> => {
    return this.getCampaignById(id);
  };

  // MCP Connection methods
  getConnections = async (): Promise<ApiResponse<IntegrationConnection[]>> => {
    return { success: true, data: [] };
  };

  createConnection = async (connectionData: any): Promise<ApiResponse<IntegrationConnection>> => {
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

  deleteConnection = async (id: string): Promise<ApiResponse<boolean>> => {
    return { success: true, data: true };
  };
}

export const apiClient = new ApiClient();
