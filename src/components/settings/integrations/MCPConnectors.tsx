
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { IntegrationConnection } from '@/lib/api-client-interface';
import { 
  Link, 
  Plus, 
  Settings, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const MCPConnectors: React.FC = () => {
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getConnections();
      if (result.success && result.data) {
        setConnections(result.data);
      } else {
        console.error('Failed to load connections:', result.error);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (connectorType: string) => {
    setActionLoading(connectorType);
    try {
      const result = await apiClient.createConnection({
        name: `${connectorType} Connection`,
        type: connectorType,
        status: 'connected'
      });

      if (result.success) {
        toast({
          title: "Connection established",
          description: `Successfully connected to ${connectorType}`,
        });
        await loadConnections();
      } else {
        throw new Error(result.error || 'Failed to create connection');
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to establish connection",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (connectionId: string, name: string) => {
    setActionLoading(connectionId);
    try {
      const result = await apiClient.deleteConnection(connectionId);
      
      if (result.success) {
        toast({
          title: "Connection removed",
          description: `Successfully disconnected from ${name}`,
        });
        await loadConnections();
      } else {
        throw new Error(result.error || 'Failed to remove connection');
      }
    } catch (error) {
      toast({
        title: "Disconnection failed",
        description: error instanceof Error ? error.message : "Failed to remove connection",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const availableConnectors = [
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Connect your Shopify store for order and customer data',
      icon: '🛍️',
      category: 'E-commerce'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync contacts, deals, and marketing data',
      icon: '🎯',
      category: 'CRM'
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Import leads, opportunities, and customer data',
      icon: '☁️',
      category: 'CRM'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Sync email campaigns and subscriber data',
      icon: '📧',
      category: 'Email Marketing'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Import website traffic and conversion data',
      icon: '📊',
      category: 'Analytics'
    },
    {
      id: 'facebook-ads',
      name: 'Facebook Ads',
      description: 'Connect Facebook advertising campaigns',
      icon: '📱',
      category: 'Advertising'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading connectors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">MCP Connectors</h2>
          <p className="text-gray-600">Connect external services to sync your marketing data</p>
        </div>
        <Button onClick={loadConnections} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Active Connections */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Link className="h-5 w-5" />
              <span>Active Connections</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {availableConnectors.find(c => c.id === connection.type)?.icon || '🔗'}
                    </div>
                    <div>
                      <div className="font-medium">{connection.name}</div>
                      <div className="text-sm text-gray-500">Type: {connection.type}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(connection.status)}
                      <Badge className={getStatusColor(connection.status)}>
                        {connection.status}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDisconnect(connection.id, connection.name)}
                        disabled={actionLoading === connection.id}
                      >
                        {actionLoading === connection.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Connectors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Available Connectors</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableConnectors.map((connector) => {
              const isConnected = connections.some(c => c.type === connector.id && c.status === 'connected');
              
              return (
                <Card key={connector.id} className="relative">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{connector.icon}</div>
                        <div>
                          <div className="font-medium">{connector.name}</div>
                          <Badge variant="secondary" className="text-xs">
                            {connector.category}
                          </Badge>
                        </div>
                      </div>
                      {isConnected && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {connector.description}
                    </p>
                    
                    <Button 
                      className="w-full" 
                      variant={isConnected ? "outline" : "default"}
                      disabled={isConnected || actionLoading === connector.id}
                      onClick={() => handleConnect(connector.id)}
                    >
                      {actionLoading === connector.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : isConnected ? (
                        'Connected'
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPConnectors;
