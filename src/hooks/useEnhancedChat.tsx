import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  thinking?: boolean;
  query?: string;
  agentType?: string;
  response?: any;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  messages: Message[];
}

export const useEnhancedChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      created_at: new Date(),
      updated_at: new Date(),
      messages: []
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setMessages([]);
  };

  const switchSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      query: text.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsProcessing(true);

    try {
      const result = await apiClient.queryAgent(text.trim());
      
      if (result.success && result.data) {
        const aiResponse = result.data.response || result.data.message || 'I received your message but could not generate a response.';
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
          response: result.data
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error || 'Failed to get AI response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      sendMessage(query);
      setQuery('');
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    sessions,
    currentSession,
    isLoading,
    isProcessing,
    input,
    query,
    setInput,
    setQuery,
    sendMessage,
    handleQuerySubmit,
    createNewSession,
    switchSession,
    deleteSession,
    clearChat,
    messagesEndRef,
    user
  };
};
