import axios from 'axios';
import { SocialMethods, createSocialMethods } from './api/social-methods';

export type { Workflow, WorkflowMethods, ContentBrief, EmailMetrics, IntegrationConnection, Webhook } from './api-client-interface';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: {
    'Content-Type': string;
  };
}

class ApiClient {
  private client;
  private socialMethods: SocialMethods;

  constructor() {
    const config: ApiConfig = {
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    this.client = axios.create(config);
    this.socialMethods = createSocialMethods();
  }

  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error: any) {
      console.error('GET request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error: any) {
      console.error('POST request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      console.error('PUT request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      console.error('DELETE request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/agent/query', { query, context });
      return response;
    } catch (error: any) {
      console.error('Agent query failed:', error);
      return { success: false, error: error.message };
    }
  }

  async callGeneralCampaignAgent(message: string, campaigns: any[]): Promise<ApiResponse<any>> {
     try {
       const response = await this.post('/agent/campaign', { message, campaigns });
       return response;
     } catch (error: any) {
       console.error('Campaign agent call failed:', error);
       return { success: false, error: error.message };
     }
  }

  async getBlogAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/analytics/blog');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch blog analytics:', error);
      return { success: false, error: error.message };
    }
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/analytics/email');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch email analytics:', error);
      return { success: false, error: error.message };
    }
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/analytics');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
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

  async getRealTimeMetrics(type: string, category: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.get(`/analytics/${type}/${category}`);
      return response;
    } catch (error: any) {
      console.error('Failed to fetch real-time metrics:', error);
      return { success: false, error: error.message };
    }
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/campaigns', campaignData);
      return response;
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      return { success: false, error: error.message };
    }
  }

  async generateContent(brief: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/content/generate', brief);
      return response;
    } catch (error: any) {
      console.error('Failed to generate content:', error);
      return { success: false, error: error.message };
    }
  }

  async generateEmailContent(brief: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/email/generate', brief);
      return response;
    } catch (error: any) {
      console.error('Failed to generate email content:', error);
      return { success: false, error: error.message };
    }
  }

  async scoreLeads(leads: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/leads/score', { leads });
      return response;
    } catch (error: any) {
      console.error('Failed to score leads:', error);
      return { success: false, error: error.message };
    }
  }

  async getConnections(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/integrations/connections');
      return response;
    } catch (error: any) {
      console.error('Failed to get connections:', error);
      return { success: false, error: error.message };
    }
  }

  async createConnection(connectionData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/integrations/connections', connectionData);
      return response;
    } catch (error: any) {
      console.error('Failed to create connection:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteConnection(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.delete(`/integrations/connections/${id}`);
      return response;
    } catch (error: any) {
      console.error('Failed to delete connection:', error);
      return { success: false, error: error.message };
    }
  }

  setToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/social/schedule', postData);
      return response;
    } catch (error: any) {
      console.error('Failed to schedule social post:', error);
      return { success: false, error: error.message };
    }
  }

  socialPlatforms(): SocialMethods {
    return this.socialMethods;
  }

  async getSocialPlatforms(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/social/platforms');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch social platforms:', error);
      return { success: false, error: error.message };
    }
  }

  async connectSocialPlatform(config: { platform: string }): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/social/connect', config);
      return response;
    } catch (error: any) {
      console.error('Failed to connect social platform:', error);
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

  async userPreferences() {
    console.log('Getting user preferences methods');
    return {
      get: async () => ({ success: true, data: {} }),
      update: async (data: any) => ({ success: true, data }),
      getUserPreferences: async (category?: string) => ({ success: true, data: {} }),
      updateUserPreferences: async (category: string, data: any) => ({ success: true, data })
    };
  }

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

  integrations() {
    return {
      getConnections: () => this.getConnections(),
      createConnection: (data: any) => this.createConnection(data),
      deleteConnection: (id: string) => this.deleteConnection(id),
      getWebhooks: async () => ({ success: true, data: [] }),
      createWebhook: async (data: any) => ({ success: true, data: { id: '1', ...data } }),
      deleteWebhook: async (id: string) => ({ success: true, data: undefined }),
    };
  }
}

export const apiClient = new ApiClient();
