import axios, { AxiosInstance } from 'axios';
import { 
  User, 
  Campaign, 
  Lead, 
  Workflow, 
  Content, 
  BlogPost, 
  UserPreference,
  SocialPlatformConnection,
  IntegrationConnection,
  Webhook,
  ApiResponse,
  EmailMetrics,
  BlogAnalytics,
  BlogPerformanceMetrics,
  TrafficSource,
  KeywordPerformance
} from './api-client-interface';

export class ApiClient {
  private axiosInstance: AxiosInstance;
  public userPreferences: any;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.userPreferences = {
      getUserPreferences: async (category: string): Promise<ApiResponse<UserPreference[]>> => {
        try {
          const response = await this.axiosInstance.get(`/api/user/preferences?category=${category}`);
          return { success: true, data: response.data };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
      updateUserPreferences: async (category: string, preferences: any): Promise<ApiResponse<UserPreference>> => {
        try {
          const response = await this.axiosInstance.post(`/api/user/preferences?category=${category}`, preferences);
          return { success: true, data: response.data };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
      get: async (): Promise<ApiResponse<UserPreference[]>> => {
        try {
          const response = await this.axiosInstance.get('/api/user/preferences');
          return { success: true, data: response.data };
        } catch (error: any) {
          return { success: false, error: error.message };
        }
      },
    };
  }

  async register(userData: any): Promise<ApiResponse<User>> {
    try {
      const response = await this.axiosInstance.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async login(credentials: any): Promise<ApiResponse<User>> {
    try {
      const response = await this.axiosInstance.post('/api/auth/login', credentials);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.post('/api/auth/logout');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.axiosInstance.get('/api/user');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateUser(userData: any): Promise<ApiResponse<User>> {
    try {
      const response = await this.axiosInstance.put('/api/user', userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteUser(): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.delete('/api/user');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAllCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const response = await this.axiosInstance.get('/api/campaigns');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.axiosInstance.get(`/api/campaigns/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.axiosInstance.post('/api/campaigns', campaignData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateCampaign(id: string, campaignData: any): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.axiosInstance.put(`/api/campaigns/${id}`, campaignData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.delete(`/api/campaigns/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAllLeads(): Promise<ApiResponse<Lead[]>> {
    try {
      const response = await this.axiosInstance.get('/api/leads');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

   async getLeads(): Promise<ApiResponse<Lead[]>> {
    try {
      const response = await this.axiosInstance.get('/api/leads');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getLead(id: string): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.axiosInstance.get(`/api/leads/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createLead(leadData: any): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.axiosInstance.post('/api/leads', leadData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateLead(id: string, leadData: any): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.axiosInstance.put(`/api/leads/${id}`, leadData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteLead(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.delete(`/api/leads/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async scoreLeads(): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.post('/api/leads/score');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAllWorkflows(): Promise<ApiResponse<Workflow[]>> {
    try {
      const response = await this.axiosInstance.get('/api/workflows');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getWorkflow(id: string): Promise<ApiResponse<Workflow>> {
    try {
      const response = await this.axiosInstance.get(`/api/workflows/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createWorkflow(name: string, description?: string): Promise<ApiResponse<Workflow>> {
    try {
      const response = await this.axiosInstance.post('/api/workflows', { name, description });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateWorkflow(id: string, workflowData: any): Promise<ApiResponse<Workflow>> {
    try {
      const response = await this.axiosInstance.put(`/api/workflows/${id}`, workflowData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.delete(`/api/workflows/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async executeWorkflow(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.post(`/api/workflows/${id}/execute`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAllContent(): Promise<ApiResponse<Content[]>> {
    try {
      const response = await this.axiosInstance.get('/api/content');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getContent(id: string): Promise<ApiResponse<Content>> {
    try {
      const response = await this.axiosInstance.get(`/api/content/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createContent(contentData: any): Promise<ApiResponse<Content>> {
    try {
      const response = await this.axiosInstance.post('/api/content', contentData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateContent(id: string, contentData: any): Promise<ApiResponse<Content>> {
    try {
      const response = await this.axiosInstance.put(`/api/content/${id}`, contentData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteContent(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.delete(`/api/content/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async generateBlogPost(params: any): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await this.axiosInstance.post('/api/blog/generate', params);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAllBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
     try {
      const response = await this.axiosInstance.get('/api/blog');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getBlogPost(id: string): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await this.axiosInstance.get(`/api/blog/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

   async createBlogPost(blogPostData: any): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await this.axiosInstance.post('/api/blog', blogPostData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateBlogPost(id: string, blogPostData: any): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await this.axiosInstance.put(`/api/blog/${id}`, blogPostData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.delete(`/api/blog/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    try {
      const response = await this.axiosInstance.get('/api/integrations/social-platforms');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async connectSocialPlatform(platform: string): Promise<ApiResponse<SocialPlatformConnection>> {
    try {
      const response = await this.axiosInstance.post(`/api/integrations/social-platforms/connect`, { platform });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async disconnectSocialPlatform(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.post(`/api/integrations/social-platforms/${id}/disconnect`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getIntegrationConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    try {
      const response = await this.axiosInstance.get('/api/integrations/connections');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createIntegrationConnection(connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    try {
      const response = await this.axiosInstance.post('/api/integrations/connections', connectionData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateIntegrationConnection(id: string, connectionData: any): Promise<ApiResponse<IntegrationConnection>> {
    try {
      const response = await this.axiosInstance.put(`/api/integrations/connections/${id}`, connectionData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteIntegrationConnection(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.delete(`/api/integrations/connections/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    try {
      const response = await this.axiosInstance.get('/api/webhooks');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createWebhook(webhookData: any): Promise<ApiResponse<Webhook>> {
    try {
      const response = await this.axiosInstance.post('/api/webhooks', webhookData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateWebhook(id: string, webhookData: any): Promise<ApiResponse<Webhook>> {
    try {
      const response = await this.axiosInstance.put(`/api/webhooks/${id}`, webhookData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    try {
      await this.axiosInstance.delete(`/api/webhooks/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics/email');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async generateEmailContent(params: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post('/api/email/generate', params);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getBlogAnalytics(blogId?: string): Promise<ApiResponse<BlogAnalytics>> {
    try {
      const url = blogId ? `/api/blog/analytics/${blogId}` : '/api/blog/analytics';
      const response = await this.axiosInstance.get(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getBlogPerformanceMetrics(): Promise<ApiResponse<BlogPerformanceMetrics[]>> {
    try {
      const response = await this.axiosInstance.get('/api/blog/performance');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getTrafficSources(blogId?: string): Promise<ApiResponse<TrafficSource[]>> {
    try {
      const url = blogId ? `/api/blog/traffic/${blogId}` : '/api/blog/traffic';
      const response = await this.axiosInstance.get(url);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getKeywordPerformance(): Promise<ApiResponse<KeywordPerformance[]>> {
    try {
      const response = await this.axiosInstance.get('/api/blog/keywords');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  setToken(token: string): void {
    localStorage.setItem('auth-token', token);
  }

  get integrations() {
    return {
      getWebhooks: (): Promise<ApiResponse<Webhook[]>> => Promise.resolve({ success: true, data: [] }),
      createWebhook: (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => 
        Promise.resolve({ success: true, data: { id: '1', url: '', events: [], active: true, created_at: new Date().toISOString(), ...webhookData } as Webhook }),
      updateWebhook: (id: string, webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => 
        Promise.resolve({ success: true, data: { id, url: '', events: [], active: true, created_at: new Date().toISOString(), ...webhookData } as Webhook }),
      deleteWebhook: (id: string): Promise<ApiResponse<void>> => Promise.resolve({ success: true }),
      getConnections: (): Promise<ApiResponse<IntegrationConnection[]>> => Promise.resolve({ success: true, data: [] }),
      createConnection: (connectionData: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> => 
        Promise.resolve({ success: true, data: { id: '1', name: '', type: '', status: 'pending', config: {}, ...connectionData } as IntegrationConnection }),
      updateConnection: (id: string, connectionData: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> => 
        Promise.resolve({ success: true, data: { id, name: '', type: '', status: 'pending', config: {}, ...connectionData } as IntegrationConnection }),
      deleteConnection: (id: string): Promise<ApiResponse<void>> => Promise.resolve({ success: true }),
      syncService: (serviceId: string): Promise<ApiResponse<void>> => Promise.resolve({ success: true })
    };
  }
}

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const apiClient = new ApiClient(baseURL);
