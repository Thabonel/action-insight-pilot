
import { HttpClient } from './http-client';
import { AnalyticsService } from './api/analytics-service';
import { 
  ApiResponse as BaseApiResponse, 
  UserPreferences as BaseUserPreferences, 
  Webhook as BaseWebhook, 
  SocialPlatformConnection as BaseSocialPlatformConnection, 
  EmailMetrics as BaseEmailMetrics, 
  Campaign as BaseCampaign, 
  SocialPost as BaseSocialPost, 
  IntegrationConnection as BaseIntegrationConnection, 
  OAuthResponse as BaseOAuthResponse 
} from './api-client-interface';

// Local type definitions to avoid conflicts
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  keyword: string;
  wordCount: number;
  tone: string;
  includeCTA: boolean;
  createdAt: string;
  author: string;
  seoScore: number;
  readabilityScore: number;
}

export interface ContentBrief {
  title: string;
  content_type: string;
  target_audience: string;
  key_messages: string[];
  platform: string;
  type: string;
  topic: string;
  audience: string;
  tone?: string;
  length?: string;
  keywords?: string[];
  cta?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  score: number;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  description?: string;
  budget?: number;
  target_audience?: string;
  timeline?: string;
  startDate?: string;
  endDate?: string;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
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

export interface SocialPost {
  id: string;
  content: string;
  platform: string;
  scheduledTime: string;
  scheduled_time?: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  campaignId?: string;
  created_at: string;
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

export interface EmailMetrics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  total_sent?: number;
  total_opened?: number;
  total_clicked?: number;
  totalOpened?: number;
  totalClicks?: number;
  insights?: Array<{
    type: string;
    message: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  trends?: {
    sent?: number[];
    opened?: number[];
    clicked?: number[];
  };
  last_updated?: string;
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

export interface OAuthResponse {
  authorization_url: string;
  auth_url: string;
  state: string;
}

export class ApiClient {
  private httpClient: HttpClient;
  public analytics: AnalyticsService;
  private authToken: string | null = null;

  public integrations = {
    getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
      return { success: true, data: [] };
    },
    createConnection: async (connectionData: any): Promise<ApiResponse<IntegrationConnection>> => {
      return { success: true, data: { id: '1', name: 'Test', type: 'test', status: 'connected', service_name: 'test', connection_status: 'connected', sync_status: 'idle' } };
    },
    deleteConnection: async (id: string): Promise<ApiResponse<void>> => {
      return { success: true };
    },
    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      return { success: true, data: [] };
    },
    createWebhook: async (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      return { 
        success: true, 
        data: { 
          id: '1', 
          name: webhookData.name || 'Test Webhook', 
          url: webhookData.url || '', 
          events: webhookData.events || [], 
          is_active: true, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        } 
      };
    },
    deleteWebhook: async (webhookId: string): Promise<ApiResponse<void>> => {
      return { success: true };
    },
    testWebhook: async (webhookId: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { status: 'success' } };
    },
    connectService: async (service: string, apiKey: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { service, connected: true } };
    },
    syncService: async (service: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { service, synced: true } };
    },
    disconnectService: async (service: string): Promise<ApiResponse<any>> => {
      return { success: true, data: { service, disconnected: true } };
    }
  };

  public userPreferences = {
    getUserPreferences: async (category: string): Promise<ApiResponse<any[]>> => {
      return { success: true, data: [] };
    },
    updateUserPreferences: async (category: string, preferences: any): Promise<ApiResponse<any>> => {
      return { success: true, data: preferences };
    }
  };

  public socialPlatforms = {
    getConnections: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      return { 
        success: true, 
        data: [{
          id: '1',
          platform: 'twitter',
          platform_name: 'Twitter',
          status: 'connected',
          connection_status: 'connected'
        }] 
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
          connection_status: 'connected'
        } 
      };
    }
  };

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.analytics = new AnalyticsService(httpClient);
  }

  setToken(token: string): void {
    this.authToken = token;
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return { success: true, data: [] };
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
      } 
    };
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    const campaign: Campaign = {
      id: Date.now().toString(),
      name: campaignData.name || '',
      type: campaignData.type || '',
      status: campaignData.status || 'draft',
      description: campaignData.description,
      budget: campaignData.budget,
      target_audience: campaignData.target_audience,
      timeline: campaignData.timeline,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { success: true, data: campaign };
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    return { 
      success: true, 
      data: { 
        id, 
        name: 'Updated Campaign', 
        type: 'email', 
        status: 'active', 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString(),
        ...updates 
      } 
    };
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse<Lead[]>> {
    return { success: true, data: [] };
  }

  async scoreLeads(leadIds: string[]): Promise<ApiResponse<any>> {
    return { success: true, data: { scored: leadIds.length } };
  }

  async exportLeads(format: 'csv' | 'json' = 'csv'): Promise<ApiResponse<string>> {
    return { success: true, data: format === 'csv' ? 'id,name,email\n1,John,john@example.com' : '[]' };
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return { 
      success: true, 
      data: { 
        synced_count: 10, 
        new_leads: 5, 
        updated_leads: 5, 
        sync_time: new Date().toISOString(),
        sources: ['website'] 
      } 
    };
  }

  // Content methods
  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return { 
      success: true, 
      data: { 
        id: '1', 
        title: brief.title, 
        content: 'Generated content', 
        html_content: '<p>Generated content</p>', 
        cta: brief.cta || '', 
        seo_score: 85, 
        readability_score: 90, 
        engagement_prediction: 75, 
        tags: [], 
        status: 'generated' 
      } 
    };
  }

  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    return { success: true, data: [] };
  }

  async generateBlogPost(title: string, keywords: string[], tone: string): Promise<ApiResponse<BlogPost>> {
    return { 
      success: true, 
      data: { 
        id: '1', 
        title, 
        content: 'Generated blog content', 
        excerpt: 'Generated excerpt', 
        status: 'draft', 
        keyword: keywords[0] || '', 
        wordCount: 500, 
        tone, 
        includeCTA: true, 
        createdAt: new Date().toISOString(), 
        author: 'AI', 
        seoScore: 85, 
        readabilityScore: 90 
      } 
    };
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  async createContent(contentData: any): Promise<ApiResponse<any>> {
    return { success: true, data: { id: '1', ...contentData } };
  }

  // Email methods
  async generateEmailContent(campaignData: any): Promise<ApiResponse<any>> {
    return { 
      success: true, 
      data: { 
        subject: 'Generated Subject', 
        content: 'Generated email content', 
        preview: 'Email preview' 
      } 
    };
  }

  async getRealTimeMetrics(): Promise<ApiResponse<EmailMetrics>> {
    return { 
      success: true, 
      data: { 
        totalSent: 100, 
        delivered: 95, 
        opened: 45, 
        clicked: 12, 
        bounced: 5, 
        unsubscribed: 2, 
        openRate: 45, 
        clickRate: 12, 
        bounceRate: 5 
      } 
    };
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return { success: true, data: { totalSent: 100 } };
  }

  // Social methods
  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    return { success: true, data: [] };
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<SocialPost>> {
    return { 
      success: true, 
      data: { 
        id: '1', 
        content: postData.content, 
        platform: postData.platform, 
        scheduledTime: postData.scheduledTime, 
        status: 'scheduled', 
        created_at: new Date().toISOString() 
      } 
    };
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return this.socialPlatforms.getConnections();
  }

  async connectSocialPlatform(platform: string, config: any): Promise<ApiResponse<SocialPlatformConnection>> {
    return this.socialPlatforms.connect(platform, config);
  }

  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrations.getConnections();
  }

  async createConnection(connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    return this.integrations.createConnection(connectionData);
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    return this.integrations.deleteConnection(id);
  }

  // Analytics methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.analytics.getAnalytics();
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    return { success: true, data: [] };
  }

  async createWorkflow(workflowData: any): Promise<ApiResponse<Workflow>> {
    return { 
      success: true, 
      data: { 
        id: '1', 
        name: workflowData.name, 
        description: workflowData.description || '', 
        status: 'active', 
        steps: [], 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      } 
    };
  }

  async executeWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    return { success: true, data: { executed: true } };
  }

  async getWorkflowStatus(workflowId: string): Promise<ApiResponse<any>> {
    return { 
      success: true, 
      data: { 
        workflow_id: workflowId, 
        status: 'running', 
        current_step: 1, 
        total_steps: 5, 
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
        name: 'Updated Workflow', 
        description: '', 
        status: 'active', 
        steps: [], 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      } 
    };
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<void>> {
    return { success: true };
  }

  // Agent methods
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return { 
      success: true, 
      data: { 
        response: 'AI response to: ' + query, 
        message: 'AI response to: ' + query 
      } 
    };
  }

  async callDailyFocusAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return { 
      success: true, 
      data: { 
        focus_summary: 'Focus on improving email open rates', 
        explanation: 'Based on current campaigns, focus on email optimization' 
      } 
    };
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return { 
      success: true, 
      data: { 
        explanation: 'Campaign analysis based on your query', 
        focus_summary: 'General campaign insights' 
      } 
    };
  }

  // System methods
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return { success: true, data: { status: 'healthy' } };
  }

  // OAuth methods
  async initializeOAuth(platform: string): Promise<ApiResponse<OAuthResponse>> {
    return { 
      success: true, 
      data: { 
        authorization_url: `https://auth.${platform}.com/oauth`, 
        auth_url: `https://auth.${platform}.com/oauth`, 
        state: 'random-state' 
      } 
    };
  }
}

export const apiClient = new ApiClient(new HttpClient());
