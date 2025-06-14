
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

interface UseChatLogicProps {
  onChatUpdate?: (chatHistory: ChatMessage[]) => void;
}

export const useChatLogic = ({ onChatUpdate }: UseChatLogicProps = {}) => {
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const determineQueryType = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('focus') && (lowerQuery.includes('today') || lowerQuery.includes('should'))) {
      return 'daily_focus';
    }
    
    return 'general';
  };

  const callDailyFocusAgent = async (query: string, campaigns: any[]) => {
    await apiClient.httpClient.wakeUpServer();
    
    const requestData = {
      query,
      campaigns,
      context: [],
      date: new Date().toISOString().split('T')[0]
    };

    const response = await apiClient.httpClient.request('/api/agents/daily-focus', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    if (!response.success) {
      throw new Error(`Daily focus agent failed: ${response.error}`);
    }
    
    return response.data;
  };

  const callGeneralCampaignAgent = async (query: string, campaigns: any[]) => {
    await apiClient.httpClient.wakeUpServer();
    
    const requestData = {
      task_type: 'general_query',
      input_data: {
        query,
        campaigns,
        context: []
      }
    };

    const response = await apiClient.httpClient.request('/api/agents/campaign', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    if (!response.success) {
      throw new Error(`Campaign agent failed: ${response.error}`);
    }
    
    return response.data;
  };

  const formatAgentResponse = (agentResponse: any, queryType: string) => {
    if (!agentResponse.success) {
      throw new Error(agentResponse.error || 'AI agent returned an error');
    }
    
    const responseData = agentResponse.data;
    
    if (queryType === 'daily_focus') {
      return responseData.focus_summary || responseData.explanation || 'Based on your current campaigns and performance data, here\'s what deserves your attention today.';
    }
    
    return responseData.explanation || responseData.focus_summary || 'Here are insights based on your marketing data.';
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    const actionId = behaviorTracker.trackFeatureStart('chat');
    setIsTyping(true);

    try {
      const campaignsResponse = await apiClient.getCampaigns();
      
      if (!campaignsResponse.success) {
        throw new Error('Failed to fetch campaign data');
      }
      
      const campaignData = Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [];
      
      const queryType = determineQueryType(chatMessage);
      let agentResponse;
      
      if (queryType === 'daily_focus') {
        agentResponse = await callDailyFocusAgent(chatMessage, campaignData);
      } else {
        agentResponse = await callGeneralCampaignAgent(chatMessage, campaignData);
      }
      
      const formattedResponse = formatAgentResponse(agentResponse, queryType);
      
      const newChat = {
        id: Date.now().toString(),
        message: chatMessage,
        response: formattedResponse,
        timestamp: new Date(),
      };

      const updatedHistory = [...chatHistory, newChat];
      setChatHistory(updatedHistory);
      setChatMessage('');
      behaviorTracker.trackFeatureComplete('chat', actionId, true);
      
      if (onChatUpdate) {
        onChatUpdate(updatedHistory);
      }
      
      toast({
        title: "AI Response Generated",
        description: "Your marketing assistant has analyzed your request.",
      });
    } catch (error) {
      console.error('Chat processing failed:', error);
      behaviorTracker.trackFeatureComplete('chat', actionId, false);
      
      const errorResponse = error instanceof Error ? error.message : 'I\'m having trouble processing your request right now. Please try again in a moment.';
      
      const newChat = {
        id: Date.now().toString(),
        message: chatMessage,
        response: errorResponse,
        timestamp: new Date(),
      };
      
      const updatedHistory = [...chatHistory, newChat];
      setChatHistory(updatedHistory);
      setChatMessage('');
      
      if (onChatUpdate) {
        onChatUpdate(updatedHistory);
      }
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  return {
    chatMessage,
    setChatMessage,
    chatHistory,
    isTyping,
    handleChatSubmit,
    user
  };
};
