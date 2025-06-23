
import { HttpClient } from './http-client';
import { 
  ApiResponse, User, Campaign, Lead, Workflow, Content, BlogPost, BlogPostParams,
  ContentBrief, AnalyticsOverview, EmailMetrics, BlogAnalytics, BlogPerformanceMetrics,
  TrafficSource, KeywordPerformance, SocialPlatformConnection, IntegrationConnection,
  Webhook, UserPreference, ContentIdea, WritingStats, PublishingPlatform,
  WorkflowAutomation, AutomationAction
} from './api-client-interface';

export { ContentBrief, Workflow } from './api-client-interface';

class HttpClientImpl {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.authToken = token;
  }

  async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    return response.json();
  }
}

export class ApiClient {
  private httpClient: HttpClientImpl;

  constructor() {
    this.httpClient = new HttpClientImpl('https://wheels-wins-orchestrator.onrender.com');
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const data = await this.httpClient.request('/api/user/me');
      return { success: true, data: data || {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }};
    } catch (error) {
      return { success: false, error: 'Failed to get current user' };
    }
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const data = await this.httpClient.request('/api/user/me', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return { success: true, data: data || {
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }};
    } catch (error) {
      return { success: false, error: 'Failed to update user' };
    }
  }

  // Analytics methods
  async getBlogAnalytics(blogId?: string): Promise<ApiResponse<BlogAnalytics>> {
    try {
      const endpoint = blogId ? `/api/analytics/blog/${blogId}` : '/api/analytics/blog';
      const data = await this.httpClient.request(endpoint);
      return { success: true, data: data || {
        views: 1250,
        uniqueViews: 980,
        engagement: 65,
        shares: 45,
        timeOnPage: 180,
        bounceRate: 35,
        conversionRate: 2.5,
        leads: 12,
        revenue: 450
      }};
    } catch (error) {
      return { success: false, error: 'Failed to get blog analytics' };
    }
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    try {
      const data = await this.httpClient.request('/api/analytics/email');
      return { success: true, data: data || {
        totalSent: 1500,
        delivered: 1425,
        opened: 712,
        clicked: 142,
        bounced: 75,
        unsubscribed: 8,
        openRate: 50.0,
        clickRate: 20.0,
        bounceRate: 5.0
      }};
    } catch (error) {
      return { success: false, error: 'Failed to get email analytics' };
    }
  }

  async getAnalyticsOverview(): Promise<ApiResponse<AnalyticsOverview>> {
    try {
      const data = await this.httpClient.request('/api/analytics/overview');
      return { success: true, data: data || {
        totalCampaigns: 25,
        activeCampaigns: 8,
        totalLeads: 342,
        conversionRate: 12.5,
        totalRevenue: 15750,
        monthlyGrowth: 8.3
      }};
    } catch (error) {
      return { success: false, error: 'Failed to get analytics overview' };
    }
  }

  async getBlogPerformanceMetrics(): Promise<ApiResponse<BlogPerformanceMetrics[]>> {
    try {
      const data = await this.httpClient.request('/api/analytics/blog/performance');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get blog performance metrics' };
    }
  }

  async getTrafficSources(): Promise<ApiResponse<TrafficSource[]>> {
    try {
      const data = await this.httpClient.request('/api/analytics/traffic-sources');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get traffic sources' };
    }
  }

  async getKeywordPerformance(): Promise<ApiResponse<KeywordPerformance[]>> {
    try {
      const data = await this.httpClient.request('/api/analytics/keywords');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get keyword performance' };
    }
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse<Lead[]>> {
    try {
      const data = await this.httpClient.request('/api/leads');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get leads' };
    }
  }

  async createLead(leadData: Partial<Lead>): Promise<ApiResponse<Lead>> {
    try {
      const data = await this.httpClient.request('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      });
      return { success: true, data: data || {
        id: 'demo-lead',
        email: 'demo@example.com',
        score: 75,
        status: 'new',
        source: 'website',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user'
      }};
    } catch (error) {
      return { success: false, error: 'Failed to create lead' };
    }
  }

  async updateLead(id: string, leadData: Partial<Lead>): Promise<ApiResponse<Lead>> {
    try {
      const data = await this.httpClient.request(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(leadData),
      });
      return { success: true, data: data || {
        id,
        email: 'demo@example.com',
        score: 75,
        status: 'new',
        source: 'website',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user'
      }};
    } catch (error) {
      return { success: false, error: 'Failed to update lead' };
    }
  }

  async scoreLeads(): Promise<boolean> {
    try {
      await this.httpClient.request('/api/leads/score', { method: 'POST' });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Campaign methods
  async createCampaign(campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      const data = await this.httpClient.request('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaignData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create campaign' };
    }
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    try {
      const data = await this.httpClient.request('/api/workflows');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get workflows' };
    }
  }

  async createWorkflow(workflowData: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    try {
      const data = await this.httpClient.request('/api/workflows', {
        method: 'POST',
        body: JSON.stringify(workflowData),
      });
      return { success: true, data: data || {
        id: 'demo-workflow',
        name: 'Demo Workflow',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user',
        steps: []
      }};
    } catch (error) {
      return { success: false, error: 'Failed to create workflow' };
    }
  }

  async updateWorkflow(id: string, workflowData: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    try {
      const data = await this.httpClient.request(`/api/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(workflowData),
      });
      return { success: true, data: data || {
        id,
        name: 'Demo Workflow',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user',
        steps: []
      }};
    } catch (error) {
      return { success: false, error: 'Failed to update workflow' };
    }
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/workflows/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete workflow' };
    }
  }

  // Content methods
  async getContentLibrary(): Promise<ApiResponse<Content[]>> {
    try {
      const data = await this.httpClient.request('/api/content');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get content library' };
    }
  }

  async createContent(contentData: Partial<Content>): Promise<ApiResponse<Content>> {
    try {
      const data = await this.httpClient.request('/api/content', {
        method: 'POST',
        body: JSON.stringify(contentData),
      });
      return { success: true, data: data || {
        id: 'demo-content',
        title: 'Demo Content',
        content: 'Demo content',
        type: 'blog',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user'
      }};
    } catch (error) {
      return { success: false, error: 'Failed to create content' };
    }
  }

  async updateContent(id: string, contentData: Partial<Content>): Promise<ApiResponse<Content>> {
    try {
      const data = await this.httpClient.request(`/api/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contentData),
      });
      return { success: true, data: data || {
        id,
        title: 'Demo Content',
        content: 'Demo content',
        type: 'blog',
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'demo-user'
      }};
    } catch (error) {
      return { success: false, error: 'Failed to update content' };
    }
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<Content>> {
    try {
      const data = await this.httpClient.request('/api/content/generate', {
        method: 'POST',
        body: JSON.stringify(brief),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to generate content' };
    }
  }

  async generateEmailContent(brief: ContentBrief): Promise<ApiResponse<Content>> {
    return this.generateContent(brief);
  }

  // Blog methods
  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    try {
      const data = await this.httpClient.request('/api/blog/posts');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get blog posts' };
    }
  }

  async createBlogPost(params: BlogPostParams): Promise<ApiResponse<BlogPost>> {
    try {
      const data = await this.httpClient.request('/api/blog/posts', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create blog post' };
    }
  }

  async updateBlogPost(id: string, postData: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    try {
      const data = await this.httpClient.request(`/api/blog/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update blog post' };
    }
  }

  // Repurposing methods
  async repurposeContent(contentId: string, targetFormat: string, options: any = {}): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request('/api/content/repurpose', {
        method: 'POST',
        body: JSON.stringify({ contentId, targetFormat, options }),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to repurpose content' };
    }
  }

  async getContentVariants(contentId: string): Promise<ApiResponse<any[]>> {
    try {
      const data = await this.httpClient.request(`/api/content/${contentId}/variants`);
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get content variants' };
    }
  }

  async saveContentVariant(contentId: string, variant: any): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.request(`/api/content/${contentId}/variants`, {
        method: 'POST',
        body: JSON.stringify(variant),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to save content variant' };
    }
  }

  // Social platform methods
  social = {
    getAll: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      try {
        const data = await this.httpClient.request('/api/social/connections');
        return { success: true, data: data || [] };
      } catch (error) {
        return { success: false, error: 'Failed to get social connections' };
      }
    },
    connect: async (platform: string): Promise<ApiResponse<SocialPlatformConnection>> => {
      try {
        const data = await this.httpClient.request('/api/social/connect', {
          method: 'POST',
          body: JSON.stringify({ platform }),
        });
        return { success: true, data };
      } catch (error) {
        return { success: false, error: 'Failed to connect platform' };
      }
    },
    disconnect: async (id: string): Promise<ApiResponse<void>> => {
      try {
        await this.httpClient.request(`/api/social/connections/${id}`, { method: 'DELETE' });
        return { success: true };
      } catch (error) {
        return { success: false, error: 'Failed to disconnect platform' };
      }
    }
  };

  // User preferences
  userPreferences = {
    getUserPreferences: async (category: string): Promise<ApiResponse<UserPreference[]>> => {
      try {
        const data = await this.httpClient.request(`/api/user/preferences/${category}`);
        return { success: true, data: data || [] };
      } catch (error) {
        return { success: false, error: 'Failed to get user preferences' };
      }
    },
    updateUserPreferences: async (category: string, preferences: any): Promise<ApiResponse<any>> => {
      try {
        const data = await this.httpClient.request(`/api/user/preferences/${category}`, {
          method: 'PUT',
          body: JSON.stringify(preferences),
        });
        return { success: true, data };
      } catch (error) {
        return { success: false, error: 'Failed to update user preferences' };
      }
    },
    get: async (): Promise<ApiResponse<UserPreference[]>> => {
      try {
        const data = await this.httpClient.request('/api/user/preferences');
        return { success: true, data: data || [] };
      } catch (error) {
        return { success: false, error: 'Failed to get preferences' };
      }
    }
  };

  // Integration connections
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    try {
      const data = await this.httpClient.request('/api/integrations/connections');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get connections' };
    }
  }

  async createConnection(connectionData: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> {
    try {
      const data = await this.httpClient.request('/api/integrations/connections', {
        method: 'POST',
        body: JSON.stringify(connectionData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create connection' };
    }
  }

  async deleteConnection(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/integrations/connections/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete connection' };
    }
  }

  // Automation methods
  async getAutomations(): Promise<ApiResponse<WorkflowAutomation[]>> {
    try {
      const data = await this.httpClient.request('/api/automations');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get automations' };
    }
  }

  async createAutomation(automation: Partial<WorkflowAutomation>): Promise<ApiResponse<WorkflowAutomation>> {
    try {
      const data = await this.httpClient.request('/api/automations', {
        method: 'POST',
        body: JSON.stringify(automation),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create automation' };
    }
  }

  async updateAutomation(id: string, automation: Partial<WorkflowAutomation>): Promise<ApiResponse<WorkflowAutomation>> {
    try {
      const data = await this.httpClient.request(`/api/automations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(automation),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update automation' };
    }
  }

  async deleteAutomation(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/automations/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete automation' };
    }
  }

  // Content ideas and writing stats
  async getContentIdeas(): Promise<ApiResponse<ContentIdea[]>> {
    try {
      const data = await this.httpClient.request('/api/content/ideas');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get content ideas' };
    }
  }

  async getWritingStats(): Promise<ApiResponse<WritingStats>> {
    try {
      const data = await this.httpClient.request('/api/writing/stats');
      return { success: true, data: data || {
        daily_word_count: 0,
        weekly_streak: 0,
        total_posts: 0,
        goals: { daily_words: 500, weekly_posts: 3 }
      }};
    } catch (error) {
      return { success: false, error: 'Failed to get writing stats' };
    }
  }

  async getPublishingPlatforms(): Promise<ApiResponse<PublishingPlatform[]>> {
    try {
      const data = await this.httpClient.request('/api/publishing/platforms');
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to get publishing platforms' };
    }
  }
}

export const apiClient = new ApiClient();
