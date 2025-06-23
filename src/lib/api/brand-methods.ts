
import { BaseApiClient } from './base-api-client';
import { ApiResponse } from '../api-client-interface';

export interface BrandVoiceAnalysis {
  score: number;
  consistency: number;
  tone_alignment: number;
  vocabulary_issues: string[];
  style_compliance: {
    sentence_length: number;
    complexity: number;
    formality: number;
  };
  suggestions: string[];
  brand_terms: string[];
  flagged_phrases: string[];
}

export interface BrandDocument {
  id: string;
  name: string;
  content: string;
  voice_profile: {
    tone: string;
    personality: string[];
    vocabulary: string[];
    style_guidelines: any;
  };
}

export class BrandMethods extends BaseApiClient {
  async analyzeBrandVoice(content: string, brandId?: string): Promise<ApiResponse<BrandVoiceAnalysis>> {
    return this.httpClient.request('/api/brand/voice-analysis', {
      method: 'POST',
      body: JSON.stringify({ content, brandId }),
    });
  }

  async getBrandDocuments(): Promise<ApiResponse<BrandDocument[]>> {
    return this.httpClient.request('/api/brand/documents');
  }

  async getBrandTerminology(brandId?: string): Promise<ApiResponse<{ terms: string[], phrases: string[] }>> {
    return this.httpClient.request('/api/brand/terminology', {
      method: 'GET',
    });
  }

  async suggestBrandAlternatives(text: string, brandId?: string): Promise<ApiResponse<{ alternatives: string[] }>> {
    return this.httpClient.request('/api/brand/alternatives', {
      method: 'POST',
      body: JSON.stringify({ text, brandId }),
    });
  }

  async enhanceBrandVoice(content: string, targetVoice: string, brandId?: string): Promise<ApiResponse<{ enhanced_content: string }>> {
    return this.httpClient.request('/api/brand/enhance', {
      method: 'POST',
      body: JSON.stringify({ content, targetVoice, brandId }),
    });
  }

  async trackBrandAlignment(contentId: string, score: number) {
    return this.httpClient.request('/api/brand/track-alignment', {
      method: 'POST',
      body: JSON.stringify({ contentId, score }),
    });
  }
}
