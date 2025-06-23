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
  static async getAuthToken(): Promise<string> {
    return 'mock-auth-token';
  }

  static async fetchCampaignData(): Promise<any[]> {
    const result = await apiClient.getCampaigns();
    return result.data || [];
  }

  static async callDailyFocusAgent(userQuery: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { response: `Daily focus response to: ${userQuery}` }
    };
  }

  static async callGeneralCampaignAgent(userQuery: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { response: `Campaign agent response to: ${userQuery}` }
    };
  }

  async processQuery(queryData: ConversationalQuery): Promise<ApiResponse<ConversationalResponse>> {
    try {
      const result = await apiClient.queryAgent(queryData.query, queryData.context);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            response: result.data.message,
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

  async getDashboardInsights(): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        totalActions: 25,
        recentActivities: [
          { type: 'campaign', message: 'New campaign created', timestamp: new Date() },
          { type: 'lead', message: 'Lead scored', timestamp: new Date() }
        ],
        suggestions: [
          'Review campaign performance',
          'Optimize email subject lines',
          'Update lead scoring criteria'
        ],
        trends: { positive: 60, negative: 20, neutral: 20 }
      }
    };
  }

  async generateResponse(query: string, context?: any): Promise<ApiResponse<ConversationalResponse>> {
    return this.processQuery({ query, context });
  }
}

export const conversationalService = new ConversationalService();
