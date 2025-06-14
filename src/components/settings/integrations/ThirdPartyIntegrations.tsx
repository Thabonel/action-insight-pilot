
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ExternalLink, Zap, RefreshCw, Settings, Loader2 } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useToast } from '@/hooks/use-toast';

interface ThirdPartyService {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  icon: string;
  docsUrl: string;
}

const ThirdPartyIntegrations: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const { connectService, syncService, disconnectService, connections } = useIntegrations();
  const { toast } = useToast();

  const services: ThirdPartyService[] = [
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      description: 'Website traffic and user behavior analytics',
      status: 'connected',
      lastSync: '2 hours ago',
      icon: '📊',
      docsUrl: 'https://developers.google.com/analytics'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing and automation platform',
      status: 'connected',
      lastSync: '1 hour ago',
      icon: '📧',
      docsUrl: 'https://mailchimp.com/developer/'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      status: 'disconnected',
      icon: '💬',
      docsUrl: 'https://api.slack.com/'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'E-commerce platform integration',
      status: 'connected',
      lastSync: '30 minutes ago',
      icon: '🛒',
      docsUrl: 'https://shopify.dev/'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Payment processing and revenue tracking',
      status: 'connected',
      lastSync: '15 minutes ago',
      icon: '💳',
      docsUrl: 'https://stripe.com/docs'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'CRM and marketing automation',
      status: 'disconnected',
      icon: '🔄',
      docsUrl: 'https://developers.hubspot.com/'
    }
  ];

  // Ensure connections is always an array
  const safeConnections = Array.isArray(connections) ? connections : [];

  const getServiceStatus = (serviceId: string) => {
    const connection = safeConnections.find(conn => conn.service_name === serviceId);
    return connection?.connection_status || 'disconnected';
  };

  const getLastSync = (serviceId: string) => {
    const connection = safeConnections.find(conn => conn.service_name === serviceId);
    return connection?.last_sync_at ? new Date(connection.last_sync_at).toLocaleString() : null;
  };

  const handleConnect = async (service: ThirdPartyService) => {
    const apiKey = apiKeys[service.id];
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key to connect",
        variant: "destructive",
      });
      return;
    }

    setConnecting(prev => new Set(prev).add(service.id));
    try {
      await connectService(service.id, apiKey);
      setApiKeys(prev => ({ ...prev, [service.id]: '' }));
    } catch (error) {
      console.error(`Failed to connect to ${service.name}:`, error);
    } finally {
      setConnecting(prev => {
        const newSet = new Set(prev);
        newSet.delete(service.id);
        return newSet;
      });
    }
  };

  const handleSync = async (serviceId: string) => {
    setSyncing(prev => new Set(prev).add(serviceId));
    try {
      await syncService(serviceId);
    } catch (error) {
      console.error(`Failed to sync ${serviceId}:`, error);
    } finally {
      setSyncing(prev => {
        const newSet = new Set(prev);
        newSet.delete(serviceId);
        return newSet;
      });
    }
  };

  const handleDisconnect = async (serviceId: string) => {
    try {
      await disconnectService(serviceId);
    } catch (error) {
      console.error(`Failed to disconnect ${serviceId}:`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'disconnected': return 'gray';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Third-Party Integrations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(service => {
            const actualStatus = getServiceStatus(service.id);
            const lastSync = getLastSync(service.id);
            
            return (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`text-${getStatusColor(actualStatus)}-600 border-${getStatusColor(actualStatus)}-300`}
                      >
                        {actualStatus}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={service.docsUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                
                {lastSync && (
                  <p className="text-xs text-gray-500 mb-3">
                    Last synced: {lastSync}
                  </p>
                )}
                
                {actualStatus === 'disconnected' ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full">Connect</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect to {service.name}</DialogTitle>
                        <DialogDescription>
                          Enter your {service.name} API key to connect and start syncing data.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`${service.id}-api-key`}>API Key</Label>
                          <Input
                            id={`${service.id}-api-key`}
                            type="password"
                            placeholder="Enter your API key"
                            value={apiKeys[service.id] || ''}
                            onChange={(e) => setApiKeys(prev => ({ 
                              ...prev, 
                              [service.id]: e.target.value 
                            }))}
                          />
                        </div>
                        <Button 
                          onClick={() => handleConnect(service)}
                          disabled={connecting.has(service.id) || !apiKeys[service.id]}
                          className="w-full"
                        >
                          {connecting.has(service.id) ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Connecting...
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSync(service.id)}
                      disabled={syncing.has(service.id)}
                    >
                      {syncing.has(service.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Sync
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3 mr-1" />
                      Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDisconnect(service.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThirdPartyIntegrations;
