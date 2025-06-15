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

  // Campaign endpoints
  async getCampaigns() {
    return this.campaignApi.getCampaigns();
  }

  async createCampaign(campaignData: any) {
    return this.campaignApi.createCampaign(campaignData);
  }

  async bulkCreateCampaigns(campaigns: any[]) {
    return this.campaignApi.bulkCreateCampaigns(campaigns);
  }

  async getCampaignById(id: string) {
    return this.campaignApi.getCampaignById(id);
  }

  async updateCampaign(id: string, updates: any) {
    return this.campaignApi.updateCampaign(id, updates);
  }

  async deleteCampaign(id: string) {
    return this.campaignApi.deleteCampaign(id);
  }

  // Lead endpoints
  async getLeads() {
    return this.leadApi.getLeads();
  }

  async searchLeads(query: string) {
    return this.leadApi.searchLeads(query);
  }

  async getLeadAnalytics() {
    return this.leadApi.getLeadAnalytics();
  }

  async createLead(leadData: any) {
    return this.leadApi.createLead(leadData);
  }

  async exportLeads(format: 'csv' | 'json' = 'csv') {
    return this.leadApi.exportLeads(format);
  }

  async syncLeads() {
    return this.leadApi.syncLeads();
  }

  // Content endpoints
  async generateContent(brief: any) {
    return this.contentApi.generateContent(brief);
  }

  async createContent(contentData: any) {
    return this.contentApi.createContent(contentData);
  }

  async getContentLibrary() {
    return this.contentApi.getContentLibrary();
  }

  // Social media endpoints
  async getSocialMediaPosts() {
    return this.socialApi.getSocialMediaPosts();
  }

  async createSocialPost(postData: any) {
    return this.socialApi.createSocialPost(postData);
  }

  async getSocialAnalytics() {
    return this.socialApi.getSocialAnalytics();
  }

  async scheduleSocialPost(postData: any) {
    return this.socialApi.scheduleSocialPost(postData);
  }

  async generateSocialContent(platform: string, contentTheme: string, brandVoice?: string) {
    return this.socialApi.generateSocialContent(platform, contentTheme, brandVoice);
  }

  // Email endpoints
  async getEmailCampaigns() {
    return this.emailApi.getEmailCampaigns();
  }

  async createEmailCampaign(campaignData: any) {
    return this.emailApi.createEmailCampaign(campaignData);
  }

  async getEmailAnalytics() {
    return this.emailApi.getEmailAnalytics();
  }

  async sendEmail(emailData: any) {
    return this.emailApi.sendEmail(emailData);
  }

  async createEmailTemplateVersion(templateId: string, versionData: any) {
    return this.emailApi.createEmailTemplateVersion(templateId, versionData);
  }

  async getEmailTemplateVersions(templateId: string) {
    return this.emailApi.getEmailTemplateVersions(templateId);
  }

  async sendPersonalizedEmail(emailData: any) {
    return this.emailApi.sendPersonalizedEmail(emailData);
  }

  async getEmailRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.emailApi.getEmailReal(timeRange);
  }

  async registerEmailWebhook(webhookData: any) {
    return this.emailApi.registerEmailWebhook(webhookData);
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any) {
    return this.emailApi.trackEmailEvent(emailId, eventType, metadata);
  }

  async generateEmailContent(campaignType: string, audience: any, options?: any) {
    return this.emailApi.generateEmailContent(campaignType, audience, options);
  }

  async generateABVariants(baseMessage: string) {
    return this.emailApi.generateABVariants(baseMessage);
  }

  async suggestSendTime(audienceProfile: any) {
    return this.emailApi.suggestSendTime(audienceProfile);
  }

  // Agent endpoints
  async executeAgentTask(agentType: string, taskType: string, inputData: any) {
    return this.agentApi.executeAgentTask(agentType, taskType, inputData);
  }

  async scoreLeads(leads?: any[]) {
    return this.agentApi.scoreLeads(leads);
  }

  async enrichLeads(leadData: any) {
    return this.agentApi.enrichLeads(leadData);
  }

  async optimizeCampaign(campaignData: any) {
    return this.agentApi.optimizeCampaign(campaignData);
  }

  // Proposal endpoints
  async getProposalTemplates() {
    return this.proposalApi.getProposalTemplates();
  }

  async generateProposal(proposalData: any) {
    return this.proposalApi.generateProposal(proposalData);
  }

  async getProposals() {
    return this.proposalApi.getProposals();
  }

  async exportProposal(proposalId: string, format: string) {
    return this.proposalApi.exportProposal(proposalId, format);
  }

  // Workflow endpoints
  async getWorkflows() {
    return this.workflowApi.getWorkflows();
  }

  async createWorkflow(workflowData: any) {
    return this.workflowApi.createWorkflow(workflowData);
  }

  async executeWorkflow(workflowId: string) {
    return this.workflowApi.executeWorkflow(workflowId);
  }

  async getWorkflowStatus(workflowId: string) {
    return this.workflowApi.getWorkflowStatus(workflowId);
  }

  async updateWorkflow(workflowId: string, updates: any) {
    return this.workflowApi.updateWorkflow(workflowId, updates);
  }

  async deleteWorkflow(workflowId: string) {
    return this.workflowApi.deleteWorkflow(workflowId);
  }

  // System health method
  async getSystemHealth() {
    return this.systemHealth.getSystemHealth();
  }
}

export const apiClient = new ApiClient();
