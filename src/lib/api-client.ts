import { AnalyticsService } from './api/analytics-service';
import { UserPreferencesService } from './api/user-preferences-service';
import { SocialPlatformsService } from './api/social-platforms-service';
import { RealTimeMetricsService } from './api/real-time-metrics-service';
import { IntegrationsService } from './api/integrations-service';
import { SystemHealthService } from './api/system-health-service';
import { CampaignApi } from './api/campaign-api';
import { LeadApi } from './api/lead-api';
import { ContentApi } from './api/content-api';
import { SocialApi } from './api/social-api';
import { EmailApi } from './api/email-api';
import { AgentApi } from './api/agent-api';
import { ProposalApi } from './api/proposal-api';
import { WorkflowApi } from './api/workflow-api';
import { HttpClient } from './http-client';

export type { ApiResponse } from './api/api-client-interface';

export class ApiClient {
  // API modules
  private campaignApi: CampaignApi;
  private leadApi: LeadApi;
  private contentApi: ContentApi;
  private socialApi: SocialApi;
  private emailApi: EmailApi;
  private agentApi: AgentApi;
  private proposalApi: ProposalApi;
  private workflowApi: WorkflowApi;

  // Expose httpClient for backward compatibility
  public httpClient: HttpClient;

  // Service instances
  public analytics: AnalyticsService;
  public userPreferences: UserPreferencesService;
  public socialPlatforms: SocialPlatformsService;
  public enhancedCampaigns: any;
  public realTimeMetrics: RealTimeMetricsService;
  public integrations: IntegrationsService;
  public systemHealth: SystemHealthService;

  constructor() {
    this.campaignApi = new CampaignApi();
    this.leadApi = new LeadApi();
    this.contentApi = new ContentApi();
    this.socialApi = new SocialApi();
    this.emailApi = new EmailApi();
    this.agentApi = new AgentApi();
    this.proposalApi = new ProposalApi();
    this.workflowApi = new WorkflowApi();

    // Set the httpClient reference for backward compatibility
    this.httpClient = this.campaignApi.httpClient;

    // Initialize services
    this.analytics = new AnalyticsService(this.campaignApi.httpClient);
    this.userPreferences = new UserPreferencesService(this.campaignApi.httpClient);
    this.socialPlatforms = new SocialPlatformsService(this.campaignApi.httpClient);
    this.enhancedCampaigns = this.campaignApi.enhancedCampaigns;
    this.realTimeMetrics = new RealTimeMetricsService(this.campaignApi.httpClient);
    this.integrations = new IntegrationsService(this.campaignApi.httpClient);
    this.systemHealth = new SystemHealthService(this.campaignApi.httpClient);
  }

  setToken(token: string) {
    this.campaignApi.setToken(token);
    this.leadApi.setToken(token);
    this.contentApi.setToken(token);
    this.socialApi.setToken(token);
    this.emailApi.setToken(token);
    this.agentApi.setToken(token);
    this.proposalApi.setToken(token);
    this.workflowApi.setToken(token);
  }

  // Enhanced error handling wrapper
  private async handleApiCall<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.error('API call failed:', error);
      
      // Add specific error handling for common scenarios
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('sleeping')) {
          throw new Error('Server is sleeping and needs to be woken up');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Request timed out - please try again');
        }
        if (error.message.includes('network')) {
          throw new Error('Network connection issue');
        }
      }
      
      throw error;
    }
  }

  // Campaign endpoints with enhanced error handling
  async getCampaigns() {
    return this.handleApiCall(() => this.campaignApi.getCampaigns());
  }

  async createCampaign(campaignData: any) {
    return this.handleApiCall(() => this.campaignApi.createCampaign(campaignData));
  }

  async bulkCreateCampaigns(campaigns: any[]) {
    return this.handleApiCall(() => this.campaignApi.bulkCreateCampaigns(campaigns));
  }

  async getCampaignById(id: string) {
    return this.handleApiCall(() => this.campaignApi.getCampaignById(id));
  }

  async updateCampaign(id: string, updates: any) {
    return this.handleApiCall(() => this.campaignApi.updateCampaign(id, updates));
  }

  async deleteCampaign(id: string) {
    return this.handleApiCall(() => this.campaignApi.deleteCampaign(id));
  }

  // Lead endpoints with enhanced error handling
  async getLeads() {
    return this.handleApiCall(() => this.leadApi.getLeads());
  }

  async searchLeads(query: string) {
    return this.handleApiCall(() => this.leadApi.searchLeads(query));
  }

  async getLeadAnalytics() {
    return this.handleApiCall(() => this.leadApi.getLeadAnalytics());
  }

  async createLead(leadData: any) {
    return this.handleApiCall(() => this.leadApi.createLead(leadData));
  }

  async exportLeads(format: 'csv' | 'json' = 'csv') {
    return this.handleApiCall(() => this.leadApi.exportLeads(format));
  }

  async syncLeads() {
    return this.handleApiCall(() => this.leadApi.syncLeads());
  }

  // Content endpoints with enhanced error handling
  async generateContent(brief: any) {
    return this.handleApiCall(() => this.contentApi.generateContent(brief));
  }

  async createContent(contentData: any) {
    return this.handleApiCall(() => this.contentApi.createContent(contentData));
  }

  async getContentLibrary() {
    return this.handleApiCall(() => this.contentApi.getContentLibrary());
  }

  // Social media endpoints with enhanced error handling
  async getSocialMediaPosts() {
    return this.handleApiCall(() => this.socialApi.getSocialMediaPosts());
  }

  async createSocialPost(postData: any) {
    return this.handleApiCall(() => this.socialApi.createSocialPost(postData));
  }

  async getSocialAnalytics() {
    return this.handleApiCall(() => this.socialApi.getSocialAnalytics());
  }

  async scheduleSocialPost(postData: any) {
    return this.handleApiCall(() => this.socialApi.scheduleSocialPost(postData));
  }

  async generateSocialContent(platform: string, contentTheme: string, brandVoice?: string) {
    return this.handleApiCall(() => this.socialApi.generateSocialContent(platform, contentTheme, brandVoice));
  }

  // Email endpoints with enhanced error handling
  async getEmailCampaigns() {
    return this.handleApiCall(() => this.emailApi.getEmailCampaigns());
  }

  async createEmailCampaign(campaignData: any) {
    return this.handleApiCall(() => this.emailApi.createEmailCampaign(campaignData));
  }

  async getEmailAnalytics() {
    return this.handleApiCall(() => this.emailApi.getEmailAnalytics());
  }

  async sendEmail(emailData: any) {
    return this.handleApiCall(() => this.emailApi.sendEmail(emailData));
  }

  async createEmailTemplateVersion(templateId: string, versionData: any) {
    return this.handleApiCall(() => this.emailApi.createEmailTemplateVersion(templateId, versionData));
  }

  async getEmailTemplateVersions(templateId: string) {
    return this.handleApiCall(() => this.emailApi.getEmailTemplateVersions(templateId));
  }

  async sendPersonalizedEmail(emailData: any) {
    return this.handleApiCall(() => this.emailApi.sendPersonalizedEmail(emailData));
  }

  async getEmailRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.handleApiCall(() => this.emailApi.getEmailRealTimeMetrics(campaignId, timeRange));
  }

  async registerEmailWebhook(webhookData: any) {
    return this.handleApiCall(() => this.emailApi.registerEmailWebhook(webhookData));
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any) {
    return this.handleApiCall(() => this.emailApi.trackEmailEvent(emailId, eventType, metadata));
  }

  async generateEmailContent(campaignType: string, audience: any, options?: any) {
    return this.handleApiCall(() => this.emailApi.generateEmailContent(campaignType, audience, options));
  }

  async generateABVariants(baseMessage: string) {
    return this.handleApiCall(() => this.emailApi.generateABVariants(baseMessage));
  }

  async suggestSendTime(audienceProfile: any) {
    return this.handleApiCall(() => this.emailApi.suggestSendTime(audienceProfile));
  }

  // Agent endpoints with enhanced error handling
  async executeAgentTask(agentType: string, taskType: string, inputData: any) {
    return this.handleApiCall(() => this.agentApi.executeAgentTask(agentType, taskType, inputData));
  }

  async scoreLeads(leads?: any[]) {
    return this.handleApiCall(() => this.agentApi.scoreLeads(leads));
  }

  async enrichLeads(leadData: any) {
    return this.handleApiCall(() => this.agentApi.enrichLeads(leadData));
  }

  async optimizeCampaign(campaignData: any) {
    return this.handleApiCall(() => this.agentApi.optimizeCampaign(campaignData));
  }

  // Proposal endpoints with enhanced error handling
  async getProposalTemplates() {
    return this.handleApiCall(() => this.proposalApi.getProposalTemplates());
  }

  async generateProposal(proposalData: any) {
    return this.handleApiCall(() => this.proposalApi.generateProposal(proposalData));
  }

  async getProposals() {
    return this.handleApiCall(() => this.proposalApi.getProposals());
  }

  async exportProposal(proposalId: string, format: string) {
    return this.handleApiCall(() => this.proposalApi.exportProposal(proposalId, format));
  }

  // Workflow endpoints with enhanced error handling
  async getWorkflows() {
    return this.handleApiCall(() => this.workflowApi.getWorkflows());
  }

  async createWorkflow(workflowData: any) {
    return this.handleApiCall(() => this.workflowApi.createWorkflow(workflowData));
  }

  async executeWorkflow(workflowId: string) {
    return this.handleApiCall(() => this.workflowApi.executeWorkflow(workflowId));
  }

  async getWorkflowStatus(workflowId: string) {
    return this.handleApiCall(() => this.workflowApi.getWorkflowStatus(workflowId));
  }

  async updateWorkflow(workflowId: string, updates: any) {
    return this.handleApiCall(() => this.workflowApi.updateWorkflow(workflowId, updates));
  }

  async deleteWorkflow(workflowId: string) {
    return this.handleApiCall(() => this.workflowApi.deleteWorkflow(workflowId));
  }

  // System health method with enhanced error handling
  async getSystemHealth() {
    return this.handleApiCall(() => this.systemHealth.getSystemHealth());
  }
}

export const apiClient = new ApiClient();
