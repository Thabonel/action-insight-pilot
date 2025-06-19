
import { supabase } from '@/integrations/supabase/client';
import { apiClient } from '@/lib/api-client';

export class ConversationalService {
  static async fetchCampaignData(authToken: string) {
    try {
      const response = await apiClient.getCampaigns();
      
      if (!response.success) {
        throw new Error('Failed to fetch campaign data');
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Campaign fetch failed:', error);
      return [];
    }
  }

  static async callDailyFocusAgent(query: string, campaigns: any[], context: any[], authToken: string) {
    try {
      const response = await apiClient.callDailyFocusAgent(query, campaigns, context);
      return response;
    } catch (error) {
      console.error('Daily focus agent failed:', error);
      throw error;
    }
  }

  static async callGeneralCampaignAgent(query: string, campaigns: any[], context: any[], authToken: string) {
    try {
      const response = await apiClient.callGeneralCampaignAgent(query, campaigns, context);
      return response;
    } catch (error) {
      console.error('General campaign agent failed:', error);
      throw error;
    }
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
