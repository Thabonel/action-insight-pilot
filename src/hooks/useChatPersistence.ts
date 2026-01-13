
import { useState, useEffect, useCallback } from 'react';
import { ChatHistoryService, ChatSession, ChatMessage, AgentResponseData } from '@/lib/services/chat-history-service';
import { useAuth } from '@/contexts/AuthContext';

export interface UseChatPersistenceOptions {
  autoLoadLatestSession?: boolean;
  onSessionLoaded?: (session: ChatSession, messages: ChatMessage[]) => void;
}

export interface UseChatPersistenceReturn {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  createSession: (title?: string) => Promise<ChatSession | null>;
  loadSession: (sessionId: string) => Promise<void>;
  addMessage: (userMessage: string, aiResponse: AgentResponseData, agentType?: string) => Promise<ChatMessage | null>;
  updateSessionTitle: (title: string) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  refreshSessions: () => Promise<void>;
  clearCurrentSession: () => void;
}

export function useChatPersistence(options: UseChatPersistenceOptions = {}): UseChatPersistenceReturn {
  const { autoLoadLatestSession = false, onSessionLoaded } = options;
  const { user } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const userSessions = await ChatHistoryService.getUserSessions(user.id);
      setSessions(userSessions);
    } catch (err) {
      console.error('Failed to refresh sessions:', err);
      setError('Failed to load chat sessions');
    }
  }, [user?.id]);

  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const sessionMessages = await ChatHistoryService.getSessionMessages(sessionId);
      const session = sessions.find(s => s.id === sessionId);

      if (session) {
        setCurrentSession(session);
        setMessages(sessionMessages);
        onSessionLoaded?.(session, sessionMessages);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load chat messages');
    } finally {
      setIsLoading(false);
    }
  }, [sessions, onSessionLoaded]);

  const createSession = useCallback(async (title?: string): Promise<ChatSession | null> => {
    if (!user?.id) return null;

    setIsLoading(true);
    setError(null);

    try {
      const session = await ChatHistoryService.createSession(
        user.id,
        title || 'New Conversation'
      );

      if (session) {
        setCurrentSession(session);
        setMessages([]);
        setSessions(prev => [session, ...prev]);
      }

      return session;
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create chat session');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const addMessage = useCallback(async (
    userMessage: string,
    aiResponse: AgentResponseData,
    agentType?: string
  ): Promise<ChatMessage | null> => {
    if (!currentSession) {
      console.error('No active session for adding message');
      return null;
    }

    try {
      const message = await ChatHistoryService.addMessage(
        currentSession.id,
        userMessage,
        aiResponse,
        agentType
      );

      if (message) {
        setMessages(prev => [...prev, message]);
      }

      return message;
    } catch (err) {
      console.error('Failed to add message:', err);
      setError('Failed to save message');
      return null;
    }
  }, [currentSession]);

  const updateSessionTitle = useCallback(async (title: string): Promise<boolean> => {
    if (!currentSession) return false;

    try {
      const success = await ChatHistoryService.updateSessionTitle(currentSession.id, title);

      if (success) {
        setCurrentSession(prev => prev ? { ...prev, title } : null);
        setSessions(prev => prev.map(s =>
          s.id === currentSession.id ? { ...s, title } : s
        ));
      }

      return success;
    } catch (err) {
      console.error('Failed to update session title:', err);
      return false;
    }
  }, [currentSession]);

  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const success = await ChatHistoryService.deleteSession(sessionId);

      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));

        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
      }

      return success;
    } catch (err) {
      console.error('Failed to delete session:', err);
      return false;
    }
  }, [currentSession]);

  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
    setMessages([]);
  }, []);

  // Load sessions on mount
  useEffect(() => {
    if (user?.id) {
      refreshSessions();
    }
  }, [user?.id, refreshSessions]);

  // Auto-load latest session if requested
  useEffect(() => {
    if (autoLoadLatestSession && sessions.length > 0 && !currentSession) {
      loadSession(sessions[0].id);
    }
  }, [autoLoadLatestSession, sessions, currentSession, loadSession]);

  return {
    sessions,
    currentSession,
    messages,
    isLoading,
    error,
    createSession,
    loadSession,
    addMessage,
    updateSessionTitle,
    deleteSession,
    refreshSessions,
    clearCurrentSession
  };
}
