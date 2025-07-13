
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';
import { supabase } from '@/integrations/supabase/client';

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
  createdAt: Date;
  messages: ChatMessage[];
}

export const useEnhancedChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState('');
  const { toast } = useToast();

  const [userId, setUserId] = useState<string | null>(null);
  const user = userId ? { id: userId } : null;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      if (user) {
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) {
          setSessions(data.map(rec => ({
            id: rec.id,
            createdAt: new Date(rec.created_at),
            messages: []
          })));
        }
      }
    })();
  }, []);

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

    if (currentSession?.id) {
      await supabase.functions.invoke('chat-memory', {
        body: { conversationId: currentSession.id, role: 'user', content }
      });
    }

    try {
      const result = await apiClient.queryAgent(content, { ...(context || {}), conversationId: currentSession?.id }) as ApiResponse<any>;
      
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
        if (currentSession?.id) {
          await supabase.functions.invoke('chat-memory', {
            body: { conversationId: currentSession.id, role: 'assistant', content: assistantMessage.content }
          });
        }
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

  const createNewSession = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error || !data) {
      toast({ title: 'Error', description: 'Failed to create session', variant: 'destructive' });
      return;
    }

    const newSession: ChatSession = {
      id: data.id,
      createdAt: new Date(data.created_at),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setMessages([]);
  }, [sessions.length, userId, toast]);

  const switchSession = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      const { data, error } = await supabase.functions.invoke('chat-memory', {
        body: { conversationId: sessionId }
      });
      if (!error && data?.messages) {
        const msgs = (data.messages as any[]).map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp)
        })).reverse();
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    }
  }, [sessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    await supabase.from('conversations').delete().eq('id', sessionId);
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
