
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

export const useChatLogic = ({ onChatUpdate }: { onChatUpdate?: (chatHistory: ChatMessage[]) => void } = {}) => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock user - in a real app this would come from auth
  const user = { id: 'user-1', name: 'User' };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setIsTyping(true);
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message: chatMessage,
      response: '',
      timestamp: new Date()
    };

    try {
      const result = await apiClient.queryAgent(chatMessage, { conversationId }) as ApiResponse<{ message: string; conversationId?: string; campaignCreated?: boolean }>;

      if (result.success) {
        const responseData = result.data || { message: 'No response received' };

        // Store conversation ID if returned
        if (responseData.conversationId) {
          setConversationId(responseData.conversationId);
        }

        const updatedMessage = {
          ...newMessage,
          response: responseData.message || 'Response received'
        };

        const updatedHistory = [...chatHistory, updatedMessage];
        setChatHistory(updatedHistory);
        onChatUpdate?.(updatedHistory);

        setMessages(prev => [
          ...prev,
          { role: 'user', content: chatMessage },
          { role: 'assistant', content: updatedMessage.response }
        ]);

        // Show success toast if campaign was created
        if (responseData.campaignCreated) {
          toast({
            title: "Campaign Created!",
            description: "Your campaign has been created and launched successfully. Check your Autopilot Dashboard for results.",
            duration: 5000,
          });

          // Reset conversation after campaign creation
          setConversationId(null);
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
      setChatMessage('');
    }
  };

  const sendMessage = async (message: string, agentType: string) => {
    setLoading(true);
    try {
      const result = await apiClient.queryAgent(message) as ApiResponse<{ message: string }>;
      
      if (result.success) {
        const responseData = result.data || { message: 'No response received' };
        setMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: responseData.message || 'Response received' }
        ]);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
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

  const sendCampaignMessage = async (message: string, campaigns: Record<string, unknown>[]) => {
    setLoading(true);
    try {
      const result = await apiClient.callGeneralCampaignAgent(message, campaigns) as ApiResponse<{ message: string }>;
      
      if (result.success) {
        const responseData = result.data || { message: 'No response received' };
        setMessages(prev => [
          ...prev,
          { role: 'user', content: message },
          { role: 'assistant', content: responseData.message || 'Response received' }
        ]);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
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

  const processQuery = async (query: string, context?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const result = await apiClient.queryAgent(query, context) as ApiResponse<{ message: string }>;
      
      if (result.success) {
        return {
          success: true,
          data: result.data || { message: 'Query processed successfully' }
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to process query'
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
    chatMessage,
    setChatMessage,
    chatHistory,
    isTyping,
    handleChatSubmit,
    user,
    sendMessage,
    sendCampaignMessage,
    processQuery,
    setMessages
  };
};
