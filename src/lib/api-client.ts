
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class ApiClient {
  private baseUrl = 'https://srv-d0sjalqli9vc73d20vqg.onrender.com';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Campaign endpoints
  async getCampaigns() {
    return this.request('/api/campaigns');
  }

  async createCampaign(campaignData: any) {
    return this.request('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async bulkCreateCampaigns(campaigns: any[]) {
    return this.request('/api/campaigns/bulk/create', {
      method: 'POST',
      body: JSON.stringify({ campaigns }),
    });
  }

  async getCampaignById(id: string) {
    return this.request(`/api/campaigns/${id}`);
  }

  async updateCampaign(id: string, updates: any) {
    return this.request(`/api/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCampaign(id: string) {
    return this.request(`/api/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  // Lead endpoints
  async getLeads() {
    return this.request('/api/leads');
  }

  async searchLeads(query: string) {
    return this.request(`/api/leads/search?q=${encodeURIComponent(query)}`);
  }

  async getLeadAnalytics() {
    return this.request('/api/leads/analytics/overview');
  }

  async createLead(leadData: any) {
    return this.request('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  // Content endpoints
  async createContent(contentData: any) {
    return this.request('/api/content/create', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async getContentLibrary() {
    return this.request('/api/content/library');
  }

  // Social media endpoints
  async getSocialMediaPosts() {
    return this.request('/api/social/posts');
  }

  async createSocialPost(postData: any) {
    return this.request('/api/social/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getSocialAnalytics() {
    return this.request('/api/social/analytics');
  }

  async scheduleSocialPost(postData: any) {
    return this.request('/api/social/schedule', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  // Email endpoints
  async getEmailCampaigns() {
    return this.request('/api/email/campaigns');
  }

  async createEmailCampaign(campaignData: any) {
    return this.request('/api/email/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  async getEmailAnalytics() {
    return this.request('/api/email/analytics');
  }

  async sendEmail(emailData: any) {
    return this.request('/api/email/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Analytics endpoints
  async getAnalyticsOverview() {
    return this.request('/api/analytics/overview');
  }

  async getSystemStats() {
    return this.request('/api/system/stats');
  }

  async getPerformanceMetrics() {
    return this.request('/api/analytics/performance');
  }

  // Workflow endpoints
  async getWorkflows() {
    return this.request('/api/workflow/list');
  }

  async createWorkflow(workflowData: any) {
    return this.request('/api/workflow/create', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async executeWorkflow(id: string) {
    return this.request(`/api/workflow/${id}/execute`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();
