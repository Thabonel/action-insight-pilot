import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConversationalService } from '@/lib/services/conversational-service';
import { QueryProcessor } from '@/lib/utils/query-processor';

export const useQueryProcessor = () => {
  const { toast } = useToast();

  const processQueryWithRealAI = async (userQuery: string, context: Record<string, unknown>[]) => {
    try {
      console.log('Processing query with local backend...');
      
      const authToken = await ConversationalService.getAuthToken();
      const campaignData = await ConversationalService.fetchCampaignData();
      const queryType = QueryProcessor.determineQueryType(userQuery);
      
      let agentResponse;
      
      try {
        if (queryType === 'daily_focus') {
          agentResponse = await ConversationalService.callDailyFocusAgent(userQuery);
        } else {
          agentResponse = await ConversationalService.callGeneralCampaignAgent(userQuery);
        }
        
        return QueryProcessor.formatAgentResponse(agentResponse, queryType, campaignData);
      } catch (backendError) {
        console.warn('Backend AI service unavailable, using fallback response:', backendError);
        
        // Provide intelligent fallback based on query type and available data
        if (queryType === 'daily_focus') {
          const campaignCount = campaignData.length;
          if (campaignCount > 0) {
            return `Based on your ${campaignCount} campaigns, focus today on analyzing your most recent campaign performance and identifying optimization opportunities.`;
          } else {
            return "Start your marketing journey today by creating your first campaign. Focus on defining your target audience and key messaging.";
          }
        } else {
          return `I'm analyzing your ${campaignData.length} campaigns. While my full AI capabilities are temporarily limited, I can see your marketing setup and suggest focusing on data-driven optimization strategies.`;
        }
      }
      
    } catch (error) {
      console.error('Query processing error:', error);
      throw error;
    }
  };

  return {
    processQueryWithRealAI
  };
};
