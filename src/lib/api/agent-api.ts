
import { ClientCore } from './client-core';
import { AgentMethods } from './agent-methods';

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
}
