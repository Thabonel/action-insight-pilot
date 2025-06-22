
import { HttpClient, ApiResponse } from './http-client';
import { LeadsService } from './api/leads-service';

export interface CreateCampaignData {
  name: string;
  type: string;
  description: string;
  budget: string;
  targetAudience: string;
  timeline: string;
  channel: string;
  status: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  description: string;
  budget: string;
  targetAudience: string;
  timeline: string;
  channel: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  budget_allocated?: number;
  budget_spent?: number;
  start_date?: string;
}

export class ApiClient {
  private httpClient: HttpClient;
  public leads: LeadsService;

  // Public API service objects
  public analytics = {
    getOverview: async (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/analytics/overview');
    },
    getAnalyticsOverview: async (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/analytics/overview');
    },
    getSystemStats: async (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/analytics/stats');
    },
    exportAnalyticsReport: async (format: string, timeRange: string): Promise<ApiResponse<any>> => {
      return this.httpClient.get(`/api/analytics/export?format=${format}&timeRange=${timeRange}`);
    }
  };

  public integrations = {
    getWebhooks: async (): Promise<ApiResponse<any[]>> => {
      return this.httpClient.get<any[]>('/api/integrations/webhooks');
    },
    getConnections: async (): Promise<ApiResponse<any[]>> => {
      return this.httpClient.get<any[]>('/api/integrations/connections');
    },
    createConnection: async (connectionData: any): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/integrations/connections', connectionData);
    },
    deleteConnection: async (connectionId: string): Promise<ApiResponse<any>> => {
      return this.httpClient.delete(`/api/integrations/connections/${connectionId}`);
    },
    createWebhook: async (webhookData: any): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/integrations/webhooks', webhookData);
    },
    deleteWebhook: async (webhookId: string): Promise<ApiResponse<any>> => {
      return this.httpClient.delete(`/api/integrations/webhooks/${webhookId}`);
    },
    testWebhook: async (webhookId: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post(`/api/integrations/webhooks/${webhookId}/test`);
    },
    connectService: async (service: string, apiKey: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post(`/api/integrations/connect/${service}`, { apiKey });
    },
    syncService: async (service: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post(`/api/integrations/sync/${service}`);
    },
    disconnectService: async (service: string): Promise<ApiResponse<any>> => {
      return this.httpClient.delete(`/api/integrations/disconnect/${service}`);
    }
  };

  public realTimeMetrics = {
    getMetrics: async (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/metrics/realtime');
    },
    getEntityMetrics: async (entityType: string, entityId: string): Promise<ApiResponse<any>> => {
      return this.httpClient.get(`/api/metrics/realtime/${entityType}/${entityId}`);
    },
    getSystemMetrics: async (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/metrics/system');
    }
  };

  public socialPlatforms = {
    getPlatformConnections: async (): Promise<ApiResponse<any[]>> => {
      return this.httpClient.get<any[]>('/api/social/platforms');
    },
    getConnected: async (): Promise<ApiResponse<any[]>> => {
      return this.httpClient.get<any[]>('/api/social/platforms');
    },
    initiatePlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post(`/api/social/platforms/${platform}/connect`);
    },
    disconnectPlatform: async (platform: string): Promise<ApiResponse<any>> => {
      return this.httpClient.delete(`/api/social/platforms/${platform}`);
    },
    testPlatformConnection: async (platform: string): Promise<ApiResponse<any>> => {
      return this.httpClient.get(`/api/social/platforms/${platform}/test`);
    }
  };

  public userPreferences = {
    getPreferences: async (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/user/preferences');
    },
    getUserPreferences: async (category: string): Promise<ApiResponse<any>> => {
      return this.httpClient.get(`/api/user/preferences/${category}`);
    },
    get: async (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/user/preferences');
    },
    updatePreferences: async (preferences: any): Promise<ApiResponse<any>> => {
      return this.httpClient.put('/api/user/preferences', preferences);
    },
    updateUserPreferences: async (category: string, preferences: any): Promise<ApiResponse<any>> => {
      return this.httpClient.put(`/api/user/preferences/${category}`, preferences);
    }
  };

  constructor() {
    this.httpClient = new HttpClient();
    this.leads = new LeadsService(this.httpClient);
  }

  // Public method to access httpClient for hooks
  public getHttpClient(): HttpClient {
    return this.httpClient;
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.httpClient.get<Campaign[]>('/api/campaigns');
  }

  async getCampaignById(id: string): Promise<ApiResponse<Campaign>> {
    return this.httpClient.get<Campaign>(`/api/campaigns/${id}`);
  }

  async createCampaign(campaignData: CreateCampaignData): Promise<ApiResponse<Campaign>> {
    return this.httpClient.post<Campaign>('/api/campaigns', campaignData);
  }

  async updateCampaign(id: string, campaignData: Partial<CreateCampaignData>): Promise<ApiResponse<Campaign>> {
    return this.httpClient.put<Campaign>(`/api/campaigns/${id}`, campaignData);
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/campaigns/${id}`);
  }

  async archiveCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return this.httpClient.put<Campaign>(`/api/campaigns/${id}/archive`);
  }

  async restoreCampaign(id: string): Promise<ApiResponse<Campaign>> {
    return this.httpClient.put<Campaign>(`/api/campaigns/${id}/restore`);
  }

  // Legacy methods for backward compatibility
  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.leads.getLeads();
  }

  async exportLeads(format: string = 'csv'): Promise<ApiResponse<string>> {
    return this.leads.exportLeads(format as 'csv' | 'json');
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return this.leads.syncLeads();
  }

  // Email methods
  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.get('/api/email/analytics');
  }

  async getEmailRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.httpClient.get('/api/email/metrics/realtime');
  }

  async generateEmailContent(data: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/email/generate', { data });
  }

  async generateABVariants(data: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/email/ab-variants', { data });
  }

  async suggestSendTime(data: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/email/send-time', { data });
  }

  // Social methods
  async getSocialAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.get('/api/social/analytics');
  }

  async createSocialPost(postData: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/social/posts', postData);
  }

  async scheduleSocialPost(scheduleData: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/social/schedule', scheduleData);
  }

  async generateSocialContent(contentType: string, audience: string, platform: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/social/generate', { contentType, audience, platform });
  }

  // Content methods
  async createContent(contentData: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/content', contentData);
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<any[]>> {
    const response = await this.httpClient.get<any[]>('/api/workflows');
    return {
      ...response,
      data: Array.isArray(response.data) ? response.data : [],
    };
  }

  async createWorkflow(workflowData: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/workflows', workflowData);
  }

  async executeWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    return this.httpClient.post(`/api/workflows/${workflowId}/execute`);
  }

  async getWorkflowStatus(workflowId: string): Promise<ApiResponse<any>> {
    return this.httpClient.get(`/api/workflows/${workflowId}/status`);
  }

  async updateWorkflow(workflowId: string, updates: any): Promise<ApiResponse<any>> {
    return this.httpClient.put(`/api/workflows/${workflowId}`, updates);
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<any>> {
    return this.httpClient.delete(`/api/workflows/${workflowId}`);
  }

  // System methods
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.httpClient.get('/api/system/health');
  }

  // Agent methods
  async executeAgentTask(taskType: string, inputData: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/agents/execute', { taskType, inputData });
  }

  async scoreLeads(criteria: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/leads/score', { criteria });
  }

  async callDailyFocusAgent(query: string, campaigns: any[], context: any[]): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/agents/daily-focus', { query, campaigns, context });
  }

  async callGeneralCampaignAgent(taskType: string, inputData: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/agents/campaign', { taskType, inputData });
  }
}

export const apiClient = new ApiClient();
