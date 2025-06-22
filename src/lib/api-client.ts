
import { supabase } from '@/integrations/supabase/client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  channel: string;
  description?: string;
  budget_allocated?: number;
  budget_spent?: number;
  metrics?: any;
  target_audience?: any;
  content?: any;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

interface CreateCampaignData {
  name: string;
  type: string;
  channel: string;
  status: string;
  description?: string;
}

class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch campaigns'
      };
    }
  }

  async createCampaign(campaignData: CreateCampaignData): Promise<ApiResponse<Campaign>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
        method: 'POST',
        headers,
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create campaign'
      };
    }
  }

  async deleteCampaign(campaignId: string): Promise<ApiResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete campaign'
      };
    }
  }

  async archiveCampaign(campaignId: string): Promise<ApiResponse<Campaign>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/archive`, {
        method: 'PUT',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error archiving campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to archive campaign'
      };
    }
  }

  async restoreCampaign(campaignId: string): Promise<ApiResponse<Campaign>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/campaigns/${campaignId}/restore`, {
        method: 'PUT',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error restoring campaign:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to restore campaign'
      };
    }
  }

  async sendDailyFocusQuery(query: string, campaigns: any[], context: any[] = []): Promise<ApiResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/agents/daily-focus`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          campaigns,
          context,
          date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending daily focus query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send query'
      };
    }
  }

  async sendGeneralQuery(taskType: string, inputData: any): Promise<ApiResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/api/agents/campaign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          task_type: taskType,
          input_data: inputData
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending general query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send query'
      };
    }
  }

  // Legacy methods that return empty promises to prevent build errors
  // These can be implemented later when their backend endpoints are available
  async callDailyFocusAgent(query: string, campaigns: any[], context: any[]): Promise<ApiResponse> {
    return this.sendDailyFocusQuery(query, campaigns, context);
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[], context: any[]): Promise<ApiResponse> {
    return this.sendGeneralQuery('general', { query, campaigns, context });
  }

  // Placeholder methods to prevent build errors - these should be implemented when backend is ready
  setToken(token: string): void {
    console.log('setToken called with:', token);
  }

  createContent(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  generateSocialContent(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  generateEmailContent(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  generateABVariants(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  suggestSendTime(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  executeAgentTask(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  scoreLeads(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  createSocialPost(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  scheduleSocialPost(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  getLeads(): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  getEmailAnalytics(): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  getSocialAnalytics(): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  getSystemHealth(): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  getEmailRealTimeMetrics(): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  exportLeads(): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  syncLeads(): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  getWorkflows(): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  createWorkflow(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  executeWorkflow(data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  getWorkflowStatus(id: string): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  updateWorkflow(id: string, data: any): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  deleteWorkflow(id: string): Promise<ApiResponse> {
    return Promise.resolve({ success: false, error: 'Method not implemented' });
  }

  // Property placeholders to prevent build errors
  integrations = {
    getConnected: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
    connect: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
    disconnect: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
  };

  analytics = {
    getOverview: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
  };

  realTimeMetrics = {
    getMetrics: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
    getEngagement: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
  };

  socialPlatforms = {
    getConnected: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
    connect: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
    disconnect: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
    post: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
  };

  userPreferences = {
    get: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
    update: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
  };

  httpClient = {
    post: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
    get: () => Promise.resolve({ success: false, error: 'Method not implemented' }),
  };
}

export const apiClient = new ApiClient();
export type { Campaign, CreateCampaignData, ApiResponse };
