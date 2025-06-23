
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface ConversationRequest {
  query: string;
  context?: any;
}

export interface ConversationResponse {
  message: string;
  suggestions?: string[];
  metadata?: any;
}

export class ConversationalService {
  static async processQuery(request: ConversationRequest): Promise<ApiResponse<ConversationResponse>> {
    try {
      const response = await apiClient.queryAgent(request.query);
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process query'
      };
    }
  }

  static async getAuthToken(): Promise<string | null> {
    try {
      // Mock implementation - in real app this would get actual auth token
      return 'mock-auth-token';
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  static async fetchCampaignData(authToken: string): Promise<any[]> {
    try {
      const response = await apiClient.getCampaigns();
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
      return [];
    }
  }

  static async callDailyFocusAgent(query: string, campaigns: any[], context?: any, authToken?: string): Promise<any> {
    try {
      const response = await apiClient.callDailyFocusAgent(query, campaigns);
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Daily focus agent failed');
    }
  }

  static async callGeneralCampaignAgent(query: string, campaigns: any[], context?: any, authToken?: string): Promise<any> {
    try {
      const response = await apiClient.callGeneralCampaignAgent(query, campaigns);
      return response.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'General campaign agent failed');
    }
  }

  static async getDailyFocus(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.callDailyFocusAgent(query, campaigns);
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get daily focus'
      };
    }
  }

  static async getCampaignAnalysis(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.callGeneralCampaignAgent(query, campaigns);
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get campaign analysis'
      };
    }
  }
}
