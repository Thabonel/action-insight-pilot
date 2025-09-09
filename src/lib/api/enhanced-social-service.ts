
import { HttpClient } from '../http-client';

export interface AIContentRequest {
  topic: string;
  platform: string;
  tone?: string;
  target_audience?: string;
  use_trends?: boolean;
  generate_image?: boolean;
  ai_provider?: string;
  brand_keywords?: string[];
}

export interface ABTestRequest {
  test_name: string;
  platform: string;
  base_content: string;
  variant_count?: number;
  duration_hours?: number;
}

export interface TrendAnalysis {
  keyword: string;
  source: string;
  category: string;
  relevance_score?: number;
  timestamp: string;
}

export interface ContentSuggestion {
  trend_keyword: string;
  content_type: string;
  suggested_content: string;
  recommended_format: string;
  urgency: string;
  estimated_engagement: string;
}

export class EnhancedSocialService {
  constructor(private httpClient: HttpClient) {}

  // Viral Content Generation (New)
  async generateViralContent(request: {
    topic: string;
    platform: string;
    viralTemplate?: string;
    hooks?: string[];
    emotionalTriggers?: string[];
    targetAudience?: string;
  }) {
    return this.httpClient.request('/api/social/viral-content/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getViralScore(content: string, platform: string) {
    return this.httpClient.request('/api/social/viral-content/score', {
      method: 'POST',
      body: JSON.stringify({ content, platform }),
    });
  }

  async generateViralVariations(baseContent: string, platform: string, count: number = 3) {
    return this.httpClient.request('/api/social/viral-content/variations', {
      method: 'POST',
      body: JSON.stringify({
        base_content: baseContent,
        platform,
        variation_count: count
      }),
    });
  }

  async optimizeForVirality(content: string, platform: string) {
    return this.httpClient.request('/api/social/viral-content/optimize', {
      method: 'POST',
      body: JSON.stringify({ content, platform }),
    });
  }

  // AI Content Generation
  async generateAIContent(request: AIContentRequest) {
    return this.httpClient.request('/api/social/ai-content/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async bulkGenerateContent(topic: string, platforms: string[], countPerPlatform: number = 2) {
    return this.httpClient.request('/api/social/ai-content/bulk-generate', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        platforms,
        count_per_platform: countPerPlatform
      }),
    });
  }

  async compareAIProviders(prompt: string, platform: string) {
    return this.httpClient.request('/api/social/ai-content/compare-providers', {
      method: 'POST',
      body: JSON.stringify({ prompt, platform }),
    });
  }

  // Image Generation
  async generateImage(prompt: string, platform: string, generator: 'dalle' | 'stable-diffusion' = 'dalle') {
    return this.httpClient.request('/api/social/images/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        platform,
        generator
      }),
    });
  }

  async suggestVisualContent(postContent: string, platform: string) {
    return this.httpClient.request('/api/social/images/suggest', {
      method: 'POST',
      body: JSON.stringify({
        post_content: postContent,
        platform
      }),
    });
  }

  // A/B Testing
  async createABTest(request: ABTestRequest) {
    return this.httpClient.request('/api/social/ab-testing/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getABTestResults(testId: string) {
    return this.httpClient.request(`/api/social/ab-testing/${testId}/results`);
  }

  async updateVariantMetrics(testId: string, variantId: string, metricsUpdate: any) {
    return this.httpClient.request(`/api/social/ab-testing/${testId}/variants/${variantId}/metrics`, {
      method: 'PATCH',
      body: JSON.stringify(metricsUpdate),
    });
  }

  async finalizeABTest(testId: string) {
    return this.httpClient.request(`/api/social/ab-testing/${testId}/finalize`, {
      method: 'POST',
    });
  }

  // Trend Monitoring
  async getTrendingTopics(platform: string = 'twitter', location: string = 'worldwide') {
    return this.httpClient.request(`/api/social/trends?platform=${platform}&location=${location}`);
  }

  async getTrendBasedSuggestions(brandKeywords: string[], targetAudience: string = 'general') {
    return this.httpClient.request('/api/social/trends/suggestions', {
      method: 'POST',
      body: JSON.stringify({
        brand_keywords: brandKeywords,
        target_audience: targetAudience
      }),
    });
  }

  async monitorBrandMentions(brandKeywords: string[], platforms: string[] = ['twitter']) {
    return this.httpClient.request('/api/social/trends/brand-mentions', {
      method: 'POST',
      body: JSON.stringify({
        brand_keywords: brandKeywords,
        platforms
      }),
    });
  }

  // Real-time Metrics
  async getHistoricalMetrics(postId: string, hours: number = 24) {
    return this.httpClient.request(`/api/social/metrics/${postId}/historical?hours=${hours}`);
  }

  async getMetricsInsights(postId: string) {
    return this.httpClient.request(`/api/social/metrics/${postId}/insights`);
  }

  async getRealTimeInsights(postId?: string) {
    const endpoint = postId 
      ? `/api/social/insights/${postId}` 
      : '/api/social/insights';
    return this.httpClient.request(endpoint);
  }

  // Platform Extensions
  async optimizeForPlatform(content: string, platform: string, mediaType: string = 'text') {
    return this.httpClient.request('/api/social/platforms/optimize', {
      method: 'POST',
      body: JSON.stringify({
        content,
        platform,
        media_type: mediaType
      }),
    });
  }

  async validatePlatformContent(content: string, mediaUrls: string[], platform: string) {
    return this.httpClient.request('/api/social/platforms/validate', {
      method: 'POST',
      body: JSON.stringify({
        content,
        media_urls: mediaUrls,
        platform
      }),
    });
  }

  async getPlatformPostingSchedule(platform: string, timezone: string = 'UTC') {
    return this.httpClient.request(`/api/social/platforms/${platform}/schedule?timezone=${timezone}`);
  }

  // Multi-Model Management
  async setAIProvider(provider: string, apiKey?: string) {
    return this.httpClient.request('/api/social/ai-providers/set', {
      method: 'POST',
      body: JSON.stringify({
        provider,
        api_key: apiKey
      }),
    });
  }

  async getProviderStatus() {
    return this.httpClient.request('/api/social/ai-providers/status');
  }

  async testProviderConnection(provider: string) {
    return this.httpClient.request(`/api/social/ai-providers/${provider}/test`, {
      method: 'POST',
    });
  }

  // Agent Status
  async getAgentStatus() {
    return this.httpClient.request('/api/social/agent/status');
  }
}
