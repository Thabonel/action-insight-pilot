import { BrandMethods } from './api/brand-methods';
import { CampaignMethods } from './api/campaign-methods';
import { IntegrationMethods } from './api/integration-methods';
import { SocialMethods } from './api/social-methods';
import { UserPreferencesMethods } from './api/user-preferences-methods';
import { WorkflowMethods } from './api/workflow-methods';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  account_name: string;
  status: 'connected' | 'disconnected' | 'error';
  connection_status: 'connected' | 'disconnected' | 'error';
  last_sync: string;
  follower_count: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  type: string;
  config: any;
  order: number;
  title?: string;
  description?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  icon?: string;
  color?: string;
}

export interface ContentBrief {
  topic: string;
  audience: string;
  tone: string;
  platform: string;
  length: string;
  keywords?: string[];
  title?: string;
  target_audience?: string;
  content_type?: string;
  key_messages?: string[];
}

export interface BlogPostParams {
  topic: string;
  targetAudience: string;
  tone: string;
  keywords: string[];
  wordCount: number;
}

export interface EmailInsight {
  type: string;
  impact: 'positive' | 'negative' | 'neutral';
  message: string;
}

export interface EmailTrends {
  sent?: number[];
  opened?: number[];
  clicked?: number[];
  positive: number;
  negative: number;
  neutral: number;
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
  insights?: EmailInsight[];
  trends?: EmailTrends;
  last_updated?: string;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  config: any;
  created_at: string;
  updated_at: string;
  service_name?: string;
  connection_status?: 'connected' | 'disconnected' | 'error';
  last_sync_at?: string;
  description?: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
  last_response_code?: number;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  metrics?: any;
}

export interface WorkflowMethods {
  getAll: () => Promise<ApiResponse<Workflow[]>>;
  create: (workflow: Partial<Workflow>) => Promise<ApiResponse<Workflow>>;
  update: (id: string, workflow: Partial<Workflow>) => Promise<ApiResponse<Workflow>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  execute: (id: string, input?: any) => Promise<ApiResponse<any>>;
}

export interface UserPreferences {
  theme?: string;
  notifications?: boolean;
  language?: string;
  timezone?: string;
  [key: string]: any;
}

export interface UserPreferencesMethods {
  get: () => Promise<ApiResponse<UserPreferences>>;
  update: (data: Partial<UserPreferences>) => Promise<ApiResponse<UserPreferences>>;
  getUserPreferences: (category?: string) => Promise<ApiResponse<UserPreferences>>;
  updateUserPreferences: (category: string, data: Partial<UserPreferences>) => Promise<ApiResponse<UserPreferences>>;
}

export interface IntegrationMethods {
  getWebhooks: () => Promise<ApiResponse<Webhook[]>>;
  createWebhook: (data: Partial<Webhook>) => Promise<ApiResponse<Webhook>>;
  deleteWebhook: (id: string) => Promise<ApiResponse<void>>;
  testWebhook: (id: string) => Promise<ApiResponse<any>>;
  getConnections: () => Promise<ApiResponse<IntegrationConnection[]>>;
  connectService: (service: string, apiKey: string) => Promise<ApiResponse<any>>;
  syncService: (service: string) => Promise<ApiResponse<any>>;
  disconnectService: (service: string) => Promise<ApiResponse<any>>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
  query?: string;
  response?: string;
}

export class ApiClient {
  private brand: BrandMethods;
  private campaigns: CampaignMethods;
  private integrations: IntegrationMethods;
  private socialPlatforms: SocialMethods;
  private userPreferences: UserPreferencesMethods;
  private workflows: WorkflowMethods;

  constructor() {
    this.brand = new BrandMethods();
    this.campaigns = new CampaignMethods();
    this.integrations = new IntegrationMethods();
    this.socialPlatforms = new SocialMethods();
    this.userPreferences = new UserPreferencesMethods();
    this.workflows = new WorkflowMethods();
  }

  get brandVoice() {
    return this.brand;
  }

  get campaignManagement() {
    return this.campaigns.enhancedCampaigns;
  }

  get integrations() {
    return this.integrations;
  }

  get socialPlatforms() {
    return this.socialPlatforms;
  }

  userPreferences = () => {
    return this.userPreferences;
  };

  get workflows() {
    return this.workflows;
  }

  setToken(token: string) {
    this.brand.setToken(token);
    this.campaigns.setToken(token);
    this.integrations.setToken(token);
    this.socialPlatforms.setToken(token);
    this.userPreferences.setToken(token);
    this.workflows.setToken(token);
  }

  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    // Mock implementation
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

  async getSocialMediaPosts(): Promise<ApiResponse<any>> {
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

  async getPlatformConnections(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return {
      success: true,
      data: [
        {
          id: 'twitter-1',
          platform: 'Twitter',
          account_name: '@company',
          status: 'connected',
          connection_status: 'connected',
          last_sync: new Date().toISOString(),
          follower_count: 1250
        },
        {
          id: 'linkedin-1',
          platform: 'LinkedIn',
          account_name: 'Company Page',
          status: 'disconnected',
          connection_status: 'disconnected',
          last_sync: new Date().toISOString(),
          follower_count: 850
        }
      ]
    };
  }

  async initiatePlatformConnection(platform: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        platform,
        status: 'pending'
      }
    };
  }

  async disconnectPlatform(platform: string): Promise<ApiResponse<void>> {
    return {
      success: true,
      data: undefined
    };
  }

  async syncPlatformData(platform: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        platform,
        last_sync: new Date().toISOString()
      }
    };
  }

  async testPlatformConnection(platform: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        platform,
        status: 'connected'
      }
    };
  }

  // Missing content methods
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

  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: 'scheduled-post-' + Date.now(),
        ...postData,
        status: 'scheduled',
        scheduled_at: postData.scheduled_for
      }
    };
  }

  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrations.getConnections();
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

  async getAnalytics(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
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

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    return {
      success: true,
      data: [
        {
          id: 'twitter-1',
          platform: 'Twitter',
          account_name: '@company',
          status: 'connected',
          connection_status: 'connected',
          last_sync: new Date().toISOString(),
          follower_count: 1250
        },
        {
          id: 'linkedin-1',
          platform: 'LinkedIn',
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
}

export const apiClient = new ApiClient();
