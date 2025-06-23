
import { apiClient } from '@/lib/api-client';
import { ApiResponse, IntegrationConnection } from '@/lib/api-client-interface';

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
      
      if (response.success && response.data) {
        const mcpConnections: MCPConnection[] = response.data.map((conn: IntegrationConnection) => ({
          id: conn.service_name,
          name: conn.service_name,
          type: 'mcp',
          status: conn.connection_status,
          lastSync: conn.last_sync_at
        }));
        
        return {
          success: true,
          data: mcpConnections
        };
      }
      
      return {
        success: false,
        data: [],
        error: response.error || 'Failed to get MCP connections'
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
      
      if (response.success && response.data) {
        const mcpConnection: MCPConnection = {
          id: response.data.service_name,
          name: response.data.service_name,
          type: 'mcp',
          status: response.data.connection_status,
          lastSync: response.data.last_sync_at
        };
        
        return {
          success: true,
          data: mcpConnection
        };
      }
      
      return {
        success: false,
        error: response.error || 'Failed to create MCP connection'
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
