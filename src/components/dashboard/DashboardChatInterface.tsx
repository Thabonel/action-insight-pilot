
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useChatPersistence } from '@/hooks/useChatPersistence';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import ChatHistory from './ChatHistory';
import ChatInput, { ChatInputHandle } from './ChatInput';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, History, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

interface DashboardChatInterfaceProps {
  onChatUpdate?: (chatHistory: ChatMessage[]) => void;
  campaignId?: string;
}

const DashboardChatInterface: React.FC<DashboardChatInterfaceProps> = ({ onChatUpdate, campaignId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasCampaigns, setHasCampaigns] = useState(false);
  const [hasAutopilot, setHasAutopilot] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  const {
    sessions,
    currentSession,
    messages: persistedMessages,
    isLoading,
    createSession,
    loadSession,
    addMessage,
    deleteSession
  } = useChatPersistence({
    autoLoadLatestSession: true
  });

  // Fetch user context for contextual suggestions
  useEffect(() => {
    const fetchUserContext = async () => {
      if (!user) return;

      try {
        // Check if user has campaigns
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id')
          .eq('created_by', user.id)
          .limit(1);

        setHasCampaigns((campaigns?.length ?? 0) > 0);

        // Check if user has autopilot enabled
        const { data: autopilotConfig } = await supabase
          .from('marketing_autopilot_config')
          .select('is_active')
          .eq('user_id', user.id)
          .maybeSingle();

        setHasAutopilot(autopilotConfig?.is_active ?? false);
      } catch (error) {
        logger.error('Failed to fetch user context', { error, userId: user?.id });
      }
    };

    fetchUserContext();
  }, [user]);

  // Convert persisted messages to the format expected by ChatHistory
  const chatHistory: ChatMessage[] = useMemo(() => {
    return persistedMessages.map(msg => ({
      id: msg.id,
      message: msg.user_message,
      response: msg.ai_response?.response || '',
      timestamp: new Date(msg.timestamp)
    }));
  }, [persistedMessages]);

  // Notify parent of chat updates
  useEffect(() => {
    onChatUpdate?.(chatHistory);
  }, [chatHistory, onChatUpdate]);

  // Scroll to bottom when new messages arrive or when typing starts
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory.length, isTyping]);

  // Handle clicking a suggestion button
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setChatMessage(suggestion);
    // Focus the input so user can just press Enter
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 50);
  }, []);

  const handleChatSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setIsTyping(true);
    const messageToSend = chatMessage;
    setChatMessage('');

    try {
      // Create session if none exists
      let session = currentSession;
      if (!session) {
        session = await createSession();
        if (!session) {
          throw new Error('Failed to create chat session');
        }
      }

      // Call the API with session context for conversation continuity
      // Include campaignId if available to load campaign-specific knowledge
      const result = await apiClient.queryAgent(messageToSend, {
        conversationId: session.id,
        campaignId: campaignId
      }) as ApiResponse<{ message: string; conversationId?: string; campaignCreated?: boolean; campaignId?: string }>;

      // Handle campaign creation notification
      if (result.success && result.data?.campaignCreated && result.data?.campaignId) {
        toast({
          title: "Campaign Created",
          description: "Your campaign has been created and launched successfully!",
        });
      }

      if (result.success) {
        const responseData = result.data || { message: 'No response received' };

        // Save to database
        await addMessage(
          messageToSend,
          { response: responseData.message },
          'general'
        );
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Chat message failed', { error, sessionId: currentSession?.id, campaignId });
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  }, [chatMessage, currentSession, createSession, addMessage, toast, campaignId]);

  const handleNewConversation = async () => {
    await createSession();
    toast({
      title: "New Conversation",
      description: "Started a new chat session",
    });
  };

  const handleLoadSession = async (sessionId: string) => {
    await loadSession(sessionId);
    setShowHistory(false);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await deleteSession(sessionId);
    if (success) {
      toast({
        title: "Deleted",
        description: "Chat session deleted",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white dark:bg-[#151A21] border-b border-gray-200 dark:border-[#273140] px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-[#E9EEF5]">
              {currentSession?.title || 'New Conversation'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-[#94A3B8]">
              Ask me anything about your marketing automation
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="gap-1"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewConversation}
              className="gap-1"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat history sidebar */}
        {showHistory && (
          <div className="w-64 border-r border-gray-200 dark:border-[#273140] bg-white dark:bg-[#151A21] flex-shrink-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                <h4 className="text-sm font-medium text-slate-700 dark:text-[#94A3B8] mb-3">
                  Past Conversations
                </h4>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                ) : (
                  sessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => handleLoadSession(session.id)}
                      className={`p-3 rounded-lg cursor-pointer group transition-colors ${
                        currentSession?.id === session.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-gray-100 dark:hover:bg-[#1E2632]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate flex-1">
                          {session.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(session.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0B0D10]"
          >
            <ChatHistory
              chatHistory={chatHistory}
              isTyping={isTyping}
              currentMessage={chatMessage}
              user={user}
              onSuggestionClick={handleSuggestionClick}
              hasCampaigns={hasCampaigns}
              hasAutopilot={hasAutopilot}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-[#273140] bg-white dark:bg-[#151A21] p-4 flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                ref={chatInputRef}
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
                onSubmit={handleChatSubmit}
                user={user}
                isTyping={isTyping}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardChatInterface;
