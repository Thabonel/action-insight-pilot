
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { IntegrationConnection, ApiResponse } from '@/lib/api-client-interface';

const MCPConnectors: React.FC = () => {
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getConnections() as ApiResponse<IntegrationConnection[]>;
      
      if (result.success && result.data) {
        setConnections(result.data);
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConnection = async () => {
    try {
      setActionLoading('create');
      const result = await apiClient.createConnection({
        name: 'New MCP Connection',
        type: 'mcp',
        config: {}
      }) as ApiResponse<IntegrationConnection>;
      
      if (result.success) {
        toast({
          title: "Connection Created",
          description: "Successfully created new MCP connection",
        });
        await fetchConnections();
      } else {
        throw new Error('Creation failed');
      }
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create MCP connection",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConnection = async (id: string) => {
    try {
      setActionLoading(id);
      await apiClient.deleteConnection(id);
      
      toast({
        title: "Connection Deleted",
        description: "Successfully deleted MCP connection",
      });
      await fetchConnections();
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete MCP connection",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MCP Connectors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          MCP Connectors
          <Button
            onClick={handleCreateConnection}
            disabled={actionLoading === 'create'}
            size="sm"
          >
            {actionLoading === 'create' ? 'Creating...' : 'Create Connection'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connections.map((connection) => (
          <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-medium">{connection.name}</h3>
                <p className="text-sm text-gray-500">{connection.type}</p>
              </div>
              <Badge variant={connection.status === 'connected' ? 'default' : 'destructive'}>
                {connection.status}
              </Badge>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteConnection(connection.id)}
              disabled={actionLoading === connection.id}
            >
              {actionLoading === connection.id ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        ))}
        
        {connections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No MCP connections found. Create your first connection to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MCPConnectors;
