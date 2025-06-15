
import { BaseApiClient } from './base-api-client';
import { ProposalsService } from './proposals-service';

export class ProposalMethods extends BaseApiClient {
  private proposals: ProposalsService;

  constructor() {
    super();
    this.proposals = new ProposalsService(this.httpClient);
  }

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
}
