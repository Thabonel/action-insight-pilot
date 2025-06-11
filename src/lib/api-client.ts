
import { HttpClient } from './http-client';
import { CampaignsService } from './api/campaigns-service';
import { LeadsService } from './api/leads-service';
import { ContentService } from './api/content-service';
import { SocialService } from './api/social-service';
import { EmailService } from './api/email-service';
import { AnalyticsService } from './api/analytics-service';
import { WorkflowService } from './api/workflow-service';
import { ProposalsService } from './api/proposals-service';
import { AgentsService } from './api/agents-service';
import { EnhancedSocialService } from './api/enhanced-social-service';
import { UserPreferencesService } from './api/user-preferences-service';
import { SocialPlatformsService } from './api/social-platforms-service';
import { EnhancedCampaignsService } from './api/enhanced-campaigns-service';
import { RealTimeMetricsService } from './api/real-time-metrics-service';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class ApiClient {
  public httpClient: HttpClient;
  private campaigns: CampaignsService;
  private leads: LeadsService;
  private content: ContentService;
  private social: SocialService;
  private email: EmailService;
  private analytics: AnalyticsService;
  private workflow: WorkflowService;
  private proposals: ProposalsService;
  private agents: AgentsService;
  private enhancedSocial: EnhancedSocialService;
  public userPreferences: UserPreferencesService;
  public socialPlatforms: SocialPlatformsService;
  public enhancedCampaigns: EnhancedCampaignsService;
  public realTimeMetrics: RealTimeMetricsService;

  constructor() {
    this.httpClient = new HttpClient();
    this.campaigns = new CampaignsService(this.httpClient);
    this.leads = new LeadsService(this.httpClient);
    this.content = new ContentService(this.httpClient);
    this.social = new SocialService(this.httpClient);
    this.email = new EmailService(this.httpClient);
    this.analytics = new AnalyticsService(this.httpClient);
    this.workflow = new WorkflowService(this.httpClient);
    this.proposals = new ProposalsService(this.httpClient);
    this.agents = new AgentsService(this.httpClient);
    this.enhancedSocial = new EnhancedSocialService(this.httpClient);
    this.userPreferences = new UserPreferencesService(this.httpClient);
    this.socialPlatforms = new SocialPlatformsService(this.httpClient);
    this.enhancedCampaigns = new EnhancedCampaignsService(this.httpClient);
    this.realTimeMetrics = new RealTimeMetricsService(this.httpClient);
  }

  setToken(token: string) {
    this.httpClient.setToken(token);
  }

  // Campaign endpoints
  async getCampaigns() {
    return this.campaigns.getCampaigns();
  }

  async createCampaign(campaignData: any) {
    return this.campaigns.createCampaign(campaignData);
  }

  async bulkCreateCampaigns(campaigns: any[]) {
    return this.campaigns.bulkCreateCampaigns(campaigns);
  }

  async getCampaignById(id: string) {
    return this.campaigns.getCampaignById(id);
  }

  async updateCampaign(id: string, updates: any) {
    return this.campaigns.updateCampaign(id, updates);
  }

  async deleteCampaign(id: string) {
    return this.campaigns.deleteCampaign(id);
  }

  // Lead endpoints
  async getLeads() {
    return this.leads.getLeads();
  }

  async searchLeads(query: string) {
    return this.leads.searchLeads(query);
  }

  async getLeadAnalytics() {
    return this.leads.getLeadAnalytics();
  }

  async createLead(leadData: any) {
    return this.leads.createLead(leadData);
  }

  // Content endpoints
  async generateContent(brief: any) {
    return this.content.generateContent(brief);
  }

  async createContent(contentData: any) {
    return this.content.createContent(contentData);
  }

  async getContentLibrary() {
    return this.content.getContentLibrary();
  }

  // Social media endpoints
  async getSocialMediaPosts() {
    return this.social.getSocialMediaPosts();
  }

  async createSocialPost(postData: any) {
    return this.social.createSocialPost(postData);
  }

  async getSocialAnalytics() {
    return this.social.getSocialAnalytics();
  }

  async scheduleSocialPost(postData: any) {
    return this.social.scheduleSocialPost(postData);
  }

  // Email endpoints
  async getEmailCampaigns() {
    return this.email.getEmailCampaigns();
  }

  async createEmailCampaign(campaignData: any) {
    return this.email.createEmailCampaign(campaignData);
  }

  async getEmailAnalytics() {
    return this.email.getEmailAnalytics();
  }

  async sendEmail(emailData: any) {
    return this.email.sendEmail(emailData);
  }

  // New enhanced email methods
  async createEmailTemplateVersion(templateId: string, versionData: any) {
    return this.email.createTemplateVersion(templateId, versionData);
  }

  async getEmailTemplateVersions(templateId: string) {
    return this.email.getTemplateVersions(templateId);
  }

  async sendPersonalizedEmail(emailData: any) {
    return this.email.sendPersonalizedEmail(emailData);
  }

  async getEmailRealTimeMetrics(campaignId: string, timeRange: string = '24h') {
    return this.email.getRealTimeMetrics(campaignId, timeRange);
  }

  async registerEmailWebhook(webhookData: any) {
    return this.email.registerWebhook(webhookData);
  }

  async trackEmailEvent(emailId: string, eventType: string, metadata?: any) {
    return this.email.trackEmailEvent(emailId, eventType, metadata);
  }

  // Analytics endpoints
  async getAnalyticsOverview() {
    return this.analytics.getAnalyticsOverview();
  }

  async getSystemStats() {
    return this.analytics.getSystemStats();
  }

  async getPerformanceMetrics() {
    return this.analytics.getPerformanceMetrics();
  }

  // Workflow endpoints
  async getWorkflows() {
    return this.workflow.getWorkflows();
  }

  async createWorkflow(workflowData: any) {
    return this.workflow.createWorkflow(workflowData);
  }

  async executeWorkflow(id: string) {
    return this.workflow.executeWorkflow(id);
  }

  // Proposal endpoints
  async getProposalTemplates() {
    return this.proposals.getProposalTemplates();
  }

  async generateProposal(proposalData: any) {
    return this.proposals.generateProposal(proposalData);
  }

  async getProposals() {
    return this.proposals.getProposals();
  }

  async exportProposal(proposalId: string, format: string) {
    return this.proposals.exportProposal(proposalId, format);
  }

  // Agent endpoints
  async executeAgentTask(agentType: string, taskType: string, inputData: any) {
    return this.agents.executeTask({
      agent_type: agentType,
      task_type: taskType,
      input_data: inputData
    });
  }

  async generateEmailContent(campaignType: string, audience: any) {
    return this.agents.generateEmailContent(campaignType, audience);
  }

  async generateABVariants(baseMessage: string) {
    return this.agents.generateABVariants(baseMessage);
  }

  async suggestSendTime(audienceProfile: any) {
    return this.agents.suggestSendTime(audienceProfile);
  }

  async scoreLeads(leads?: any[]) {
    return this.agents.scoreLeads(leads);
  }

  async enrichLeads(leadData: any) {
    return this.agents.enrichLeads(leadData);
  }

  async optimizeCampaign(campaignData: any) {
    return this.agents.optimizeCampaign(campaignData);
  }

  async generateSocialContent(platform: string, contentTheme: string, brandVoice?: string) {
    return this.agents.generateSocialContent(platform, contentTheme, brandVoice);
  }
}

export const apiClient = new ApiClient();
