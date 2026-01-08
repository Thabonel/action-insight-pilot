
import { BaseApiClient } from './base-api-client';
import { AgentsService } from './agents-service';

export interface LeadData {
  [key: string]: unknown;
}

export interface CampaignData {
  [key: string]: unknown;
}

export class AgentMethods extends BaseApiClient {
  private agents: AgentsService;

  constructor() {
    super();
    this.agents = new AgentsService(this.httpClient);
  }

  async executeAgentTask(agentType: string, taskType: string, inputData: Record<string, unknown>) {
    return this.agents.executeTask({
      agent_type: agentType,
      task_type: taskType,
      input_data: inputData
    });
  }

  async scoreLeads(leads?: LeadData[]) {
    return this.agents.scoreLeads(leads);
  }

  async enrichLeads(leadData: LeadData) {
    return this.agents.enrichLeads(leadData);
  }

  async optimizeCampaign(campaignData: CampaignData) {
    return this.agents.optimizeCampaign(campaignData);
  }
}
