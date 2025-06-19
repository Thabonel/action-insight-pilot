
import { HttpClient } from './http-client';
import { supabase } from '@/integrations/supabase/client';

class ApiClient {
  public httpClient: HttpClient; // Make public for direct access

  constructor() {
    // Use local backend URL instead of external orchestrator
    const baseURL = import.meta.env.DEV 
      ? 'http://localhost:8000' 
      : 'https://wheels-wins-orchestrator.onrender.com';
    
    this.httpClient = new HttpClient(baseURL);
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
    console.log('HTTP Client token updated:', token ? 'Token provided' : 'No token');
  }

  // Campaign methods
  async getCampaigns() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.get('/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to get campaigns:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get campaigns' };
    }
  }

  async getCampaignById(id: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.get(`/api/campaigns/${id}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to get campaign:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get campaign' };
    }
  }

  async createCampaign(campaignData: any) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.post('/api/campaigns', campaignData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to create campaign:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create campaign' };
    }
  }

  async updateCampaign(id: string, campaignData: any) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.put(`/api/campaigns/${id}`, campaignData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to update campaign:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update campaign' };
    }
  }

  // Lead methods
  async getLeads() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.get('/api/leads', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to get leads:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get leads' };
    }
  }

  async exportLeads(format: string = 'csv') {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.get(`/api/leads/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to export leads:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to export leads' };
    }
  }

  async syncLeads() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.post('/api/leads/sync', {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to sync leads:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to sync leads' };
    }
  }

  // System health
  async getSystemHealth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.get('/api/health', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to get system health:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to get system health' };
    }
  }

  // Agent methods
  async executeAgentTask(agentType: string, taskType: string, inputData: any) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.request('/api/agents/execute', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agent_type: agentType,
          task_type: taskType,
          input_data: inputData
        })
      });

      return response;
    } catch (error) {
      console.error(`Failed to execute ${agentType} task:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to execute agent task' };
    }
  }

  async callDailyFocusAgent(query: string, campaigns: any[], context: any[]) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.request('/api/agents/daily-focus', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          campaigns,
          context,
          date: new Date().toISOString().split('T')[0]
        })
      });

      return response;
    } catch (error) {
      console.error('Daily focus agent failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Daily focus agent failed' };
    }
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[], context: any[]) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.request('/api/agents/campaign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task_type: 'general_query',
          input_data: {
            query,
            campaigns,
            context
          }
        })
      });

      return response;
    } catch (error) {
      console.error('Campaign agent failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Campaign agent failed' };
    }
  }

  // Content methods
  async createContent(contentData: any) {
    return { success: true, data: contentData };
  }

  async generateSocialContent(platform: string, topic: string, brandVoice: string) {
    return {
      success: true,
      data: {
        content: `Generated ${brandVoice} content for ${platform} about ${topic}. This is AI-generated content that would normally come from your AI service.`
      }
    };
  }

  // Email methods
  async generateEmailContent(campaignType: string, options: any) {
    return {
      success: true,
      data: {
        content: `Generated email content for ${campaignType} campaign targeting ${options.audience}. This content would be AI-generated based on your template and audience preferences.`,
        subject_lines: [
          { text: `Your ${campaignType} Update`, score: 85 },
          { text: `Important ${campaignType} Information`, score: 78 },
          { text: `Don't Miss This ${campaignType}`, score: 82 }
        ]
      }
    };
  }

  async generateABVariants(subject: string) {
    return {
      success: true,
      data: {
        variants: [
          { text: subject + " - Variant A", score: 87 },
          { text: subject + " - Variant B", score: 84 },
          { text: subject + " - Variant C", score: 89 }
        ]
      }
    };
  }

  async suggestSendTime(options: any) {
    return {
      success: true,
      data: {
        optimal_time: "Tuesday 10:30 AM",
        improvement: "15"
      }
    };
  }

  async getEmailAnalytics() {
    return { success: true, data: [] };
  }

  async getSocialAnalytics() {
    return { success: true, data: [] };
  }

  async getEmailRealTimeMetrics() {
    return { success: true, data: [] };
  }

  // Social methods
  async createSocialPost(postData: any) {
    return { success: true, data: postData };
  }

  async scheduleSocialPost(postData: any) {
    return { success: true, data: postData };
  }

  // Workflow methods
  async getWorkflows() {
    return { success: true, data: [] };
  }

  async createWorkflow(workflowData: any) {
    return { success: true, data: workflowData };
  }

  async executeWorkflow(workflowId: string) {
    return { success: true, data: { id: workflowId, status: 'executed' } };
  }

  async getWorkflowStatus(workflowId: string) {
    return { 
      success: true, 
      data: { 
        workflow_id: workflowId, 
        status: 'running',
        current_step: 1,
        total_steps: 5,
        started_at: new Date().toISOString(),
        estimated_completion: new Date(Date.now() + 3600000).toISOString()
      } 
    };
  }

  async updateWorkflow(workflowId: string, workflowData: any) {
    return { success: true, data: { id: workflowId, ...workflowData } };
  }

  async deleteWorkflow(workflowId: string) {
    return { success: true, data: { id: workflowId, deleted: true } };
  }

  // Enhanced placeholder properties for compatibility
  analytics = {
    getMetrics: () => ({ success: true, data: [] }),
    getReports: () => ({ success: true, data: [] }),
    getSystemStats: () => ({ success: true, data: {} }),
    exportAnalyticsReport: (format: string, timeRange: string) => ({ success: true, data: {} }),
    getAnalyticsOverview: () => ({ success: true, data: { engagement: 0 } })
  };

  integrations = {
    getConnections: () => ({ success: true, data: [] }),
    connect: () => ({ success: true, data: {} }),
    disconnect: () => ({ success: true, data: {} }),
    getWebhooks: () => ({ success: true, data: [] }),
    createWebhook: (data: any) => ({ success: true, data }),
    deleteWebhook: (id: string) => ({ success: true, data: {} }),
    testWebhook: (id: string) => ({ success: true, data: {} }),
    connectService: (service: string, apiKey: string) => ({ success: true, data: {} }),
    syncService: (service: string) => ({ success: true, data: {} }),
    disconnectService: (service: string) => ({ success: true, data: {} }),
    createConnection: (data: any) => ({ success: true, data }),
    deleteConnection: (id: string) => ({ success: true, data: {} })
  };

  realTimeMetrics = {
    getMetrics: () => ({ success: true, data: [] }),
    subscribe: () => ({ success: true, data: {} }),
    getEntityMetrics: (entityType: string, entityId: string) => ({ success: true, data: [] }),
    getDashboardMetrics: () => ({ success: true, data: {} })
  };

  socialPlatforms = {
    getConnected: () => ({ success: true, data: [] }),
    connect: () => ({ success: true, data: {} }),
    disconnect: () => ({ success: true, data: {} }),
    getMetrics: () => ({ success: true, data: [] }),
    getPlatformConnections: () => ({ success: true, data: [] }),
    initiatePlatformConnection: (platform: string) => ({ success: true, data: {} }),
    disconnectPlatform: (platform: string) => ({ success: true, data: {} }),
    testPlatformConnection: (platform: string) => ({ success: true, data: {} })
  };

  userPreferences = {
    get: () => ({ success: true, data: {} }),
    update: () => ({ success: true, data: {} }),
    getUserPreferences: (category: string) => ({ success: true, data: [] }),
    updateUserPreferences: (category: string, data: any) => ({ success: true, data: {} })
  };
}

export const apiClient = new ApiClient();
