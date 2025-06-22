
import { apiClient } from '@/lib/api-client';

export interface ConversationalQuery {
  query: string;
  context?: any[];
  campaignData?: any[];
}

export interface ConversationalResponse {
  response: string;
  insights?: any[];
  recommendations?: any[];
  confidence?: number;
}

export class ConversationalService {
  async processDailyFocusQuery(
    query: string,
    campaigns: any[] = [],
    context: any[] = []
  ): Promise<ConversationalResponse> {
    try {
      const response = await apiClient.callDailyFocusAgent(query, campaigns, context);
      
      if (response.success) {
        return {
          response: response.data?.focus_summary || response.data?.explanation || 'Here are your daily focus recommendations.',
          insights: response.data?.insights || [],
          recommendations: response.data?.recommendations || [],
          confidence: response.data?.confidence || 0.8
        };
      }
      
      throw new Error(response.error || 'Failed to process daily focus query');
    } catch (error) {
      console.error('Daily focus query failed:', error);
      return {
        response: 'I\'m having trouble analyzing your campaigns right now. Please try again later.',
        insights: [],
        recommendations: []
      };
    }
  }

  async processGeneralQuery(
    query: string,
    campaigns: any[] = []
  ): Promise<ConversationalResponse> {
    try {
      const response = await apiClient.callGeneralCampaignAgent('general_query', {
        query,
        campaigns,
        context: []
      });
      
      if (response.success) {
        return {
          response: response.data?.explanation || response.data?.summary || 'Here\'s what I found about your campaigns.',
          insights: response.data?.insights || [],
          recommendations: response.data?.recommendations || [],
          confidence: response.data?.confidence || 0.7
        };
      }
      
      throw new Error(response.error || 'Failed to process general query');
    } catch (error) {
      console.error('General query failed:', error);
      return {
        response: 'I\'m having trouble processing your request right now. Please try again later.',
        insights: [],
        recommendations: []
      };
    }
  }

  async getCampaignInsights(campaignId?: string): Promise<ConversationalResponse> {
    try {
      let campaigns = [];
      
      if (campaignId) {
        const campaignResponse = await apiClient.getCampaignById(campaignId);
        if (campaignResponse.success) {
          campaigns = [campaignResponse.data];
        }
      } else {
        const campaignsResponse = await apiClient.getCampaigns();
        if (campaignsResponse.success) {
          campaigns = campaignsResponse.data || [];
        }
      }

      return await this.processGeneralQuery('Analyze campaign performance and provide insights', campaigns);
    } catch (error) {
      console.error('Campaign insights failed:', error);
      return {
        response: 'Unable to retrieve campaign insights at this time.',
        insights: [],
        recommendations: []
      };
    }
  }
}

export const conversationalService = new ConversationalService();
