
import { BaseApiClient } from './base-api-client';
import { AgentsService } from './agents-service';

export class AgentMethods extends BaseApiClient {
  private agents: AgentsService;

  constructor() {
    super();
    this.agents = new AgentsService(this.httpClient);
  }

  async executeAgentTask(agentType: string, taskType: string, inputData: any) {
    return this.agents.executeTask({
      agent_type: agentType,
      task_type: taskType,
      input_data: inputData
    });
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
}
