import axios, { AxiosInstance } from 'axios';
import { getCookie } from 'cookies-next';

import {
  type User,
  type Campaign,
  type Workflow,
  type Content,
  type SocialPlatformConnection,
  type AnalyticsOverview,
  type EmailMetrics,
  type UserPreferences
} from './api-client-interface';
import { UserPreferencesService } from './api/user-preferences-service';
import { SocialPlatformsService } from './api/social-platforms-service';
import { HeadlinesService } from './api/headlines-service';
import { LeadApi } from './api/lead-api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const getToken = (): string | undefined => {
  return getCookie('accessToken')?.toString();
};

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config: any = {}): Promise<T> {
    return this.axiosInstance.get(url, config);
  }

  async post<T>(url: string, data: any, config: any = {}): Promise<T> {
    return this.axiosInstance.post(url, data, config);
  }

  async put<T>(url: string, data: any, config: any = {}): Promise<T> {
    return this.axiosInstance.put(url, data, config);
  }

  async delete<T>(url: string, config: any = {}): Promise<T> {
    return this.axiosInstance.delete(url, config);
  }

  async request<T>(url: string, config: any = {}): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({ url, ...config });
      return response;
    } catch (error: any) {
      console.error('Request failed:', error);
      throw error;
    }
  }
}

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiClient {
  public httpClient: HttpClient;
  public userPreferences: UserPreferencesService;
  public socialPlatforms: SocialPlatformsService;
  public headlines: HeadlinesService;
  public leads: LeadApi;

  constructor() {
    this.httpClient = new HttpClient(baseURL);
    this.userPreferences = new UserPreferencesService(this.httpClient);
    this.socialPlatforms = new SocialPlatformsService(this.httpClient);
    this.headlines = new HeadlinesService(this.httpClient);
    this.leads = new LeadApi();
  }

  setToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  async getUser(): Promise<ApiResponse<User>> {
    try {
      const data = await this.httpClient.get<User>('/api/users/me');
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get user' };
    }
  }

  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const data = await this.httpClient.get<Campaign[]>('/api/campaigns');
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get campaigns' };
    }
  }

  async createCampaign(name: string, description?: string): Promise<ApiResponse<Campaign>> {
    try {
      const data = await this.httpClient.post<Campaign>('/api/campaigns', { name, description });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create campaign' };
    }
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.httpClient.put<Campaign>(`/api/campaigns/${id}`, data);
      return { success: true, data: response };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update campaign' };
    }
  }

  async deleteCampaign(id: string): Promise<ApiResponse<void>> {
    try {
      await this.httpClient.delete(`/api/campaigns/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete campaign' };
    }
  }

  async getWorkflows(): Promise<ApiResponse<Workflow[]>> {
    try {
      const data = await this.httpClient.get<Workflow[]>('/api/workflows');
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get workflows' };
    }
  }

  async workflows(): Promise<any> {
    return {
      getAll: async (): Promise<ApiResponse<Workflow[]>> => {
        try {
          const data = await this.httpClient.get<Workflow[]>('/api/workflows');
          return { success: true, data };
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to get workflows' };
        }
      },
      create: async (name: string, description?: string): Promise<ApiResponse<Workflow>> => {
        try {
          const data = await this.httpClient.post<Workflow>('/api/workflows', { name, description });
          return { success: true, data };
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to create workflow' };
        }
      },
      update: async (id: string, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> => {
        try {
          const response = await this.httpClient.put<Workflow>(`/api/workflows/${id}`, data);
          return { success: true, data: response };
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to update workflow' };
        }
      },
      delete: async (id: string): Promise<ApiResponse<void>> => {
        try {
          await this.httpClient.delete(`/api/workflows/${id}`);
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to delete workflow' };
        }
      },
      execute: async (id: string): Promise<ApiResponse<void>> => {
        try {
          await this.httpClient.post(`/api/workflows/${id}/execute`, {});
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to execute workflow' };
        }
      },
    };
  }

  async generateContent(contentBrief: any): Promise<ApiResponse<Content>> {
    try {
      const data = await this.httpClient.post<Content>('/api/content/generate', contentBrief);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to generate content' };
    }
  }

  async generateEmailContent(briefText: string): Promise<ApiResponse<Content>> {
    try {
      const data = await this.httpClient.post<Content>('/api/content/generate-email', { brief: briefText });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to generate email content' };
    }
  }

  async queryAgent(query: string): Promise<ApiResponse<any>> {
    try {
      const data = await this.httpClient.post<any>('/api/agents/query', { query });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to query agent' };
    }
  }

  async getEmailAnalytics(): Promise<ApiResponse<EmailMetrics>> {
    try {
      const data = await this.httpClient.get<EmailMetrics>('/api/analytics/email');
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to get email analytics' };
    }
  }

  async getAnalytics(): Promise<any> {
    return {
      getAnalyticsOverview: async (): Promise<ApiResponse<AnalyticsOverview>> => {
        try {
          const data = await this.httpClient.get<AnalyticsOverview>('/api/analytics/overview');
          return { success: true, data };
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to get analytics overview' };
        }
      },
    };
  }

    // Social Platform methods
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    try {
      const response = await this.httpClient.request<SocialPlatformConnection[]>('/api/social-platforms');
      return {
        success: true,
        data: response || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch social platforms'
      };
    }
  }

  async connectSocialPlatform(platformData: any): Promise<ApiResponse<SocialPlatformConnection>> {
    try {
      const response = await this.httpClient.request<SocialPlatformConnection>('/api/social-platforms/connect', {
        method: 'POST',
        body: JSON.stringify(platformData)
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect platform'
      };
    }
  }

  // Lead scoring method fix
  async scoreLeads(): Promise<ApiResponse<any>> {
    try {
      const response = await this.httpClient.request('/api/leads/score', {
        method: 'POST'
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to score leads'
      };
    }
  }
}

export const apiClient = new ApiClient();
