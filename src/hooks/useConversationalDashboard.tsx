import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationalData {
  campaigns: any[];
  leads: any[];
  insights: any[];
  metrics: any;
}

interface ChatMessage {
  id: string;
  query: string;
  response: any;
  timestamp: Date;
}

export const useConversationalDashboard = () => {
  const [data, setData] = useState<ConversationalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all necessary data for the conversational dashboard
      const [campaignsResult, leadsResult, analyticsResult] = await Promise.all([
        apiClient.getCampaigns(),
        apiClient.getLeads(),
        apiClient.getAnalytics()
      ]);

      setData({
        campaigns: campaignsResult.success ? campaignsResult.data || [] : [],
        leads: leadsResult.success ? leadsResult.data || [] : [],
        insights: analyticsResult.success ? analyticsResult.data?.insights || [] : [],
        metrics: analyticsResult.success ? analyticsResult.data?.metrics || {} : {}
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const response = await apiClient.queryAgent(query);
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        query,
        response: response.data,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, newMessage]);
      setQuery('');
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    query,
    setQuery,
    chatHistory,
    isProcessing,
    insights: data?.insights || [],
    user,
    handleQuerySubmit,
    handleSuggestionClick
  };
};
