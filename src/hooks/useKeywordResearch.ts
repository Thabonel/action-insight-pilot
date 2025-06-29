import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KeywordResearchService, KeywordResearchRequest, CompetitorKeywordsRequest, TrendingKeywordsRequest, KeywordResearchResponse, KeywordHistoryItem } from '@/lib/api/keyword-research-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const keywordResearchService = new KeywordResearchService();

export const useKeywordResearch = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Set token when session changes
  if (session?.access_token) {
    keywordResearchService.setToken(session.access_token);
  }

  // Get keyword research history
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
    refetch: refetchHistory
  } = useQuery({
    queryKey: ['keyword-history'],
    queryFn: async () => {
      const response = await keywordResearchService.getKeywordHistory();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch keyword history');
      }
      return response.data || [];
    },
    enabled: !!session?.access_token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Research keywords mutation
  const researchKeywordsMutation = useMutation({
    mutationFn: async (payload: KeywordResearchRequest) => {
      setIsLoading(true);
      const response = await keywordResearchService.researchKeywords(payload);
      if (!response.success) {
        throw new Error(response.error || 'Failed to research keywords');
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Successfully researched ${data?.total_keywords || 0} keywords`);
      queryClient.invalidateQueries({ queryKey: ['keyword-history'] });
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to research keywords');
      setIsLoading(false);
    },
  });

  // Competitor keywords mutation
  const competitorKeywordsMutation = useMutation({
    mutationFn: async (payload: CompetitorKeywordsRequest) => {
      setIsLoading(true);
      const response = await keywordResearchService.getCompetitorKeywords(payload);
      if (!response.success) {
        throw new Error(response.error || 'Failed to get competitor keywords');
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data?.total_keywords || 0} competitor keywords`);
      queryClient.invalidateQueries({ queryKey: ['keyword-history'] });
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to get competitor keywords');
      setIsLoading(false);
    },
  });

  // Trending keywords mutation
  const trendingKeywordsMutation = useMutation({
    mutationFn: async (payload: TrendingKeywordsRequest) => {
      setIsLoading(true);
      const response = await keywordResearchService.getTrendingKeywords(payload);
      if (!response.success) {
        throw new Error(response.error || 'Failed to get trending keywords');
      }
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Found ${data?.total_keywords || 0} trending keywords`);
      queryClient.invalidateQueries({ queryKey: ['keyword-history'] });
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to get trending keywords');
      setIsLoading(false);
    },
  });

  // Get specific keyword research detail
  const getKeywordDetail = useCallback(async (researchId: string): Promise<KeywordHistoryItem | null> => {
    try {
      const response = await keywordResearchService.getKeywordResearchDetail(researchId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to get keyword research detail');
      }
      return response.data || null;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to get keyword research detail');
      return null;
    }
  }, []);

  return {
    // Data
    history: historyData || [],
    
    // Loading states
    isLoading: isLoading || researchKeywordsMutation.isPending || competitorKeywordsMutation.isPending || trendingKeywordsMutation.isPending,
    historyLoading,
    
    // Errors
    historyError,
    
    // Actions
    researchKeywords: researchKeywordsMutation.mutate,
    getCompetitorKeywords: competitorKeywordsMutation.mutate,
    getTrendingKeywords: trendingKeywordsMutation.mutate,
    getKeywordDetail,
    refetchHistory,
    
    // Results
    lastResearchResult: researchKeywordsMutation.data,
    lastCompetitorResult: competitorKeywordsMutation.data,
    lastTrendingResult: trendingKeywordsMutation.data,
    
    // Reset functions
    resetResults: useCallback(() => {
      researchKeywordsMutation.reset();
      competitorKeywordsMutation.reset();
      trendingKeywordsMutation.reset();
    }, [researchKeywordsMutation, competitorKeywordsMutation, trendingKeywordsMutation]),
  };
};