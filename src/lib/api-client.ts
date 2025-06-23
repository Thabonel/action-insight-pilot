
import axios, { AxiosInstance } from 'axios';
import { createSocialMethods } from './api/social-methods';
import type { 
  ApiResponse, 
  Workflow, 
  WorkflowMethods, 
  UserPreferences, 
  UserPreferencesMethods,
  ContentBrief,
  IntegrationConnection,
  Webhook
} from './api-client-interface';

class ApiClient {
  private client: AxiosInstance;
  private socialMethods: any;

  constructor() {
    const config = {
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    this.client = axios.create(config);
    this.socialMethods = createSocialMethods();
  }

  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async get(url: string, params?: any): Promise<ApiResponse> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error: any) {
      console.error('GET request failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async post(url: string, data?: any): Promise<ApiResponse> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error: any) {
      console.error('POST request failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async put(url: string, data?: any): Promise<ApiResponse> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      console.error('PUT request failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async delete(url: string): Promise<ApiResponse> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      console.error('DELETE request failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Agent methods
  async queryAgent(query: string, context?: any): Promise<ApiResponse> {
    try {
      const response = await this.post('/agent/query', { query, context });
      return response;
    } catch (error: any) {
      console.error('Agent query failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async callGeneralCampaignAgent(message: string, campaigns: any[]): Promise<ApiResponse> {
    try {
      const response = await this.post('/agent/campaign', { message, campaigns });
      return response;
    } catch (error: any) {
      console.error('Campaign agent call failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Analytics methods
  async getBlogAnalytics(): Promise<ApiResponse> {
    try {
      const response = await this.get('/analytics/blog');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch blog analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getEmailAnalytics(): Promise<ApiResponse> {
    try {
      const response = await this.get('/analytics/email');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch email analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getAnalytics(): Promise<ApiResponse> {
    try {
      const response = await this.get('/analytics');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRealTimeMetrics(type: string, category: string): Promise<ApiResponse> {
    try {
      const response = await this.get(`/analytics/realtime/${type}/${category}`);
      return response;
    } catch (error: any) {
      console.error('Failed to fetch real-time metrics:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse> {
    try {
      const response = await this.get('/leads');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async scoreLeads(leadIds?: string[]): Promise<ApiResponse> {
    try {
      const response = await this.post('/leads/score', { leadIds });
      return response;
    } catch (error: any) {
      console.error('Failed to score leads:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Campaign methods
  async createCampaign(campaignData: any): Promise<ApiResponse> {
    try {
      const response = await this.post('/campaigns', campaignData);
      return response;
    } catch (error: any) {
      console.error('Failed to create campaign:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Content methods
  async createContent(contentData: any): Promise<ApiResponse> {
    try {
      const response = await this.post('/content/create', contentData);
      return response;
    } catch (error: any) {
      console.error('Failed to create content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse> {
    try {
      const response = await this.post('/content/generate', brief);
      return response;
    } catch (error: any) {
      console.error('Failed to generate content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateEmailContent(data: any): Promise<ApiResponse> {
    try {
      const response = await this.post('/email/generate', data);
      return response;
    } catch (error: any) {
      console.error('Failed to generate email content:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Social media methods
  async scheduleSocialPost(postData: any): Promise<ApiResponse> {
    try {
      const response = await this.post('/social/schedule', postData);
      return response;
    } catch (error: any) {
      console.error('Failed to schedule social post:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  socialPlatforms() {
    return this.socialMethods;
  }

  async getSocialPlatforms(): Promise<ApiResponse> {
    try {
      const response = await this.get('/social/platforms');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch social platforms:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse> {
    try {
      const response = await this.post('/social/connect', config);
      return response;
    } catch (error: any) {
      console.error('Failed to connect social platform:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Integration methods
  async getIntegrations(): Promise<ApiResponse<IntegrationConnection[]>> {
    try {
      const response = await this.get('/integrations');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch integrations:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    return this.getIntegrations();
  }

  async createConnection(data: any): Promise<ApiResponse<IntegrationConnection>> {
    try {
      const response = await this.post('/integrations', data);
      return response;
    } catch (error: any) {
      console.error('Failed to create connection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteConnection(id: string): Promise<ApiResponse> {
    try {
      const response = await this.delete(`/integrations/${id}`);
      return response;
    } catch (error: any) {
      console.error('Failed to delete connection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Webhook methods
  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    try {
      const response = await this.get('/webhooks');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch webhooks:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createWebhook(data: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    try {
      const response = await this.post('/webhooks', data);
      return response;
    } catch (error: any) {
      console.error('Failed to create webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteWebhook(id: string): Promise<ApiResponse> {
    try {
      const response = await this.delete(`/webhooks/${id}`);
      return response;
    } catch (error: any) {
      console.error('Failed to delete webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testWebhook(id: string): Promise<ApiResponse> {
    try {
      const response = await this.post(`/webhooks/${id}/test`);
      return response;
    } catch (error: any) {
      console.error('Failed to test webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // User preferences
  async userPreferences(): Promise<UserPreferencesMethods> {
    console.log('Getting user preferences methods');
    return {
      get: async () => ({
        success: true,
        data: {}
      }),
      update: async (data: any) => ({
        success: true,
        data
      }),
      getUserPreferences: async (category?: string) => ({
        success: true,
        data: {}
      }),
      updateUserPreferences: async (category: string, data: any) => ({
        success: true,
        data
      })
    };
  }

  // Workflows
  async workflows(): Promise<WorkflowMethods> {
    console.log('Getting workflow methods');
    return {
      getAll: async () => ({
        success: true,
        data: []
      }),
      create: async (workflow: Partial<Workflow>) => ({
        success: true,
        data: {
          id: '1',
          ...workflow
        } as Workflow
      }),
      update: async (id: string, workflow: Partial<Workflow>) => ({
        success: true,
        data: {
          id,
          ...workflow
        } as Workflow
      }),
      delete: async (id: string) => ({
        success: true,
        data: undefined
      }),
      execute: async (id: string, input?: any) => ({
        success: true,
        data: {
          result: 'executed'
        }
      })
    };
  }
}

export const apiClient = new ApiClient();
export type { Workflow, WorkflowMethods, UserPreferences, UserPreferencesMethods };
