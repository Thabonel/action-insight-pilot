
import { supabase } from '@/integrations/supabase/client';
import { apiClient } from '@/lib/api-client';

export class ConversationalService {
  static async fetchCampaignData(authToken: string) {
    const response = await fetch('https://wheels-wins-orchestrator.onrender.com/api/campaigns', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Campaign fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const campaignsResponse = await response.json();
    
    if (!campaignsResponse.success) {
      throw new Error('Failed to fetch campaign data');
    }
    
    return Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [];
  }

  static async callDailyFocusAgent(query: string, campaigns: any[], context: any[], authToken: string) {
    const requestData = {
      query,
      campaigns,
      context,
      date: new Date().toISOString().split('T')[0]
    };

    const response = await fetch('https://wheels-wins-orchestrator.onrender.com/api/agents/daily-focus', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Daily focus agent failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Daily focus agent failed: ${data.error}`);
    }
    
    return data.data;
  }

  static async callGeneralCampaignAgent(query: string, campaigns: any[], context: any[], authToken: string) {
    const requestData = {
      task_type: 'general_query',
      input_data: {
        query,
        campaigns,
        context
      }
    };

    const response = await fetch('https://wheels-wins-orchestrator.onrender.com/api/agents/campaign', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Campaign agent failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Campaign agent failed: ${data.error}`);
    }
    
    return data.data;
  }

  static async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token;
    
    if (!authToken) {
      throw new Error('Authentication token not available');
    }
    
    return authToken;
  }
}
