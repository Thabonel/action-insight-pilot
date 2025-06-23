
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

interface ConversationContext {
  userId: string;
  sessionId: string;
  previousMessages: Array<{ role: string; content: string }>;
  userPreferences?: any;
}

export class ConversationalService {
  async processConversation(
    message: string,
    context: ConversationContext
  ): Promise<ApiResponse<{ response: string; suggestions?: string[] }>> {
    try {
      console.log('Processing conversation:', { message, context });
      
      const result = await apiClient.queryAgent(message, context) as ApiResponse<any>;
      
      if (result.success) {
        return {
          success: true,
          data: {
            response: result.data?.message || 'I understand your message.',
            suggestions: result.data?.suggestions || [
              'Tell me more about this',
              'What are the next steps?',
              'Can you provide examples?'
            ]
          }
        };
      } else {
        return {
          success: false,
          error: 'Failed to process conversation'
        };
      }
    } catch (error) {
      console.error('Error processing conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process conversation'
      };
    }
  }

  async getDashboardInsights(userId: string): Promise<ApiResponse<any>> {
    try {
      console.log('Getting dashboard insights for user:', userId);
      
      const mockInsights = {
        totalActions: 15,
        recentActivities: [
          { type: 'email_sent', message: 'Campaign email sent successfully', timestamp: new Date() },
          { type: 'lead_scored', message: 'New lead scored 85 points', timestamp: new Date() }
        ],
        suggestions: [
          'Review your email campaign performance',
          'Update lead scoring criteria',
          'Schedule social media posts'
        ],
        trends: {
          positive: 8,
          negative: 2,
          neutral: 5
        }
      };

      return {
        success: true,
        data: mockInsights
      };
    } catch (error) {
      console.error('Error getting dashboard insights:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get insights'
      };
    }
  }

  async generateResponse(query: string, context?: any): Promise<ApiResponse<{ message: string }>> {
    try {
      console.log('Generating response for query:', query);
      
      // Mock response generation
      const responses = [
        'Based on your data, I recommend focusing on email engagement.',
        'Your lead scoring appears to be working well. Consider expanding criteria.',
        'Social media performance shows room for improvement in posting frequency.',
        'Campaign metrics suggest your audience prefers morning send times.'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      return {
        success: true,
        data: { message: randomResponse }
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate response'
      };
    }
  }
}

export const conversationalService = new ConversationalService();
