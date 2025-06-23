
import { BaseApiClient } from './base-api-client';

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
  async analyzeBrandVoice(content: string, brandId?: string) {
    return this.httpClient.request<BrandVoiceAnalysis>('/api/brand/voice-analysis', {
      method: 'POST',
      body: JSON.stringify({ content, brandId }),
    });
  }

  async getBrandDocuments() {
    return this.httpClient.request<BrandDocument[]>('/api/brand/documents');
  }

  async getBrandTerminology(brandId?: string) {
    return this.httpClient.request<{ terms: string[], phrases: string[] }>('/api/brand/terminology', {
      method: 'GET',
    });
  }

  async suggestBrandAlternatives(text: string, brandId?: string) {
    return this.httpClient.request<{ alternatives: string[] }>('/api/brand/alternatives', {
      method: 'POST',
      body: JSON.stringify({ text, brandId }),
    });
  }

  async enhanceBrandVoice(content: string, targetVoice: string, brandId?: string) {
    return this.httpClient.request<{ enhanced_content: string }>('/api/brand/enhance', {
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
