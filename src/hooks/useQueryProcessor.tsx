
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ConversationalService } from '@/lib/services/conversational-service';
import { QueryProcessor } from '@/lib/utils/query-processor';

export const useQueryProcessor = () => {
  const { toast } = useToast();

  const processQueryWithRealAI = async (userQuery: string, context: any[]) => {
    try {
      console.log('Fetching campaign data...');
      
      const authToken = await ConversationalService.getAuthToken();
      const campaignData = await ConversationalService.fetchCampaignData(authToken);
      const queryType = QueryProcessor.determineQueryType(userQuery);
      
      let agentResponse;
      
      if (queryType === 'daily_focus') {
        agentResponse = await ConversationalService.callDailyFocusAgent(userQuery, campaignData, context, authToken);
      } else {
        agentResponse = await ConversationalService.callGeneralCampaignAgent(userQuery, campaignData, context, authToken);
      }
      
      return QueryProcessor.formatAgentResponse(agentResponse, queryType, campaignData);
      
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  };

  return {
    processQueryWithRealAI
  };
};
