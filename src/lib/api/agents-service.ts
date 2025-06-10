
import { HttpClient } from '../http-client';

export interface AgentTaskRequest {
  agent_type: string;
  task_type: string;
  input_data: Record<string, any>;
}

export interface AgentTaskResponse {
  success: boolean;
  data?: any;
  error?: string;
  task_id?: string;
}

export class AgentsService {
  constructor(private httpClient: HttpClient) {}

  async executeTask(request: AgentTaskRequest): Promise<AgentTaskResponse> {
    return this.httpClient.request('/api/agent/execute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateEmailContent(campaignType: string, audience: Record<string, any>): Promise<any> {
    return this.executeTask({
      agent_type: 'content_creator',
      task_type: 'create_email_content',
      input_data: {
        campaign_type: campaignType,
        target_audience: audience
      }
    });
  }

  async generateABVariants(baseMessage: string): Promise<any> {
    return this.executeTask({
      agent_type: 'campaign_manager',
      task_type: 'generate_ab_variants',
      input_data: { base_message: baseMessage }
    });
  }

  async suggestSendTime(audienceProfile: Record<string, any>): Promise<any> {
    return this.executeTask({
      agent_type: 'campaign_manager',
      task_type: 'suggest_send_time',
      input_data: audienceProfile
    });
  }

  async scoreLeads(leads?: any[]): Promise<any> {
    return this.executeTask({
      agent_type: 'lead_generator',
      task_type: 'score_leads',
      input_data: { leads }
    });
  }

  async enrichLeads(leadData: Record<string, any>): Promise<any> {
    return this.executeTask({
      agent_type: 'lead_generator',
      task_type: 'enrich_lead',
      input_data: leadData
    });
  }

  async optimizeCampaign(campaignData: Record<string, any>): Promise<any> {
    return this.executeTask({
      agent_type: 'campaign_manager',
      task_type: 'optimize_campaign',
      input_data: campaignData
    });
  }

  async generateSocialContent(platform: string, contentTheme: string, brandVoice?: string): Promise<any> {
    return this.executeTask({
      agent_type: 'social_media_manager',
      task_type: 'create_social_post',
      input_data: {
        platform,
        content_theme: contentTheme,
        brand_voice: brandVoice || 'professional'
      }
    });
  }
}
