
import { HttpClient } from '../http-client';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at?: string;
  last_response_code?: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConnection {
  service_name: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync_at?: string;
  sync_status: 'idle' | 'syncing' | 'error' | 'success';
  configuration?: Record<string, unknown>;
  error_message?: string;
}

export interface ConnectionResult {
  service: string;
  status: string;
  connected_at: string;
  account_info?: Record<string, unknown>;
  message?: string;
}

export class IntegrationsService {
  constructor(private httpClient: HttpClient) {}

  // Webhook Management
  async getWebhooks() {
    return this.httpClient.request<Webhook[]>('/api/integrations/webhooks');
  }

  async createWebhook(webhookData: Partial<Webhook>) {
    return this.httpClient.request<Webhook>('/api/integrations/webhooks', {
      method: 'POST',
      body: JSON.stringify(webhookData),
    });
  }

  async deleteWebhook(webhookId: string) {
    return this.httpClient.request<{ id: string; deleted: boolean }>(`/api/integrations/webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }

  async testWebhook(webhookId: string) {
    return this.httpClient.request<Record<string, unknown>>(`/api/integrations/webhooks/${webhookId}/test`, {
      method: 'POST',
    });
  }

  // Social Media Platform Connectors
  async connectBuffer(apiKey: string) {
    return this.httpClient.request<ConnectionResult>('/api/integrations/buffer/connect', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  async connectHootsuite(apiKey: string) {
    return this.httpClient.request<ConnectionResult>('/api/integrations/hootsuite/connect', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  async connectLater(apiKey: string) {
    return this.httpClient.request<ConnectionResult>('/api/integrations/later/connect', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  async connectSproutSocial(apiKey: string) {
    return this.httpClient.request<ConnectionResult>('/api/integrations/sprout-social/connect', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  async connectVideoPublisher(apiKey: string) {
    return this.httpClient.request<ConnectionResult>('/api/integrations/video-publisher/connect', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  // Third-Party Integrations
  async getConnections() {
    return this.httpClient.request<IntegrationConnection[]>('/api/integrations/connections');
  }

  async createConnection(connectionData: { service_name: string; configuration: Record<string, unknown> }) {
    return this.httpClient.request<ConnectionResult>('/api/integrations/connections', {
      method: 'POST',
      body: JSON.stringify(connectionData),
    });
  }

  async connectService(service: string, apiKey: string) {
    return this.httpClient.request<ConnectionResult>(`/api/integrations/${service}/connect`, {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey }),
    });
  }

  async syncService(service: string) {
    return this.httpClient.request<Record<string, unknown>>(`/api/integrations/${service}/sync`, {
      method: 'POST',
    });
  }

  async deleteConnection(serviceId: string) {
    return this.httpClient.request<Record<string, unknown>>(`/api/integrations/connections/${serviceId}`, {
      method: 'DELETE',
    });
  }

  async disconnectService(service: string) {
    return this.httpClient.request<Record<string, unknown>>(`/api/integrations/${service}/disconnect`, {
      method: 'DELETE',
    });
  }
}
