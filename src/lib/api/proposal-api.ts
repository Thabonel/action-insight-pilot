
import { ClientCore } from './client-core';
import { ProposalMethods } from './proposal-methods';

export class ProposalApi extends ClientCore {
  private proposalMethods: ProposalMethods;

  constructor() {
    super();
    this.proposalMethods = new ProposalMethods();
  }

  setToken(token: string) {
    super.setToken(token);
    this.proposalMethods.setToken(token);
  }

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
}
