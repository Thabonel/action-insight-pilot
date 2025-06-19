import { HttpClient } from './http-client';
import { supabase } from '@/integrations/supabase/client';

class ApiClient {
  private httpClient: HttpClient;

  constructor() {
    // Use local backend URL instead of external orchestrator
    const baseURL = import.meta.env.DEV 
      ? 'http://localhost:8000' 
      : 'https://wheels-wins-orchestrator.onrender.com';
    
    this.httpClient = new HttpClient(baseURL);
  }

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
      throw error;
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
      throw error;
    }
  }

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
      throw error;
    }
  }

  async scoreLeads() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required');
      }

      const response = await this.httpClient.post('/api/leads/score', {}, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Failed to score leads:', error);
      throw error;
    }
  }

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
      throw error;
    }
  }

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
      throw error;
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
      throw error;
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
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
