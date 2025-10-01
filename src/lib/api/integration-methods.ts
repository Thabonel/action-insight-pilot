
import { BaseApiClient } from './base-api-client';
import { ApiResponse, IntegrationConnection, Webhook } from '../api-client-interface';

export class IntegrationMethods extends BaseApiClient {
  async getConnections(): Promise<ApiResponse<IntegrationConnection[]>> {
    throw new Error('getConnections not implemented - use Supabase client directly');
  }

  async createConnection(data: any): Promise<ApiResponse<any>> {
    throw new Error('createConnection not implemented - use Supabase client directly');
  }

  async deleteConnection(id: string): Promise<ApiResponse<any>> {
    throw new Error('deleteConnection not implemented - use Supabase client directly');
  }

  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    throw new Error('getWebhooks not implemented - use Supabase client directly');
  }

  async createWebhook(data: Partial<Webhook>): Promise<ApiResponse<Webhook>> {
    throw new Error('createWebhook not implemented - use Supabase client directly');
  }

  async deleteWebhook(id: string): Promise<ApiResponse<any>> {
    throw new Error('deleteWebhook not implemented - use Supabase client directly');
  }

  async testWebhook(id: string): Promise<ApiResponse<any>> {
    throw new Error('testWebhook not implemented - use Supabase client directly');
  }

  async connectService(service: string, apiKey: string): Promise<ApiResponse<any>> {
    throw new Error('connectService not implemented - use Supabase client directly');
  }

  async syncService(service: string): Promise<ApiResponse<any>> {
    throw new Error('syncService not implemented - use Supabase client directly');
  }

  async disconnectService(service: string): Promise<ApiResponse<any>> {
    throw new Error('disconnectService not implemented - use Supabase client directly');
  }
}
