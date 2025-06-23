export interface UserPreferences {
  name?: string;
  domain?: string;
  industry?: string;
  teamSize?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    [key: string]: boolean;
  };
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  active?: boolean; // Alternative property name for backward compatibility
  last_triggered_at?: string;
  last_response_code?: number;
  secret?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  platform_name: string;
  status: 'connected' | 'disconnected' | 'error';
  connection_status: 'connected' | 'disconnected' | 'error';
  username?: string;
  platform_username?: string;
  platform_user_id?: string;
  lastSync?: string;
  last_sync_at?: string;
  token_expires_at?: string;
  connection_metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface EmailMetrics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  // Alternative property names for backward compatibility
  total_sent?: number;
  total_opened?: number;
  total_clicked?: number;
  totalOpened?: number;
  totalClicks?: number;
  // Additional properties for dashboard
  insights?: Array<{
    type: string;
    message: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  trends?: {
    sent?: number[];
    opened?: number[];
    clicked?: number[];
  };
  last_updated?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  startDate: string;
  endDate?: string;
  budget?: number;
  target_audience?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  content: string;
  platform: string;
  scheduledTime: string;
  scheduled_time?: string; // Alternative property name
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  campaignId?: string;
  created_at: string;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  service_name: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync_at?: string;
  sync_status: 'idle' | 'syncing' | 'error' | 'success';
  configuration?: Record<string, any>;
  error_message?: string;
  lastSync?: string;
}

export interface OAuthResponse {
  authorization_url: string;
  state: string;
}

import { HttpClient } from './http-client';

export class ApiClient {
  private httpClient: HttpClient;

  constructor(baseURL: string) {
    this.httpClient = new HttpClient(baseURL);
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // User Preferences
  async getUserPreferences(category: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/user/preferences?category=${category}`);
  }

  async updateUserPreferences(category: string, preferences: any): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/user/preferences?category=${category}`, {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

   async get(category: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/user/preferences?category=${category}`);
  }

  // Authentication
  async login(credentials: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/auth/logout', { method: 'POST' });
  }

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Campaigns
  async getCampaigns(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/campaigns');
  }

  async createCampaign(campaignData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async updateCampaign(campaignId: string, campaignData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  async deleteCampaign(campaignId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/campaigns/${campaignId}`, {
      method: 'DELETE',
    });
  }

  // Social Media
  async getSocialPosts(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/social-posts');
  }

   async createSocialPost(postData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/social-posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updateSocialPost(postId: string, postData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/social-posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deleteSocialPost(postId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/social-posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/analytics');
  }

  async getEmailAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/analytics/email');
  }

  // Integrations
  async getWebhooks(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/integrations/webhooks');
  }

  async createWebhook(webhookData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/integrations/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async deleteWebhook(webhookId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }

  async testWebhook(webhookId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/webhooks/${webhookId}/test`, {
      method: 'POST',
    });
  }

  async getConnections(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/integrations/connections');
  }

  async createConnection(connectionData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/integrations/connections', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  }

  async deleteConnection(connectionId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/connections/${connectionId}`, {
      method: 'DELETE',
    });
  }

  async connectService(service: string, apiKey: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/connect/${service}`, {
      method: 'POST',
      body: JSON.stringify({ apiKey }),
    });
  }

  async syncService(service: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/sync/${service}`, {
      method: 'POST',
    });
  }

  async disconnectService(service: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/integrations/disconnect/${service}`, {
      method: 'POST',
    });
  }

  // Leads
  async getLeads(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/leads');
  }

  async createLead(leadData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(leadId: string, leadData: any): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/leads/${leadId}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  async deleteLead(leadId: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/leads/${leadId}`, {
      method: 'DELETE',
    });
  }

  // Conversational AI
  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/agent/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async callDailyFocusAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/agent/daily-focus', {
      method: 'POST',
      body: JSON.stringify({ query, campaigns }),
    });
  }

  async callGeneralCampaignAgent(query: string, campaigns: any[]): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/agent/campaign-analysis', {
      method: 'POST',
      body: JSON.stringify({ query, campaigns }),
    });
  }

  // System Health
  async getSystemHealth(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/health/system');
  }

  // Analytics Overview
  async getAnalyticsOverview(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/analytics/overview');
  }

  // Export Analytics Report
  async exportAnalyticsReport(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/analytics/export');
  }

  // System Statistics
  async getSystemStats(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/system/stats');
  }

  // Generate Blog Post
  async generateBlogPost(blogPostParams: any): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/content/generate-blog-post', {
      method: 'POST',
      body: JSON.stringify(blogPostParams),
    });
  }

  async getBlogPosts(): Promise<ApiResponse<any[]>> {
    try {
      // Mock implementation - replace with actual API call
      const mockPosts = [
        {
          id: '1',
          title: 'How to Improve Your Marketing Strategy',
          keyword: 'marketing strategy',
          wordCount: 1200,
          tone: 'professional',
          includeCTA: true,
          content: 'Sample blog post content about marketing strategy...',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          title: 'Digital Marketing Trends 2024',
          keyword: 'digital marketing',
          wordCount: 800,
          tone: 'neutral',
          includeCTA: false,
          content: 'Sample blog post content about digital marketing trends...',
          createdAt: '2024-01-14T14:20:00Z'
        }
      ];

      return {
        success: true,
        data: mockPosts
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog posts'
      };
    }
  }

  async deleteBlogPost(postId: string): Promise<ApiResponse<void>> {
    try {
      // Mock implementation - replace with actual API call
      console.log('Deleting blog post:', postId);
      
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete blog post'
      };
    }
  }
}

export const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_BASE_URL || '');
