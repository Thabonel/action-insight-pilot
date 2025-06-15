
import { ClientCore } from './client-core';

export class WorkflowApi extends ClientCore {
  async getWorkflows() {
    return this.httpClient.request('/api/workflows/list');
  }

  async createWorkflow(workflowData: any) {
    return this.httpClient.request('/api/workflows/create', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  async executeWorkflow(workflowId: string) {
    return this.httpClient.request(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
    });
  }

  async getWorkflowStatus(workflowId: string) {
    return this.httpClient.request(`/api/workflows/${workflowId}/status`);
  }

  async updateWorkflow(workflowId: string, updates: any) {
    return this.httpClient.request(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteWorkflow(workflowId: string) {
    return this.httpClient.request(`/api/workflows/${workflowId}`, {
      method: 'DELETE',
    });
  }
}
