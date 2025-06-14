
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { useServerStatus } from '@/hooks/useServerStatus';
import { useQueryProcessor } from '@/hooks/useQueryProcessor';

interface ChatMessage {
  id: string;
  query: string;
  response: any;
  timestamp: Date;
}

export const useConversationalDashboard = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState(behaviorTracker.getInsights());
  const [conversationContext, setConversationContext] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    serverStatus,
    serverError,
    wakeUpServer,
    setServerSleeping,
    setServerError
  } = useServerStatus();
  
  const { processQueryWithRealAI } = useQueryProcessor();

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'conversational_dashboard', { section: 'main' });
    
    const interval = setInterval(() => {
      setInsights(behaviorTracker.getInsights());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    const actionId = behaviorTracker.trackFeatureStart('conversational_query');
    setIsProcessing(true);

    try {
      if (serverStatus === 'sleeping') {
        console.log('Server is sleeping, waking it up first...');
        
        toast({
          title: "Preparing AI Assistant",
          description: "Waking up the backend server, this may take up to 60 seconds...",
        });

        await wakeUpServer();
        
        toast({
          title: "AI Assistant Ready",
          description: "Now processing your request...",
        });
      }

      const response = await processQueryWithRealAI(query, conversationContext, setServerSleeping);
      
      const newChat = {
        id: Date.now().toString(),
        query,
        response,
        timestamp: new Date(),
      };

      setChatHistory(prev => [...prev, newChat]);
      
      setConversationContext(prev => [...prev, 
        { role: 'user', content: query },
        { role: 'assistant', content: response }
      ].slice(-10));
      
      setQuery('');
      behaviorTracker.trackFeatureComplete('conversational_query', actionId, true);
      
      toast({
        title: "AI Response Generated",
        description: "Your marketing assistant has analyzed your request.",
      });
    } catch (error) {
      console.error('Query processing failed:', error);
      setServerError(error instanceof Error ? error.message : 'Unknown error');
      behaviorTracker.trackFeatureComplete('conversational_query', actionId, false);
      
      const errorResponse = {
        type: 'error',
        title: 'AI Assistant Temporarily Unavailable',
        explanation: error instanceof Error ? error.message : 'I\'m having trouble processing your request right now. Please try again in a moment.',
        businessImpact: 'Your marketing data is safe and campaigns are still running.',
        nextActions: ['Try rephrasing your question', 'Check back in a few minutes', 'Contact support if issue persists']
      };
      
      const newChat = {
        id: Date.now().toString(),
        query,
        response: errorResponse,
        timestamp: new Date(),
      };
      
      setChatHistory(prev => [...prev, newChat]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return {
    query,
    setQuery,
    chatHistory,
    isProcessing,
    insights,
    serverStatus,
    serverError,
    user,
    handleQuerySubmit,
    handleSuggestionClick,
    wakeUpServer
  };
};
