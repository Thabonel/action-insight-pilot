
import { HttpClient } from '../http-client';

export class ProposalsService {
  constructor(private httpClient: HttpClient) {}

  async getProposalTemplates() {
    return this.httpClient.request('/api/proposals/templates');
  }

  async generateProposal(proposalData: Record<string, unknown>) {
    return this.httpClient.request('/api/proposals/generate', {
      method: 'POST',
      body: JSON.stringify(proposalData),
    });
  }

  async getProposals() {
    return this.httpClient.request('/api/proposals');
  }

  async exportProposal(proposalId: string, format: string) {
    return this.httpClient.request(`/api/proposals/${proposalId}/export`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }
}
