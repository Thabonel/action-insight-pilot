import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface ConversationalQuery {
  query: string;
  context?: any;
  sessionId?: string;
}

export interface ConversationalResponse {
  response: string;
  suggestions?: string[];
  followUp?: string[];
  metadata?: any;
}

export class ConversationalService {
  // Existing methods
  async processQuery(queryData: ConversationalQuery): Promise<ApiResponse<ConversationalResponse>> {
    try {
      const result = await apiClient.queryAgent(queryData.query, queryData.context);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            response: result.data.response,
            suggestions: [
              'Tell me more about this',
              'Show me related metrics',
              'What are the next steps?'
            ],
            followUp: [
              'Would you like to see detailed analytics?',
              'Should I create a report for this?'
            ]
          }
        };
      }
      
      return result as ApiResponse<ConversationalResponse>;
    } catch (error) {
      console.error('Error processing conversational query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process query'
      };
    }
  }

  async generateSuggestions(context: any): Promise<string[]> {
    return [
      'How can I improve my campaign performance?',
      'What are my best performing content pieces?',
      'Show me lead conversion trends',
      'Help me optimize my email campaigns'
    ];
  }

  async processFollowUp(previousQuery: string, followUpQuery: string): Promise<ApiResponse<ConversationalResponse>> {
    const context = {
      previousQuery,
      isFollowUp: true
    };
    
    return this.processQuery({
      query: followUpQuery,
      context
    });
  }

  // Missing methods that components are trying to use
  static async getAuthToken(): Promise<string> {
    return 'mock-auth-token';
  }

  static async fetchCampaignData(): Promise<any> {
    const result = await apiClient.getCampaigns();
    return result.data || [];
  }

  static async callDailyFocusAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { response: `Daily focus response to: ${query}` }
    };
  }

  static async callGeneralCampaignAgent(query: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { response: `Campaign agent response to: ${query}` }
    };
  }

  async getDashboardInsights(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        insights: [
          { type: 'performance', message: 'Campaign performance is trending upward' },
          { type: 'optimization', message: 'Consider A/B testing your email subject lines' }
        ]
      }
    };
  }

  async generateResponse(query: string, context?: any): Promise<ApiResponse<ConversationalResponse>> {
    return this.processQuery({ query, context });
  }
}

export const conversationalService = new ConversationalService();
