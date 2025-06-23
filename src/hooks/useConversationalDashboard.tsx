
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

interface DashboardInsights {
  insights: string[];
  metrics: {
    totalViews: number;
    engagement: number;
    conversions: number;
  };
  suggestions: string[];
}

export const useConversationalDashboard = () => {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.getBlogAnalytics() as ApiResponse<any>;
      
      if (result.success && result.data) {
        const mockInsights: DashboardInsights = {
          insights: ['Performance trending upward', 'Engagement rate improved by 15%'],
          metrics: {
            totalViews: result.data.views || 0,
            engagement: result.data.engagement || 0,
            conversions: result.data.leads || 0
          },
          suggestions: ['Consider posting at peak hours', 'Focus on video content']
        };
        setInsights(mockInsights);
      } else {
        setError('Failed to fetch insights');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (question: string) => {
    try {
      setLoading(true);
      const result = await apiClient.queryAgent(question) as ApiResponse<any>;
      
      if (result.success) {
        return result.data?.message || 'Question processed successfully';
      } else {
        throw new Error('Failed to process question');
      }
    } catch (error) {
      console.error('Question processing error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    askQuestion,
    refetch: fetchInsights
  };
};
