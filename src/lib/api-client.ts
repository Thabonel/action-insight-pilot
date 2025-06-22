
import { HttpClient, ApiResponse } from './http-client';
import { LeadsService } from './api/leads-service';
import { SystemHealthService } from './api/system-health-service';

export interface Campaign {
  id: string;
  name: string;
  type: string;
  channel: string;
  status: string;
  description?: string;
  budget_allocated?: number;
  budget_spent?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignData {
  name: string;
  type: string;
  channel: string;
  status: string;
  description?: string;
  budget_allocated?: number;
  start_date?: string;
  end_date?: string;
}

export class ApiClient {
  private httpClient: HttpClient;
  public leads: LeadsService;
  public systemHealth: SystemHealthService;

  constructor() {
    this.httpClient = new HttpClient();
    this.leads = new LeadsService(this.httpClient);
    this.systemHealth = new SystemHealthService(this.httpClient);
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    return this.httpClient.get<Campaign[]>('/api/campaigns');
  }

  async createCampaign(campaignData: CreateCampaignData): Promise<ApiResponse<Campaign>> {
    return this.httpClient.post<Campaign>('/api/campaigns', campaignData);
  }

  async deleteCampaign(campaignId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`/api/campaigns/${campaignId}`);
  }

  async archiveCampaign(campaignId: string): Promise<ApiResponse<Campaign>> {
    return this.httpClient.put<Campaign>(`/api/campaigns/${campaignId}/archive`);
  }

  async restoreCampaign(campaignId: string): Promise<ApiResponse<Campaign>> {
    return this.httpClient.put<Campaign>(`/api/campaigns/${campaignId}/restore`);
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.leads.getLeads();
  }

  async exportLeads(format: 'csv' | 'json' = 'csv'): Promise<ApiResponse<string>> {
    return this.leads.exportLeads(format);
  }

  async syncLeads(): Promise<ApiResponse<any>> {
    return this.leads.syncLeads();
  }

  async searchLeads(query: string): Promise<ApiResponse<any[]>> {
    return this.leads.searchLeads(query);
  }

  async getLeadAnalytics(): Promise<ApiResponse<any>> {
    return this.leads.getLeadAnalytics();
  }

  async createLead(leadData: any): Promise<ApiResponse<any>> {
    return this.leads.createLead(leadData);
  }

  // System Health
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.systemHealth.getSystemHealth();
  }

  // Content generation methods
  async generateSocialContent(contentType: string, topic: string, tone: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/content/generate-social', {
      contentType,
      topic,
      tone
    });
  }

  async createContent(contentData: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/content', contentData);
  }

  // Email methods
  async generateEmailContent(subject: string, audience: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/email/generate-content', {
      subject,
      audience
    });
  }

  async generateABVariants(content: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/email/generate-ab-variants', content);
  }

  async suggestSendTime(campaignId: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/email/suggest-send-time', { campaignId });
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.get('/api/email/analytics');
  }

  async getEmailRealTimeMetrics(): Promise<ApiResponse<any>> {
    return this.httpClient.get('/api/email/real-time-metrics');
  }

  // Social methods
  async createSocialPost(postData: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/social/posts', postData);
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/social/schedule', postData);
  }

  async getSocialAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.get('/api/social/analytics');
  }

  // Agent methods
  async executeAgentTask(taskType: string, taskData: any, agentId?: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/agents/execute', {
      taskType,
      taskData,
      agentId
    });
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/leads/score');
  }

  async callDailyFocusAgent(query: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/agents/daily-focus', { query });
  }

  async callGeneralCampaignAgent(query: string): Promise<ApiResponse<any>> {
    return this.httpClient.post('/api/agents/general-campaign', { query });
  }

  // Workflow methods
  async getWorkflows(): Promise<ApiResponse<any[]>> {
    return this.httpClient.get('/api/workflows');
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

  async updateWorkflow(workflowId: string, workflowData: any): Promise<ApiResponse<any>> {
    return this.httpClient.put(`/api/workflows/${workflowId}`, workflowData);
  }

  async deleteWorkflow(workflowId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete(`/api/workflows/${workflowId}`);
  }

  // Analytics methods
  analytics = {
    getOverview: (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/analytics/overview');
    },
    getSystemStats: (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/analytics/system-stats');
    },
    exportAnalyticsReport: (format: string, timeRange: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/analytics/export', { format, timeRange });
    }
  };

  // Integrations methods
  integrations = {
    getConnected: (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/integrations/connected');
    },
    connect: (): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/integrations/connect');
    },
    disconnect: (): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/integrations/disconnect');
    },
    getConnections: (): Promise<ApiResponse<any[]>> => {
      return this.httpClient.get('/api/integrations/connections');
    },
    createConnection: (connectionData: any): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/integrations/connections', connectionData);
    },
    deleteConnection: (connectionId: string): Promise<ApiResponse<void>> => {
      return this.httpClient.delete(`/api/integrations/connections/${connectionId}`);
    },
    getWebhooks: (): Promise<ApiResponse<any[]>> => {
      return this.httpClient.get('/api/integrations/webhooks');
    },
    createWebhook: (webhookData: any): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/integrations/webhooks', webhookData);
    },
    deleteWebhook: (webhookId: string): Promise<ApiResponse<void>> => {
      return this.httpClient.delete(`/api/integrations/webhooks/${webhookId}`);
    },
    testWebhook: (webhookId: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post(`/api/integrations/webhooks/${webhookId}/test`);
    },
    connectService: (serviceData: any): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/integrations/services/connect', serviceData);
    },
    syncService: (serviceId: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post(`/api/integrations/services/${serviceId}/sync`);
    },
    disconnectService: (serviceId: string): Promise<ApiResponse<void>> => {
      return this.httpClient.delete(`/api/integrations/services/${serviceId}`);
    }
  };

  // Social platforms methods
  socialPlatforms = {
    getPlatformConnections: (): Promise<ApiResponse<any[]>> => {
      return this.httpClient.get('/api/social/platforms/connections');
    },
    initiatePlatformConnection: (platform: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post('/api/social/platforms/connect', { platform });
    },
    disconnectPlatform: (platform: string): Promise<ApiResponse<void>> => {
      return this.httpClient.delete(`/api/social/platforms/${platform}`);
    },
    testPlatformConnection: (platform: string): Promise<ApiResponse<any>> => {
      return this.httpClient.post(`/api/social/platforms/${platform}/test`);
    }
  };

  // Real-time metrics methods
  realTimeMetrics = {
    getMetrics: (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/metrics/real-time');
    },
    getSystemMetrics: (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/metrics/system');
    }
  };

  // User preferences methods
  userPreferences = {
    getPreferences: (): Promise<ApiResponse<any>> => {
      return this.httpClient.get('/api/user/preferences');
    },
    updatePreferences: (preferences: any): Promise<ApiResponse<any>> => {
      return this.httpClient.put('/api/user/preferences', preferences);
    }
  };

  // HTTP client access for direct requests
  get httpClient() {
    return {
      post: (url: string, data?: any): Promise<ApiResponse<any>> => {
        return this.httpClient.post(url, data);
      },
      get: (url: string): Promise<ApiResponse<any>> => {
        return this.httpClient.get(url);
      },
      request: (url: string, options?: any): Promise<ApiResponse<any>> => {
        return this.httpClient.request(url, options);
      }
    };
  }
}

export const apiClient = new ApiClient();
