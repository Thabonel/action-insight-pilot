
import { HttpClient } from '../http-client';

export class WorkflowService {
  constructor(private httpClient: HttpClient) {}

  async getWorkflows() {
    return this.httpClient.request('/api/workflow/list');
  }

  async createWorkflow(workflowData: Record<string, unknown>) {
    return this.httpClient.request('/api/workflow/create', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async executeWorkflow(id: string) {
    return this.httpClient.request(`/api/workflow/${id}/execute`, {
      method: 'POST',
    });
  }
}
