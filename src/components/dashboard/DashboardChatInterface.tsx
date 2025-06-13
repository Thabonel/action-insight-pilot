
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
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

interface DashboardChatInterfaceProps {
  onChatUpdate?: (chatHistory: ChatMessage[]) => void;
}

const DashboardChatInterface: React.FC<DashboardChatInterfaceProps> = ({ onChatUpdate }) => {
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

      const updatedHistory = [newChat, ...chatHistory];
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
      
      const updatedHistory = [newChat, ...chatHistory];
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

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-slate-900">AI Marketing Assistant</h3>
        <p className="text-sm text-slate-600">Ask me anything about your marketing automation</p>
      </div>
      
      <div className="p-6">
        <div className="h-80 overflow-y-auto mb-4 space-y-4">
          {!user && (
            <div className="text-center py-8 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="w-16 h-16 bg-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-amber-800 mb-2">Authentication Required</h3>
              <p className="text-amber-700">Please log in to start chatting with your AI marketing assistant</p>
            </div>
          )}

          {chatHistory.length === 0 && !isTyping && user && (
            <div className="text-center text-slate-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Start a conversation with your AI assistant</p>
              <p className="text-sm mt-2">Try asking: "What should I focus on today?"</p>
            </div>
          )}
          
          {isTyping && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AI</span>
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
                  {chat.message}
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">AI</span>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                  {chat.response}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleChatSubmit} className="flex space-x-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder={user ? "Ask your AI assistant..." : "Please log in to chat..."}
            disabled={!user}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!chatMessage.trim() || isTyping || !user}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardChatInterface;
