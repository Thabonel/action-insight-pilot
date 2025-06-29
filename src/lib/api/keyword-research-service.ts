import { HttpClient } from '../http-client';
import { ApiResponse } from './api-client-interface';

export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  serp_features: string[];
  trend_data: Array<{
    month: string;
    volume: number;
    competition?: number;
  }>;
}

export interface KeywordResearchRequest {
  seed_keywords: string[];
  location?: string;
  industry?: string;
}

export interface CompetitorKeywordsRequest {
  competitor_domain: string;
}

export interface TrendingKeywordsRequest {
  industry?: string;
}

export interface KeywordResearchResponse {
  research_id?: string;
  keywords: KeywordMetrics[];
  total_keywords: number;
  query?: string;
  competitor_domain?: string;
  industry?: string;
}

export interface KeywordHistoryItem {
  id: string;
  query: string;
  keywords: KeywordMetrics[];
  created_at: string;
  updated_at: string;
}

export class KeywordResearchService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient('/api/keywords');
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  async researchKeywords(payload: KeywordResearchRequest): Promise<ApiResponse<KeywordResearchResponse>> {
    try {
      const response = await this.httpClient.request<ApiResponse<KeywordResearchResponse>>(
        '/research',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      return response;
    } catch (error) {
      console.error('Error researching keywords:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to research keywords'
      };
    }
  }

  async getCompetitorKeywords(payload: CompetitorKeywordsRequest): Promise<ApiResponse<KeywordResearchResponse>> {
    try {
      const response = await this.httpClient.request<ApiResponse<KeywordResearchResponse>>(
        '/competitor',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      return response;
    } catch (error) {
      console.error('Error getting competitor keywords:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get competitor keywords'
      };
    }
  }

  async getTrendingKeywords(payload: TrendingKeywordsRequest): Promise<ApiResponse<KeywordResearchResponse>> {
    try {
      const response = await this.httpClient.request<ApiResponse<KeywordResearchResponse>>(
        '/trending',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      return response;
    } catch (error) {
      console.error('Error getting trending keywords:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get trending keywords'
      };
    }
  }

  async getKeywordHistory(): Promise<ApiResponse<KeywordHistoryItem[]>> {
    try {
      const response = await this.httpClient.request<ApiResponse<KeywordHistoryItem[]>>(
        '/history',
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Error getting keyword history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get keyword history'
      };
    }
  }

  async getKeywordResearchDetail(researchId: string): Promise<ApiResponse<KeywordHistoryItem>> {
    try {
      const response = await this.httpClient.request<ApiResponse<KeywordHistoryItem>>(
        `/history/${researchId}`,
        {
          method: 'GET',
        }
      );
      return response;
    } catch (error) {
      console.error('Error getting keyword research detail:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get keyword research detail'
      };
    }
  }
}