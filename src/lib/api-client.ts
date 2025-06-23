import { HttpClient } from './http-client';
import { ApiResponse } from './api-response';

export class ApiClient {
  private httpClient: HttpClient;
  private token: string | null = null;

  constructor() {
    this.httpClient = new HttpClient();
  }

  setToken(token: string) {
    this.token = token;
    this.httpClient.setAuthToken(token);
  }

  clearToken() {
    this.token = null;
    this.httpClient.clearAuthToken();
  }

  async getCampaigns(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/campaigns');
  }

  async getLeads(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/leads');
  }

  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/analytics');
  }

  async queryAgent(query: string): Promise<ApiResponse<any>> {
    return this.httpClient.request(`/api/agent/query?query=${encodeURIComponent(query)}`);
  }

  // Blog creation methods
  async generateBlogPost(params: {
    title: string;
    keyword: string;
    wordCount: number;
    tone: string;
    includeCTA: boolean;
  }): Promise<ApiResponse<any>> {
    return this.httpClient.request('/api/content/blog/generate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getBlogPosts(): Promise<ApiResponse<any[]>> {
    return this.httpClient.request('/api/content/blog');
  }
}
