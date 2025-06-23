import { HttpClient } from './http-client';
import {
  ApiResponse,
  User,
  Campaign,
  Lead,
  Workflow,
  WorkflowStep,
  Content,
  BlogPost,
  BlogPostParams,
  ContentBrief,
  AnalyticsOverview,
  UserPreferences,
  UserPreference,
  SocialPlatformConnection,
  IntegrationConnection,
  Webhook,
  EmailMetrics,
  BlogAnalytics,
  BlogPerformanceMetrics,
  TrafficSource,
  KeywordPerformance,
  SocialPost
} from './api-client-interface';

export class ApiClient {
  private httpClient: HttpClient;

  constructor(baseUrl: string) {
    this.httpClient = new HttpClient(baseUrl);
  }

  setToken(token: string) {
    this.httpClient.setAuthToken(token);
  }

  async getUser(): Promise<ApiResponse<User>> {
    try {
      const response = await this.httpClient.request('/api/user');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get user' };
    }
  }

  async updateUser(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.httpClient.request('/api/user', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update user' };
    }
  }

  async getAnalyticsOverview(): Promise<ApiResponse<AnalyticsOverview>> {
    try {
      const response = await this.httpClient.request('/api/analytics/overview');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get analytics overview' };
    }
  }

  async getEmailMetrics(): Promise<ApiResponse<EmailMetrics>> {
    try {
      const response = await this.httpClient.request('/api/metrics/email');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get email metrics' };
    }
  }

  async getBlogAnalytics(): Promise<ApiResponse<BlogAnalytics>> {
    try {
      const response = await this.httpClient.request('/api/analytics/blog');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get blog analytics' };
    }
  }

  async getBlogPerformanceMetrics(): Promise<ApiResponse<BlogPerformanceMetrics[]>> {
    try {
      const response = await this.httpClient.request('/api/analytics/blog/performance');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get blog performance metrics', data: [] };
    }
  }

  async getTrafficSources(): Promise<ApiResponse<TrafficSource[]>> {
    try {
      const response = await this.httpClient.request('/api/analytics/traffic-sources');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get traffic sources', data: [] };
    }
  }

  async getKeywordPerformance(): Promise<ApiResponse<KeywordPerformance[]>> {
    try {
      const response = await this.httpClient.request('/api/analytics/keyword-performance');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get keyword performance', data: [] };
    }
  }

  async getLeads(): Promise<ApiResponse<Lead[]>> {
    try {
      const response = await this.httpClient.request('/api/leads');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get leads', data: [] };
    }
  }

  async createLead(leadData: Partial<Lead>): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.httpClient.request('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create lead' };
    }
  }

   async updateLead(id: string, leadData: Partial<Lead>): Promise<ApiResponse<Lead>> {
    try {
      const response = await this.httpClient.request(`/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(leadData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update lead' };
    }
  }

  async deleteLead(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/leads/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete lead' };
    }
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    try {
      const response = await this.httpClient.request('/api/leads/score', { method: 'POST' });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to score leads' };
    }
  }

  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    try {
      const response = await this.httpClient.request('/api/workflows');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get workflows', data: [] };
    }
  }

  async createWorkflow(name: string, description?: string): Promise<ApiResponse<Workflow>> {
    try {
      const response = await this.httpClient.request('/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create workflow' };
    }
  }

  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
    try {
      const response = await this.httpClient.request(`/api/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update workflow' };
    }
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/workflows/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete workflow' };
    }
  }

  async executeWorkflow(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.httpClient.request(`/api/workflows/${id}/execute`, { method: 'POST' });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to execute workflow' };
    }
  }

  async getContent(): Promise<ApiResponse<Content[]>> {
    try {
      const response = await this.httpClient.request('/api/content');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get content', data: [] };
    }
  }

  async createContent(contentData: Partial<Content>): Promise<ApiResponse<Content>> {
    try {
      const response = await this.httpClient.request('/api/content', {
        method: 'POST',
        body: JSON.stringify(contentData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create content' };
    }
  }

  async updateContent(id: string, contentData: Partial<Content>): Promise<ApiResponse<Content>> {
    try {
      const response = await this.httpClient.request(`/api/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify(contentData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update content' };
    }
  }

  async deleteContent(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/content/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete content' };
    }
  }

  async getBlogPosts(): Promise<ApiResponse<BlogPost[]>> {
    try {
      const response = await this.httpClient.request('/api/blog');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get blog posts', data: [] };
    }
  }

  async createBlogPost(blogPostData: BlogPostParams): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await this.httpClient.request('/api/blog', {
        method: 'POST',
        body: JSON.stringify(blogPostData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create blog post' };
    }
  }

  async updateBlogPost(id: string, blogPostData: Partial<BlogPost>): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await this.httpClient.request(`/api/blog/${id}`, {
        method: 'PUT',
        body: JSON.stringify(blogPostData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update blog post' };
    }
  }

  async deleteBlogPost(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/blog/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete blog post' };
    }
  }

  async getUserPreferencesByCategory(category: string): Promise<ApiResponse<UserPreference[]>> {
    try {
      const response = await this.httpClient.request(`/api/user/preferences?category=${category}`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get user preferences', data: [] };
    }
  }

  async updateUserPreferences(category: string, preference_data: UserPreferences): Promise<ApiResponse<UserPreference>> {
    try {
      const response = await this.httpClient.request('/api/user/preferences', {
        method: 'POST',
        body: JSON.stringify({ category, preference_data }),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update user preferences' };
    }
  }

  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    try {
      const response = await this.httpClient.request('/api/social/platforms');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get social platforms', data: [] };
    }
  }

  async connectSocialPlatform(platform: string): Promise<ApiResponse<SocialPlatformConnection>> {
    try {
      const response = await this.httpClient.request('/api/social/platforms/connect', {
        method: 'POST',
        body: JSON.stringify({ platform }),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to connect social platform' };
    }
  }

  async disconnectSocialPlatform(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/social/platforms/${id}/disconnect`, { method: 'POST' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to disconnect social platform' };
    }
  }

  async getIntegrations(): Promise<ApiResponse<IntegrationConnection[]>> {
    try {
      const response = await this.httpClient.request('/api/integrations');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get integrations', data: [] };
    }
  }

  async connectIntegration(integrationId: string): Promise<ApiResponse<IntegrationConnection>> {
    try {
      const response = await this.httpClient.request(`/api/integrations/${integrationId}/connect`, { method: 'POST' });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to connect integration' };
    }
  }

  async disconnectIntegration(integrationId: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/integrations/${integrationId}/disconnect`, { method: 'POST' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to disconnect integration' };
    }
  }

  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    try {
      const response = await this.httpClient.request('/api/webhooks');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get webhooks', data: [] };
    }
  }

  async createWebhook(webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    try {
      const response = await this.httpClient.request('/api/webhooks', {
        method: 'POST',
        body: JSON.stringify(webhookData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create webhook' };
    }
  }

  async updateWebhook(id: string, webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    try {
      const response = await this.httpClient.request(`/api/webhooks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(webhookData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update webhook' };
    }
  }

  async deleteWebhook(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.request(`/api/webhooks/${id}`, { method: 'DELETE' });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete webhook' };
    }
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<Content>> {
    try {
      const response = await this.request('/api/content/generate', {
        method: 'POST',
        body: JSON.stringify(brief),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to generate content' };
    }
  }

  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const response = await this.request('/api/campaigns');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get campaigns', data: [] };
    }
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.request(`/api/campaigns/${id}`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get campaign' };
    }
  }

  async queryAgent(query: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.request('/api/ai/query', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to query agent' };
    }
  }

  async callDailyFocusAgent(): Promise<ApiResponse<any>> {
    try {
      const response = await this.request('/api/ai/daily-focus', { method: 'POST' });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to call daily focus agent' };
    }
  }

  async callGeneralCampaignAgent(): Promise<ApiResponse<any>> {
    try {
      const response = await this.request('/api/ai/campaign-agent', { method: 'POST' });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to call campaign agent' };
    }
  }

  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.request('/api/metrics/realtime');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get real-time metrics' };
    }
  }

  async scheduleSocialPost(postData: SocialPost): Promise<ApiResponse<SocialPost>> {
    try {
      const response = await this.request('/api/social/schedule', {
        method: 'POST',
        body: JSON.stringify(postData),
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to schedule social post' };
    }
  }

  async getSocialPosts(): Promise<ApiResponse<SocialPost[]>> {
    try {
      const response = await this.request('/api/social/posts');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get social posts', data: [] };
    }
  }

  // Workflow automation methods
  workflows = {
    getAll: async (): Promise<ApiResponse<Workflow[]>> => {
      try {
        const response = await this.request('/api/workflows');
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to get workflows', data: [] };
      }
    },
    create: async (name: string, description?: string): Promise<ApiResponse<Workflow>> => {
      try {
        const response = await this.request('/api/workflows', {
          method: 'POST',
          body: JSON.stringify({ name, description }),
        });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create workflow' };
      }
    },
    update: async (id: string, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
      try {
        const response = await this.request(`/api/workflows/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update workflow' };
      }
    },
    delete: async (id: string): Promise<ApiResponse<void>> => {
      try {
        await this.request(`/api/workflows/${id}`, { method: 'DELETE' });
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete workflow' };
      }
    },
    execute: async (id: string): Promise<ApiResponse<any>> => {
      try {
        const response = await this.request(`/api/workflows/${id}/execute`, { method: 'POST' });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to execute workflow' };
      }
    }
  };

  // Integration methods
  integrations = {
    getWebhooks: async (): Promise<ApiResponse<Webhook[]>> => {
      try {
        const response = await this.request('/api/integrations/webhooks');
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to get webhooks', data: [] };
      }
    },
    createWebhook: async (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      try {
        const response = await this.request('/api/integrations/webhooks', {
          method: 'POST',
          body: JSON.stringify(webhookData),
        });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create webhook' };
      }
    },
    updateWebhook: async (id: string, webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => {
      try {
        const response = await this.request(`/api/integrations/webhooks/${id}`, {
          method: 'PUT',
          body: JSON.stringify(webhookData),
        });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update webhook' };
      }
    },
    deleteWebhook: async (id: string): Promise<ApiResponse<void>> => {
      try {
        await this.request(`/api/integrations/webhooks/${id}`, { method: 'DELETE' });
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete webhook' };
      }
    },
    testWebhook: async (id: string): Promise<ApiResponse<any>> => {
      try {
        const response = await this.request(`/api/integrations/webhooks/${id}/test`, { method: 'POST' });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to test webhook' };
      }
    },
    getConnections: async (): Promise<ApiResponse<IntegrationConnection[]>> => {
      try {
        const response = await this.request('/api/integrations/connections');
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to get connections', data: [] };
      }
    },
    createConnection: async (connectionData: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> => {
      try {
        const response = await this.request('/api/integrations/connections', {
          method: 'POST',
          body: JSON.stringify(connectionData),
        });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create connection' };
      }
    },
    deleteConnection: async (id: string): Promise<ApiResponse<void>> => {
      try {
        await this.request(`/api/integrations/connections/${id}`, { method: 'DELETE' });
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete connection' };
      }
    },
    connectService: async (serviceId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await this.request(`/api/integrations/services/${serviceId}/connect`, { method: 'POST' });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to connect service' };
      }
    },
    disconnectService: async (serviceId: string): Promise<ApiResponse<void>> => {
      try {
        await this.request(`/api/integrations/services/${serviceId}/disconnect`, { method: 'POST' });
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to disconnect service' };
      }
    },
    syncService: async (serviceId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await this.request(`/api/integrations/services/${serviceId}/sync`, { method: 'POST' });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to sync service' };
      }
    }
  };

  // Social platform methods
  socialPlatforms = {
    getAll: async (): Promise<ApiResponse<SocialPlatformConnection[]>> => {
      try {
        const response = await this.request('/api/social/platforms');
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to get social platforms', data: [] };
      }
    },
    connect: async (platform: string): Promise<ApiResponse<SocialPlatformConnection>> => {
      try {
        const response = await this.request('/api/social/platforms/connect', {
          method: 'POST',
          body: JSON.stringify({ platform }),
        });
        return { success: true, data: response };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to connect social platform' };
      }
    },
    disconnect: async (id: string): Promise<ApiResponse<void>> => {
      try {
        await this.request(`/api/social/platforms/${id}/disconnect`, { method: 'POST' });
        return { success: true };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to disconnect social platform' };
      }
    }
  };
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000');
