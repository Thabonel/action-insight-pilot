
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface MCPConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

export class MCPService {
  static async getConnections(): Promise<ApiResponse<MCPConnection[]>> {
    try {
      const response = await apiClient.integrations.getConnections();
      return {
        success: response.success,
        data: Array.isArray(response.data) ? response.data : [],
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to get MCP connections'
      };
    }
  }

  static async createConnection(connectionData: Partial<MCPConnection>): Promise<ApiResponse<MCPConnection>> {
    try {
      const response = await apiClient.integrations.createConnection(connectionData);
      return {
        success: response.success,
        data: response.data,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create MCP connection'
      };
    }
  }

  static async deleteConnection(connectionId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.integrations.deleteConnection(connectionId);
      return {
        success: response.success,
        error: response.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete MCP connection'
      };
    }
  }
}
