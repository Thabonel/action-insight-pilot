import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatHistoryService, ChatSession, ChatMessage } from '@/lib/services/chat-history-service';
import { ChatAgentRouter } from '@/lib/services/chat-agent-router';
import { useToast } from '@/hooks/use-toast';

interface EnhancedChatMessage {
  id: string;
  query: string;
  response: any;
  timestamp: Date;
  agentType?: string;
}

export const useEnhancedChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState('');

  // Load user sessions on mount
  useEffect(() => {
    if (user) {
      loadUserSessions();
    }
  }, [user]);

  // Load messages when session changes
  useEffect(() => {
    if (currentSession) {
      loadSessionMessages(currentSession.id);
    }
  }, [currentSession]);

  const loadUserSessions = async () => {
    if (!user) return;
    
    try {
      const userSessions = await ChatHistoryService.getUserSessions(user.id);
      setSessions(userSessions);
      
      // Auto-select the most recent session or create a new one
      if (userSessions.length > 0) {
        setCurrentSession(userSessions[0]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat sessions',
        variant: 'destructive',
      });
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    try {
      const sessionMessages = await ChatHistoryService.getSessionMessages(sessionId);
      const formattedMessages: EnhancedChatMessage[] = sessionMessages.map(msg => ({
        id: msg.id,
        query: msg.user_message,
        response: msg.ai_response,
        timestamp: new Date(msg.timestamp),
        agentType: msg.agent_type
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat messages',
        variant: 'destructive',
      });
    }
  };

  const createNewSession = async (title?: string) => {
    if (!user) return null;

    try {
      const sessionTitle = title || `Chat ${new Date().toLocaleDateString()}`;
      const newSession = await ChatHistoryService.createSession(user.id, sessionTitle);
      
      if (newSession) {
        setSessions(prev => [newSession, ...prev]);
        setCurrentSession(newSession);
        setMessages([]);
        return newSession;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat session',
        variant: 'destructive',
      });
    }
    return null;
  };

  const switchSession = (session: ChatSession) => {
    setCurrentSession(session);
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !user || isProcessing) return;

    setIsProcessing(true);
    const userQuery = query;
    setQuery('');

    try {
      // If no current session, create one
      let session = currentSession;
      if (!session) {
        session = await createNewSession();
        if (!session) {
          throw new Error('Failed to create session');
        }
      }

      // Route the query to appropriate agent
      const response = await ChatAgentRouter.routeQuery(userQuery, user.id, messages.slice(-5));
      
      // Save message to database
      const savedMessage = await ChatHistoryService.addMessage(
        session.id,
        userQuery,
        response,
        response.agentType
      );

      if (savedMessage) {
        // Add to local state
        const newMessage: EnhancedChatMessage = {
          id: savedMessage.id,
          query: userQuery,
          response,
          timestamp: new Date(savedMessage.timestamp),
          agentType: savedMessage.agent_type
        };
        setMessages(prev => [...prev, newMessage]);

        // Update session title if it's the first message
        if (messages.length === 0) {
          const shortTitle = userQuery.length > 50 ? 
            userQuery.substring(0, 47) + '...' : userQuery;
          await ChatHistoryService.updateSessionTitle(session.id, shortTitle);
          
          // Update local session title
          setSessions(prev => 
            prev.map(s => s.id === session.id ? { ...s, title: shortTitle } : s)
          );
          setCurrentSession(prev => prev ? { ...prev, title: shortTitle } : null);
        }

        // Show success toast for successful responses
        if (response.type !== 'error') {
          toast({
            title: "AI Response Generated",
            description: "Your marketing assistant has analyzed your request.",
          });
        }
      }
    } catch (error) {
      console.error('Error processing query:', error);
      
      const errorResponse = {
        type: 'error',
        title: 'AI Assistant Temporarily Unavailable',
        explanation: error instanceof Error ? error.message : 'I\'m having trouble processing your request right now. Please try again in a moment.',
        businessImpact: 'Your marketing data is safe and campaigns are still running.',
        nextActions: ['Try rephrasing your question', 'Check back in a few minutes', 'Contact support if issue persists']
      };
      
      const newMessage: EnhancedChatMessage = {
        id: Date.now().toString(),
        query: userQuery,
        response: errorResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const success = await ChatHistoryService.deleteSession(sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (currentSession?.id === sessionId) {
          const remainingSessions = sessions.filter(s => s.id !== sessionId);
          if (remainingSessions.length > 0) {
            setCurrentSession(remainingSessions[0]);
          } else {
            setCurrentSession(null);
            setMessages([]);
          }
        }
        toast({
          title: 'Success',
          description: 'Chat session deleted',
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete chat session',
        variant: 'destructive',
      });
    }
  };

  return {
    sessions,
    currentSession,
    messages,
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
