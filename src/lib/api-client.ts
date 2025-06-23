import axios from 'axios';
import { createSocialMethods } from './api/social-methods';
import { 
  ApiResponse, 
  SocialPlatformConnection, 
  Workflow, 
  WorkflowMethods, 
  IntegrationConnection, 
  Webhook,
  UserPreferencesMethods 
} from './api-client-interface';

class ApiClient {
  private client: any;
  private socialMethods: any;

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
  }

  async get(url: string, params?: any): Promise<any> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error: any) {
      console.error('GET request failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async post(url: string, data?: any): Promise<any> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error: any) {
      console.error('POST request failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async put(url: string, data?: any): Promise<any> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error: any) {
      console.error('PUT request failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async delete(url: string): Promise<any> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error: any) {
      console.error('DELETE request failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async queryAgent(query: string, context?: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/agent/query', { query, context });
      return response;
    } catch (error: any) {
      console.error('Agent query failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async callGeneralCampaignAgent(message: string, campaigns: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/agent/campaign', { message, campaigns });
      return response;
    } catch (error: any) {
      console.error('Campaign agent call failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getBlogAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/analytics/blog');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch blog analytics:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/analytics/email');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch email analytics:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/analytics');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getLeads(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get('/leads');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/social/schedule', postData);
      return response;
    } catch (error: any) {
      console.error('Failed to schedule social post:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async socialPlatforms() {
    return this.socialMethods;
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    try {
      const response = await this.get('/social/platforms');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch social platforms:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async connectSocialPlatform(config: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/social/connect', config);
      return response;
    } catch (error: any) {
      console.error('Failed to connect social platform:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createContent(contentData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.post('/content/create', contentData);
      return response;
    } catch (error: any) {
      console.error('Failed to create content:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async userPreferences(): Promise<UserPreferencesMethods> {
    console.log('Getting user preferences methods');
    return {
      get: async () => ({ success: true, data: {} }),
      update: async (data: any) => ({ success: true, data }),
      getUserPreferences: async (category?: string) => ({ success: true, data: {} }),
      updateUserPreferences: async (category: string, data: any) => ({ success: true, data }),
    };
  }

  async workflows(): Promise<WorkflowMethods> {
    console.log('Getting workflow methods');
    return {
      getAll: async () => ({ success: true, data: [] }),
      create: async (workflow: Partial<Workflow>) => ({ 
        success: true, 
        data: { id: '1', ...workflow } as Workflow 
      }),
      update: async (id: string, workflow: Partial<Workflow>) => ({ 
        success: true, 
        data: { id, ...workflow } as Workflow 
      }),
      delete: async (id: string) => ({ success: true, data: undefined }),
      execute: async (id: string, input?: any) => ({ 
        success: true, 
        data: { result: 'executed' } 
      }),
    };
  }

  async getIntegrations(): Promise<ApiResponse<IntegrationConnection[]>> {
    try {
      const response = await this.get('/integrations');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch integrations:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createIntegration(integration: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> {
    try {
      const response = await this.post('/integrations', integration);
      return response;
    } catch (error: any) {
      console.error('Failed to create integration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateIntegration(id: string, integration: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> {
    try {
      const response = await this.put(`/integrations/${id}`, integration);
      return response;
    } catch (error: any) {
      console.error('Failed to update integration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteIntegration(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.delete(`/integrations/${id}`);
      return response;
    } catch (error: any) {
      console.error('Failed to delete integration:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    try {
      const response = await this.get('/webhooks');
      return response;
    } catch (error: any) {
      console.error('Failed to fetch webhooks:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createWebhook(webhook: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    try {
      const response = await this.post('/webhooks', webhook);
      return response;
    } catch (error: any) {
      console.error('Failed to create webhook:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async updateWebhook(id: string, webhook: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    try {
      const response = await this.put(`/webhooks/${id}`, webhook);
      return response;
    } catch (error: any) {
      console.error('Failed to update webhook:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.delete(`/webhooks/${id}`);
      return response;
    } catch (error: any) {
      console.error('Failed to delete webhook:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const apiClient = new ApiClient();
