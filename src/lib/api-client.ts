
import axios, { AxiosInstance } from 'axios';
import { getCookie } from 'cookies-next';
import { HttpClient } from './http-client';
import { 
  ApiResponse, User, Campaign, Lead, Workflow, Content, AnalyticsOverview, 
  UserPreferences, UserPreference, SocialPlatformConnection, IntegrationConnection, 
  Webhook, BlogPost, BlogPostParams, ContentBrief
} from './api-client-interface';
import { UserPreferencesService } from './services/user-preferences-service';
import { SocialPlatformsService } from './services/social-platforms-service';
import { ConversationalAgentService } from './services/conversational-agent-service';
import { WorkflowService } from './services/workflow-service';
import { ContentGenerationService } from './services/content-generation-service';
import { BaseApiClient } from './api/base-api-client';
import { ContentMethods } from './api/content-methods';
import { HeadlinesService } from './api/headlines-service';

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private httpClient: HttpClient;
  private userPreferencesService: UserPreferencesService;
  private socialPlatformsService: SocialPlatformsService;
  private conversationalAgentService: ConversationalAgentService;
  private workflowService: WorkflowService;
  private contentGenerationService: ContentGenerationService;
  private contentMethods: ContentMethods;
  private headlinesService: HeadlinesService;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || 'https://wheels-wins-orchestrator.onrender.com';
    
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 30000,
    });

    this.httpClient = new HttpClient();
    
    // Initialize services
    this.userPreferencesService = new UserPreferencesService();
    this.socialPlatformsService = new SocialPlatformsService();
    this.conversationalAgentService = new ConversationalAgentService();
    this.workflowService = new WorkflowService();
    this.contentGenerationService = new ContentGenerationService();
    this.contentMethods = new ContentMethods();
    this.headlinesService = new HeadlinesService(this.httpClient);

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use((config) => {
      const token = getCookie('supabase-auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // User preferences methods
  get userPreferences() {
    return {
      get: () => this.userPreferencesService.getPreferencesByCategory('general'),
      update: (data: any) => this.userPreferencesService.updateUserPreferences('general', data),
      getUserPreferences: (category: string) => this.userPreferencesService.getUserPreferences(category),
      updateUserPreferences: (category: string, preferences: UserPreferences) => 
        this.userPreferencesService.updateUserPreferences(category, preferences)
    };
  }

  // Social platforms methods
  get socialPlatforms() {
    return {
      get: () => this.socialPlatformsService.getPlatformConnections(),
      update: (data: any) => this.socialPlatformsService.updatePlatformConnection(data),
      getPlatformConnections: () => this.socialPlatformsService.getPlatformConnections(),
      initiatePlatformConnection: (platform: string) => this.socialPlatformsService.initiatePlatformConnection(platform),
      disconnectPlatform: (platformId: string) => this.socialPlatformsService.disconnectPlatform(platformId),
      syncPlatformData: (platformId: string) => this.socialPlatformsService.syncPlatformData(platformId),
      testPlatformConnection: (platformId: string) => this.socialPlatformsService.testPlatformConnection(platformId)
    };
  }

  // Integrations methods
  get integrations() {
    return {
      getWebhooks: (): Promise<ApiResponse<Webhook[]>> => Promise.resolve({ success: true, data: [] }),
      createWebhook: (webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => 
        Promise.resolve({ success: true, data: { id: '1', url: '', events: [], active: true, created_at: new Date().toISOString(), ...webhookData } as Webhook }),
      updateWebhook: (id: string, webhookData: Partial<Webhook>): Promise<ApiResponse<Webhook>> => 
        Promise.resolve({ success: true, data: { id, url: '', events: [], active: true, created_at: new Date().toISOString(), ...webhookData } as Webhook }),
      deleteWebhook: (id: string): Promise<ApiResponse<void>> => Promise.resolve({ success: true }),
      getConnections: (): Promise<ApiResponse<IntegrationConnection[]>> => Promise.resolve({ success: true, data: [] }),
      createConnection: (connectionData: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> => 
        Promise.resolve({ success: true, data: { id: '1', name: '', type: '', status: 'pending', config: {}, ...connectionData } as IntegrationConnection }),
      updateConnection: (id: string, connectionData: Partial<IntegrationConnection>): Promise<ApiResponse<IntegrationConnection>> => 
        Promise.resolve({ success: true, data: { id, name: '', type: '', status: 'pending', config: {}, ...connectionData } as IntegrationConnection }),
      deleteConnection: (id: string): Promise<ApiResponse<void>> => Promise.resolve({ success: true }),
      syncService: (serviceId: string): Promise<ApiResponse<void>> => Promise.resolve({ success: true })
    };
  }

  // Workflow methods
  get workflows() {
    return {
      getAll: (): Promise<ApiResponse<Workflow[]>> => this.workflowService.getWorkflows(),
      create: (name: string, description?: string): Promise<ApiResponse<Workflow>> => 
        this.workflowService.createWorkflow(name, description),
      update: (id: string, data: Partial<Workflow>): Promise<ApiResponse<Workflow>> => 
        this.workflowService.updateWorkflow(id, data),
      delete: (id: string): Promise<ApiResponse<void>> => this.workflowService.deleteWorkflow(id),
      execute: (id: string): Promise<ApiResponse<any>> => this.workflowService.executeWorkflow(id)
    };
  }

  // Campaign methods
  async getCampaigns(): Promise<ApiResponse<Campaign[]>> {
    try {
      const response = await this.axiosInstance.get('/api/campaigns');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createCampaign(data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.axiosInstance.post('/api/campaigns', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<ApiResponse<Campaign>> {
    try {
      const response = await this.axiosInstance.put(`/api/campaigns/${id}`, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Lead methods
  async getLeads(): Promise<ApiResponse<Lead[]>> {
    try {
      const response = await this.axiosInstance.get('/api/leads');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async scoreLeads(): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post('/api/leads/score');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Content methods
  async createContent(contentData: any): Promise<ApiResponse<Content>> {
    try {
      const response = await this.axiosInstance.post('/api/content', contentData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async generateContent(brief: ContentBrief): Promise<ApiResponse<any>> {
    return this.contentMethods.generateContent(brief);
  }

  async generateBlogPost(params: BlogPostParams): Promise<ApiResponse<BlogPost>> {
    try {
      const response = await this.axiosInstance.post('/api/content/blog', params);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Social methods
  async getSocialPlatforms(): Promise<ApiResponse<SocialPlatformConnection[]>> {
    try {
      const response = await this.axiosInstance.get('/api/social/platforms');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async connectSocialPlatform(platform: string): Promise<ApiResponse<SocialPlatformConnection>> {
    try {
      const response = await this.axiosInstance.post('/api/social/connect', { platform });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async scheduleSocialPost(postData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.post('/api/social/schedule', postData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getSocialPosts(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.axiosInstance.get('/api/social/posts');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Agent methods
  async queryAgent(query: string): Promise<any[]> {
    return this.conversationalAgentService.processQuery(query, []);
  }

  async callDailyFocusAgent(query: string, context: any[]): Promise<any> {
    return this.conversationalAgentService.callDailyFocusAgent(query, [], context);
  }

  async callGeneralCampaignAgent(query: string, context: any[]): Promise<any> {
    return this.conversationalAgentService.callGeneralCampaignAgent(query, [], context);
  }

  // Analytics methods
  async getRealTimeMetrics(): Promise<ApiResponse<any>> {
    try {
      const response = await this.axiosInstance.get('/api/analytics/metrics');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const apiClient = new ApiClient();

// Export types
export type { 
  Campaign, Lead, User, Workflow, Content, AnalyticsOverview, 
  UserPreferences, SocialPlatformConnection, IntegrationConnection, 
  Webhook, BlogPost, BlogPostParams, ContentBrief 
};
