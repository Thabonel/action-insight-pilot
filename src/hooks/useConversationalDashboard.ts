
import { useState, useEffect } from 'react';
import { conversationalService } from '@/lib/services/conversational-service';

interface DashboardInsights {
  totalActions: number;
  recentActivities: Array<{
    type: string;
    message: string;
    timestamp: Date;
  }>;
  suggestions: string[];
  trends: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useConversationalDashboard = () => {
  const [insights, setInsights] = useState<DashboardInsights>({
    totalActions: 0,
    recentActivities: [],
    suggestions: [],
    trends: { positive: 0, negative: 0, neutral: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const user = { id: 'user-1', name: 'User' };

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const result = await conversationalService.getDashboardInsights('user-1');
      if (result.success && result.data) {
        setInsights(result.data);
      }
    } catch (err) {
      setError('Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (question: string) => {
    setIsProcessing(true);
    try {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, userMessage]);

      const result = await conversationalService.generateResponse(question);
      
      if (result.success && result.data) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.data.message,
          timestamp: new Date()
        };
        
        setChatHistory(prev => [...prev, assistantMessage]);
        return result.data;
      }
    } catch (err) {
      setError('Failed to process question');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    await askQuestion(query);
    setQuery('');
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    await askQuestion(suggestion);
    setQuery('');
  };

  const refetch = async () => {
    await fetchInsights();
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    query,
    setQuery,
    chatHistory,
    isProcessing,
    user,
    askQuestion,
    handleQuerySubmit,
    handleSuggestionClick,
    refetch
  };
};
