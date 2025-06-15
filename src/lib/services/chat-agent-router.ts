
import { ConversationalService } from './conversational-service';
import { QueryProcessor } from '@/lib/utils/query-processor';

export class ChatAgentRouter {
  static async routeQuery(userQuery: string, userId: string, context: any[] = []): Promise<any> {
    try {
      console.log('Routing query:', userQuery);
      
      // Check server status before making requests
      const authToken = await ConversationalService.getAuthToken();
      if (!authToken) {
        throw new Error('Unable to authenticate with backend service');
      }

      const campaignData = await ConversationalService.fetchCampaignData(authToken);
      const queryType = QueryProcessor.determineQueryType(userQuery);
      
      let agentResponse;
      
      // Route to appropriate agent based on query type
      switch (queryType) {
        case 'daily_focus':
          agentResponse = await ConversationalService.callDailyFocusAgent(userQuery, campaignData, context, authToken);
          break;
        case 'campaign_analysis':
        case 'lead_analysis':
        case 'content_strategy':
        case 'performance_metrics':
        default:
          agentResponse = await ConversationalService.callGeneralCampaignAgent(userQuery, campaignData, context, authToken);
          break;
      }
      
      return QueryProcessor.formatAgentResponse(agentResponse, queryType, campaignData);
      
    } catch (error) {
      console.error('Agent routing error:', error);
      
      // Enhanced error handling with specific error types
      if (error instanceof Error) {
        if (error.message.includes('sleeping') || error.message.includes('503')) {
          return {
            type: 'server_sleeping',
            title: 'AI Assistant Starting Up',
            explanation: 'The AI backend is currently starting up. This usually takes 30-60 seconds.',
            businessImpact: 'Your data is safe and campaigns are still running normally.',
            nextActions: ['Please wait a moment and try again', 'The system will be ready shortly']
          };
        }
        
        if (error.message.includes('timeout') || error.message.includes('network')) {
          return {
            type: 'network_error',
            title: 'Connection Issue',
            explanation: 'There seems to be a temporary network issue preventing communication with the AI assistant.',
            businessImpact: 'This is a temporary issue and doesn\'t affect your campaigns or data.',
            nextActions: ['Check your internet connection', 'Try again in a few moments', 'Refresh the page if the issue persists']
          };
        }
      }
      
      // Generic error fallback
      return {
        type: 'error',
        title: 'AI Assistant Temporarily Unavailable',
        explanation: 'The AI assistant is experiencing technical difficulties. Our team has been notified.',
        businessImpact: 'Your marketing data is safe and campaigns continue to run normally.',
        nextActions: [
          'Try rephrasing your question',
          'Check back in a few minutes',
          'Contact support if the issue persists',
          'Use the manual dashboard features in the meantime'
        ]
      };
    }
  }

  // Helper method to check if backend is available
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const authToken = await ConversationalService.getAuthToken();
      if (!authToken) return false;
      
      // Simple health check - try to fetch campaign data
      await ConversationalService.fetchCampaignData(authToken);
      return true;
    } catch (error) {
      console.log('Backend health check failed:', error);
      return false;
    }
  }

  // Method to get backend status
  static async getBackendStatus(): Promise<'awake' | 'sleeping' | 'error'> {
    try {
      const isHealthy = await this.checkBackendHealth();
      return isHealthy ? 'awake' : 'sleeping';
    } catch (error) {
      return 'error';
    }
  }
}
