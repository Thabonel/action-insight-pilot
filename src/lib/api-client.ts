import { AnalyticsService } from './api/analytics-service';
import { WorkflowService } from './api/workflow-service';
import { UserPreferencesService } from './api/user-preferences-service';
import { SocialPlatformsService } from './api/social-platforms-service';
import { RealTimeMetricsService } from './api/real-time-metrics-service';
import { IntegrationsService } from './api/integrations-service';
import { SystemHealthService } from './api/system-health-service';
import { CampaignMethods } from './api/campaign-methods';
import { LeadMethods } from './api/lead-methods';
import { ContentMethods } from './api/content-methods';
import { SocialMethods } from './api/social-methods';
import { EmailMethods } from './api/email-methods';
import { AgentMethods } from './api/agent-methods';
import { ProposalMethods } from './api/proposal-methods';
import { HttpClient } from './http-client';

export type { ApiResponse } from './api/api-client-interface';

export class ApiClient {
  // Method classes
  private campaignMethods: CampaignMethods;
  private leadMethods: LeadMethods;
  private contentMethods: ContentMethods;
  private socialMethods: SocialMethods;
  private emailMethods: EmailMethods;
  private agentMethods: AgentMethods;
  private proposalMethods: ProposalMethods;

  // Expose httpClient for backward compatibility
  public httpClient: HttpClient;

  // Service instances
  public analytics: AnalyticsService;
  private workflow: WorkflowService;
  public userPreferences: UserPreferencesService;
  public socialPlatforms: SocialPlatformsService;
  public enhancedCampaigns: any;
  public realTimeMetrics: RealTimeMetricsService;
  public integrations: IntegrationsService;
  public systemHealth: SystemHealthService;

  constructor() {
    this.campaignMethods = new CampaignMethods();
    this.leadMethods = new LeadMethods();
    this.contentMethods = new ContentMethods();
    this.socialMethods = new SocialMethods();
    this.emailMethods = new EmailMethods();
    this.agentMethods = new AgentMethods();
    this.proposalMethods = new ProposalMethods();

    // Set the httpClient reference for backward compatibility
    this.httpClient = this.campaignMethods.httpClient;

    // Initialize services
    this.analytics = new AnalyticsService(this.campaignMethods.httpClient);
    this.workflow = new WorkflowService(this.campaignMethods.httpClient);
    this.userPreferences = new UserPreferencesService(this.campaignMethods.httpClient);
    this.socialPlatforms = new SocialPlatformsService(this.campaignMethods.httpClient);
    this.enhancedCampaigns = this.campaignMethods.enhancedCampaigns;
    this.realTimeMetrics = new RealTimeMetricsService(this.campaignMethods.httpClient);
    this.integrations = new IntegrationsService(this.campaignMethods.httpClient);
    this.systemHealth = new SystemHealthService(this.campaignMethods.httpClient);
  }

  setToken(token: string) {
    this.campaignMethods.setToken(token);
    this.leadMethods.setToken(token);
    this.contentMethods.setToken(token);
    this.socialMethods.setToken(token);
    this.emailMethods.setToken(token);
    this.agentMethods.setToken(token);
    this.proposalMethods.setToken(token);
  }

  // Campaign endpoints
  async getCampaigns() {
    return this.campaignMethods.getCampaigns();
  }

  async createCampaign(campaignData: any) {
    return this.campaignMethods.createCampaign(campaignData);
  }

  async bulkCreateCampaigns(campaigns: any[]) {
    return this.campaignMethods.bulkCreateCampaigns(campaigns);
  }

  async getCampaignById(id: string) {
    return this.campaignMethods.getCampaignById(id);
  }

  async updateCampaign(id: string, updates: any) {
    return this.campaignMethods.updateCampaign(id, updates);
  }

  async deleteCampaign(id: string) {
    return this.campaignMethods.deleteCampaign(id);
  }

  // Lead endpoints
  async getLeads() {
    return this.leadMethods.getLeads();
  }

  async searchLeads(query: string) {
    return this.leadMethods.searchLeads(query);
  }

  async getLeadAnalytics() {
    return this.leadMethods.getLeadAnalytics();
  }

  async createLead(leadData: any) {
    return this.leadMethods.createLead(leadData);
  }

  async exportLeads(format: 'csv' | 'json' = 'csv') {
    return this.leadMethods.exportLeads(format);
  }

  async syncLeads() {
    return this.leadMethods.syncLeads();
  }

  // Content endpoints
  async generateContent(brief: any) {
    return this.contentMethods.generateContent(brief);
  }

  async createContent(contentData: any) {
    return this.contentMethods.createContent(contentData);
  }

  async getContentLibrary() {
    return this.contentMethods.getContentLibrary();
  }

  // Social media endpoints
  async getSocialMediaPosts() {
    return this.socialMethods.getSocialMediaPosts();
  }

  async createSocialPost(postData: any) {
    return this.socialMethods.createSocialPost(postData);
  }

  async getSocialAnalytics() {
    return this.socialMethods.getSocialAnalytics();
  }

  async scheduleSocialPost(postData: any) {
    return this.socialMethods.scheduleSocialPost(postData);
  }

  async generateSocialContent(platform: string, contentTheme: string, brandVoice?: string) {
    return this.socialMethods.generateSocialContent(platform, contentTheme, brandVoice);
  }

  // Email endpoints
  async getEmailCampaigns() {
    return this.emailMethods.getEmailCampaigns();
  }

  async createEmailCampaign(campaignData: any) {
    return this.emailMethods.createEmailCampaign(campaignData);
  }

  async getEmailAnalytics() {
    return this.emailMethods.getEmailAnalytics();
  }

  async sendEmail(emailData: any) {
    return this.emailMethods.sendEmail(emailData);
  }

  async createEmailTemplateVersion(templateId: string, versionData: any) {
    return this.emailMethods.createEmailTemplateVersion(templateId, versionData);
  }

  async getEmailTemplateVersions(templateId: string) {
    return this.emailMethods.getEmailTemplateVersions(templateId);
  }

  async sendPersonalizedEmail(emailData: any) {
    return this.emailMethods.sendPersonalizedEmail(emailData);
  }

  async getEmailRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.emailMethods.getEmailRealTimeMetrics(campaignId, timeRange);
  }

  async registerEmailWebhook(webhookData: any) {
    return this.emailMethods.registerEmailWebhook(webhookData);
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any) {
    return this.emailMethods.trackEmailEvent(emailId, eventType, metadata);
  }

  async generateEmailContent(campaignType: string, audience: any, options?: any) {
    return this.emailMethods.generateEmailContent(campaignType, audience, options);
  }

  async generateABVariants(baseMessage: string) {
    return this.emailMethods.generateABVariants(baseMessage);
  }

  async suggestSendTime(audienceProfile: any) {
    return this.emailMethods.suggestSendTime(audienceProfile);
  }

  // Agent endpoints
  async executeAgentTask(agentType: string, taskType: string, inputData: any) {
    return this.agentMethods.executeAgentTask(agentType, taskType, inputData);
  }

  async scoreLeads(leads?: any[]) {
    return this.agentMethods.scoreLeads(leads);
  }

  async enrichLeads(leadData: any) {
    return this.agentMethods.enrichLeads(leadData);
  }

  async optimizeCampaign(campaignData: any) {
    return this.agentMethods.optimizeCampaign(campaignData);
  }

  // Proposal endpoints
  async getProposalTemplates() {
    return this.proposalMethods.getProposalTemplates();
  }

  async generateProposal(proposalData: any) {
    return this.proposalMethods.generateProposal(proposalData);
  }

  async getProposals() {
    return this.proposalMethods.getProposals();
  }

  async exportProposal(proposalId: string, format: string) {
    return this.proposalMethods.exportProposal(proposalId, format);
  }

  // Workflow endpoints
  async getWorkflows() {
    return this.httpClient.request('/api/workflows/list');
  }

  async createWorkflow(workflowData: any) {
    return this.httpClient.request('/api/workflows/create', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async executeWorkflow(workflowId: string) {
    return this.httpClient.request(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
    });
  }

  async getWorkflowStatus(workflowId: string) {
    return this.httpClient.request(`/api/workflows/${workflowId}/status`);
  }

  async updateWorkflow(workflowId: string, updates: any) {
    return this.httpClient.request(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteWorkflow(workflowId: string) {
    return this.httpClient.request(`/api/workflows/${workflowId}`, {
      method: 'DELETE',
    });
  }

  // System health method
  async getSystemHealth() {
    return this.systemHealth.getSystemHealth();
  }
}

export const apiClient = new ApiClient();
