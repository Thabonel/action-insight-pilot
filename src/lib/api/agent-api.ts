
import { ClientCore } from './client-core';
import { AgentMethods } from './agent-methods';

export interface LeadData {
  [key: string]: unknown;
}

export interface CampaignData {
  [key: string]: unknown;
}

export class AgentApi extends ClientCore {
  private agentMethods: AgentMethods;

  constructor() {
    super();
    this.agentMethods = new AgentMethods();
  }

  setToken(token: string) {
    super.setToken(token);
    this.agentMethods.setToken(token);
  }

  async executeAgentTask(agentType: string, taskType: string, inputData: Record<string, unknown>) {
    return this.agentMethods.executeAgentTask(agentType, taskType, inputData);
  }

  async scoreLeads(leads?: LeadData[]) {
    return this.agentMethods.scoreLeads(leads);
  }

  async enrichLeads(leadData: LeadData) {
    return this.agentMethods.enrichLeads(leadData);
  }

  async optimizeCampaign(campaignData: CampaignData) {
    return this.agentMethods.optimizeCampaign(campaignData);
  }
}
