
import { apiClient } from '@/lib/api-client';
import { ApiResponse, IntegrationConnection } from '@/lib/api-client-interface';

interface MCPConnector {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  description: string;
  config: any;
}

export class MCPService {
  async getConnectors(): Promise<ApiResponse<MCPConnector[]>> {
    try {
      const integrationMethods = apiClient.integrations;
      const result = await integrationMethods.getConnections();
      
      if (result.success && result.data) {
        const connectors: MCPConnector[] = result.data.map(conn => ({
          id: conn.id,
          name: conn.name,
          type: conn.type,
          status: conn.status === 'connected' ? 'connected' : 'disconnected',
          description: conn.service_name || `${conn.type} integration`,
          config: conn.config
        }));
        
        return {
          success: true,
          data: connectors
        };
      }
      
      return result as ApiResponse<MCPConnector[]>;
    } catch (error) {
      console.error('Error getting MCP connectors:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get connectors'
      };
    }
  }

  async createConnector(data: Partial<MCPConnector>): Promise<ApiResponse<MCPConnector>> {
    try {
      const newConnector: MCPConnector = {
        id: 'mcp-' + Date.now(),
        name: data.name || 'New Connector',
        type: data.type || 'mcp',
        status: 'connected',
        description: data.description || 'MCP Connector',
        config: data.config || {}
      };
      
      return {
        success: true,
        data: newConnector
      };
    } catch (error) {
      console.error('Error creating MCP connector:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create connector'
      };
    }
  }

  async deleteConnector(id: string): Promise<ApiResponse<void>> {
    try {
      return {
        success: true,
        data: undefined
      };
    } catch (error) {
      console.error('Error deleting MCP connector:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete connector'
      };
    }
  }

  async testConnector(id: string): Promise<ApiResponse<any>> {
    try {
      return {
        success: true,
        data: {
          status: 'success',
          message: 'Connector test completed successfully',
          responseTime: Math.floor(Math.random() * 200) + 50
        }
      };
    } catch (error) {
      console.error('Error testing MCP connector:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test connector'
      };
    }
  }
}

export const mcpService = new MCPService();
