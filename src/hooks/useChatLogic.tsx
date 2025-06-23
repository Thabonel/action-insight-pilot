
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export const useChatLogic = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const { toast } = useToast();

  const sendMessage = async (message: string, agentType: string) => {
    setLoading(true);
    try {
      const result = await apiClient.queryAgent(message) as ApiResponse<any>;
      
      if (result.success) {
        toast({
          title: "Message Sent",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
      } else {
        const responseData = result.data || { message: 'No response received' };
        setMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: responseData.message || 'Response received' }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendCampaignMessage = async (message: string, campaigns: any[]) => {
    setLoading(true);
    try {
      const result = await apiClient.callGeneralCampaignAgent(message, campaigns) as ApiResponse<any>;
      
      if (result.success) {
        toast({
          title: "Message Sent",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
      } else {
        const responseData = result.data || { message: 'No response received' };
        setMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: responseData.message || 'Response received' }
        ]);
      }
    } catch (error) {
      console.error('Campaign chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send campaign message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const processQuery = async (query: string, context?: any) => {
    setLoading(true);
    try {
      const result = await apiClient.queryAgent(query, context) as ApiResponse<any>;
      
      if (result.success) {
        return {
          success: true,
          data: result.data || { message: 'Query processed successfully' }
        };
      } else {
        return {
          success: false,
          error: result.data?.message || 'Failed to process query'
        };
      }
    } catch (error) {
      console.error('Query processing error:', error);
      return {
        success: false,
        error: 'Failed to process query'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    messages,
    sendMessage,
    sendCampaignMessage,
    processQuery,
    setMessages
  };
};
