
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
  query?: string;
  agentType?: string;
  response?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export const useEnhancedChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  // Mock user - in a real app this would come from auth
  const user = { id: 'user-1', name: 'User' };

  const sendMessage = useCallback(async (content: string, context?: any) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      query: content
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const result = await apiClient.queryAgent(content, context) as ApiResponse<any>;
      
      if (result.success && result.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.message || 'Response received',
          timestamp: new Date(),
          metadata: result.data,
          response: result.data.message || 'Response received'
        };

        setMessages(prev => [...prev, assistantMessage]);
        return assistantMessage;
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message.',
        timestamp: new Date(),
        response: 'Sorry, I encountered an error processing your message.'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      return errorMessage;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleQuerySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsProcessing(true);
    await sendMessage(query);
    setQuery('');
    setIsProcessing(false);
  }, [query, sendMessage]);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date()
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
    setMessages([]);
  }, [sessions.length]);

  const switchSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages);
    }
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  }, [currentSession]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    clearMessages,
    sessions,
    currentSession,
    isProcessing,
    query,
    setQuery,
    handleQuerySubmit,
    createNewSession,
    switchSession,
    deleteSession,
    user
  };
};
