
import axios from 'axios';
import { createSocialMethods } from './api/social-methods';
import { IntegrationMethods } from './api/integration-methods';
import { 
  ApiResponse, 
  ContentBrief, 
  UserPreferencesMethods, 
  WorkflowMethods, 
  EmailMetrics,
  Campaign,
  IntegrationConnection,
  Webhook,
  Workflow
} from './api-client-interface';

class ApiClient {
  private client: any;
  private socialMethods: any;
  private integrationMethods: IntegrationMethods;
  private authToken: string | null = null;

  constructor() {
    const config = {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    this.client = axios.create(config);
    this.socialMethods = createSocialMethods();
    this.integrationMethods = new IntegrationMethods();
  }

  setToken(token: string) {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async get(url: string, params?: any): Promise<any> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error: any) {
      console.error('GET request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async post(url: string, data?: any): Promise<any> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error: any) {
      console.error('POST request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async put(url: string, data?: any): Promise<any> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      console.error('PUT request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async delete(url: string): Promise<any> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      console.error('DELETE request failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Agent methods
  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/agent/query', { query, context });
      return response;
    } catch (error: any) {
      console.error('Agent query failed:', error);
      return { success: false, error: error.message };
    }
  }

  async callGeneralCampaignAgent(query: string, campaignData?: any[], context?: any[], authToken?: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/agent/campaign', { query, campaignData, context });
      return response;
    } catch (error: any) {
      console.error('Campaign agent query failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const response = await this.get('/campaigns');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch campaigns:', error);
      return { success: false, error: error.message };
    }
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.get(`/campaigns/${id}`);
      return response;
    } catch (error: any) {
      console.error('Failed to fetch campaign:', error);
      return { success: false, error: error.message };
    }
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.put(`/campaigns/${id}`, data);
      return response;
    } catch (error: any) {
      console.error('Failed to update campaign:', error);
      return { success: false, error: error.message };
    }
  }

  async createCampaign(data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.post('/campaigns', data);
      return response;
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      return { success: false, error: error.message };
    }
  }

  // Content methods
  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/content/generate', brief);
      return response;
    } catch (error: any) {
      console.error('Failed to generate content:', error);
      return { success: false, error: error.message };
    }
  }

  async createContent(contentData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/content/create', contentData);
      return response;
    } catch (error: any) {
      console.error('Failed to create content:', error);
      return { success: false, error: error.message };
    }
  }

  // Email methods
  async generateEmailContent(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/email/generate', data);
      return response;
    } catch (error: any) {
      console.error('Failed to generate email content:', error);
      return { success: false, error: error.message };
    }
  }

  async getRealTimeMetrics(): Promise<ApiResponse<EmailMetrics>> {
    try {
      const response = await this.get('/metrics/real-time');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch real-time metrics:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/email/analytics');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch email analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Lead methods
  async scoreLeads(): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/leads/score');
      return response;
    } catch (error: any) {
      console.error('Failed to score leads:', error);
      return { success: false, error: error.message };
    }
  }

  async getLeads(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/leads');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      return { success: false, error: error.message };
    }
  }

  // Analytics methods
  async getAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/analytics');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Social media methods
  async getSocialPlatforms(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/social/platforms');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch social platforms:', error);
      return { success: false, error: error.message };
    }
  }

  async connectSocialPlatform(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/social/connect', data);
      return response;
    } catch (error: any) {
      console.error('Failed to connect social platform:', error);
      return { success: false, error: error.message };
    }
  }

  async scheduleSocialPost(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/social/schedule', data);
      return response;
    } catch (error: any) {
      console.error('Failed to schedule social post:', error);
      return { success: false, error: error.message };
    }
  }

  // Integration methods
  get integrations(): IntegrationMethods {
    return this.integrationMethods;
  }

  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.integrationMethods.getConnections();
  }

  async createConnection(data: any): Promise<ApiResponse<any>> {
    return this.integrationMethods.createConnection(data);
  }

  async deleteConnection(id: string): Promise<ApiResponse<any>> {
    return this.integrationMethods.deleteConnection(id);
  }

  // Social platform methods
  socialPlatforms() {
    return this.socialMethods;
  }

  // User preferences
  async userPreferences(): Promise<UserPreferencesMethods> {
    console.log('Getting user preferences methods');
    return {
      get: async () => ({ success: true, data: {} }),
      update: async (data: any) => ({ success: true, data }),
      getUserPreferences: async (category?: string) => ({ success: true, data: {} }),
      updateUserPreferences: async (category: string, data: any) => ({ success: true, data })
    };
  }

  // Workflow methods
  async workflows(): Promise<WorkflowMethods> {
    console.log('Getting workflow methods');
    return {
      getAll: async () => ({ success: true, data: [] }),
      create: async (workflow: any) => ({ success: true, data: { id: '1', ...workflow } }),
      update: async (id: string, workflow: any) => ({ success: true, data: { id, ...workflow } }),
      delete: async (id: string) => ({ success: true, data: undefined }),
      execute: async (id: string, input?: any) => ({ success: true, data: { result: 'executed' } })
    };
  }
}

export const apiClient = new ApiClient();
export type { Workflow, WorkflowMethods, Campaign } from './api-client-interface';
