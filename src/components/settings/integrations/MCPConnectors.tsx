import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Zap, RefreshCw, Settings, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface MCPConnector {
  id: string;
  name: string;
  description: string;
  category: 'crm' | 'marketing' | 'social' | 'ecommerce' | 'analytics' | 'content' | 'communication' | 'seo' | 'support' | 'project';
  status: 'connected' | 'disconnected' | 'error' | 'checking';
  icon: string;
  authType: 'oauth' | 'api_key' | 'token';
  docsUrl: string;
  features: string[];
}

const MCPConnectors: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('crm');
  const [connectors, setConnectors] = useState<MCPConnector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const baseConnectors: Omit<MCPConnector, 'status'>[] = [
    // CRM
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Complete CRM platform with marketing automation',
      category: 'crm',
      icon: '🔄',
      authType: 'oauth',
      docsUrl: 'https://developers.hubspot.com/',
      features: ['Contact Management', 'Deal Tracking', 'Email Sequences', 'Analytics']
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Enterprise CRM and customer platform',
      category: 'crm',
      icon: '☁️',
      authType: 'oauth',
      docsUrl: 'https://developer.salesforce.com/',
      features: ['Lead Management', 'Opportunity Tracking', 'Reports', 'Automation']
    },
    {
      id: 'pipedrive',
      name: 'Pipedrive',
      description: 'Sales-focused CRM platform',
      category: 'crm',
      icon: '📊',
      authType: 'api_key',
      docsUrl: 'https://developers.pipedrive.com/',
      features: ['Pipeline Management', 'Activity Tracking', 'Email Integration']
    },
    
    // Marketing Automation
    {
      id: 'marketo',
      name: 'Marketo',
      description: 'Marketing automation and lead management',
      category: 'marketing',
      icon: '🎯',
      authType: 'api_key',
      docsUrl: 'https://developers.marketo.com/',
      features: ['Lead Scoring', 'Email Campaigns', 'Landing Pages', 'Analytics']
    },
    {
      id: 'pardot',
      name: 'Pardot',
      description: 'B2B marketing automation by Salesforce',
      category: 'marketing',
      icon: '📈',
      authType: 'oauth',
      docsUrl: 'https://developer.pardot.com/',
      features: ['Lead Nurturing', 'Email Marketing', 'ROI Reporting']
    },
    {
      id: 'activecampaign',
      name: 'ActiveCampaign',
      description: 'Email marketing and marketing automation',
      category: 'marketing',
      icon: '✉️',
      authType: 'api_key',
      docsUrl: 'https://developers.activecampaign.com/',
      features: ['Email Automation', 'CRM', 'Machine Learning', 'Site Tracking']
    },
    // Social Media
    {
      id: 'facebook_business',
      name: 'Meta Business',
      description: 'Facebook and Instagram business management',
      category: 'social',
      icon: '👥',
      authType: 'oauth',
      docsUrl: 'https://developers.facebook.com/',
      features: ['Ad Management', 'Page Insights', 'Content Publishing', 'Audience Analytics']
    },
    {
      id: 'twitter_business',
      name: 'X Business',
      description: 'Twitter/X business and advertising platform',
      category: 'social',
      icon: '🐦',
      authType: 'oauth',
      docsUrl: 'https://developer.twitter.com/',
      features: ['Tweet Scheduling', 'Analytics', 'Ad Campaigns', 'Audience Insights']
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Video content management and analytics',
      category: 'social',
      icon: '📺',
      authType: 'oauth',
      docsUrl: 'https://developers.google.com/youtube/',
      features: ['Video Upload', 'Analytics', 'Channel Management', 'Live Streaming']
    },

    // E-commerce
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      description: 'WordPress e-commerce platform',
      category: 'ecommerce',
      icon: '🛒',
      authType: 'api_key',
      docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
      features: ['Product Management', 'Order Processing', 'Customer Data', 'Inventory']
    },
    {
      id: 'magento',
      name: 'Magento',
      description: 'Enterprise e-commerce platform',
      category: 'ecommerce',
      icon: '🏪',
      authType: 'api_key',
      docsUrl: 'https://devdocs.magento.com/',
      features: ['Catalog Management', 'Order Management', 'Customer Segmentation']
    },

    // Analytics
    {
      id: 'google_ads',
      name: 'Google Ads',
      description: 'Google advertising platform',
      category: 'analytics',
      icon: '🎯',
      authType: 'oauth',
      docsUrl: 'https://developers.google.com/google-ads/',
      features: ['Campaign Management', 'Keyword Research', 'Performance Analytics']
    },
    {
      id: 'facebook_ads',
      name: 'Meta Ads',
      description: 'Facebook and Instagram advertising',
      category: 'analytics',
      icon: '📊',
      authType: 'oauth',
      docsUrl: 'https://developers.facebook.com/docs/marketing-apis/',
      features: ['Ad Creation', 'Audience Targeting', 'Performance Tracking']
    },

    // Content Management
    {
      id: 'wordpress',
      name: 'WordPress',
      description: 'Content management system',
      category: 'content',
      icon: '📝',
      authType: 'api_key',
      docsUrl: 'https://developer.wordpress.org/rest-api/',
      features: ['Post Management', 'Media Library', 'User Management', 'SEO']
    },
    {
      id: 'contentful',
      name: 'Contentful',
      description: 'Headless content management platform',
      category: 'content',
      icon: '📚',
      authType: 'api_key',
      docsUrl: 'https://www.contentful.com/developers/',
      features: ['Content Delivery', 'Asset Management', 'Localization', 'Webhooks']
    },

    // Communication
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS and voice communication platform',
      category: 'communication',
      icon: '📱',
      authType: 'api_key',
      docsUrl: 'https://www.twilio.com/docs/',
      features: ['SMS Marketing', 'Voice Calls', 'WhatsApp Business', 'Verification']
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Email delivery and marketing platform',
      category: 'communication',
      icon: '📧',
      authType: 'api_key',
      docsUrl: 'https://docs.sendgrid.com/',
      features: ['Email Delivery', 'Templates', 'Analytics', 'List Management']
    },

    // SEO Tools
    {
      id: 'semrush',
      name: 'SEMrush',
      description: 'SEO and competitive research platform',
      category: 'seo',
      icon: '🔍',
      authType: 'api_key',
      docsUrl: 'https://developer.semrush.com/',
      features: ['Keyword Research', 'Backlink Analysis', 'Site Audit', 'Competitor Analysis']
    },
    {
      id: 'ahrefs',
      name: 'Ahrefs',
      description: 'SEO toolset for backlinks and keywords',
      category: 'seo',
      icon: '🔗',
      authType: 'api_key',
      docsUrl: 'https://ahrefs.com/api/',
      features: ['Backlink Monitoring', 'Keyword Tracking', 'Content Explorer', 'Site Explorer']
    }
  ];

  const categories = [
    { id: 'crm', name: 'CRM', icon: '👥' },
    { id: 'marketing', name: 'Marketing', icon: '📈' },
    { id: 'social', name: 'Social Media', icon: '📱' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛒' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'content', name: 'Content', icon: '📝' },
    { id: 'communication', name: 'Communication', icon: '💬' },
    { id: 'seo', name: 'SEO Tools', icon: '🔍' }
  ];

  useEffect(() => {
    loadConnectorStatuses();
  }, []);

  const loadConnectorStatuses = async () => {
    setIsLoading(true);
    try {
      // Check existing integration connections
      const connections = await apiClient.integrations.getConnections().catch(() => []);
      
      const connectorsWithStatus = baseConnectors.map(connector => ({
        ...connector,
        status: connections.find(c => c.service_name === connector.id)?.connection_status === 'connected' 
          ? 'connected' as const
          : 'disconnected' as const
      }));

      setConnectors(connectorsWithStatus);
    } catch (error) {
      console.error('Failed to load connector statuses:', error);
      // Set all to disconnected on error
      const connectorsWithStatus = baseConnectors.map(connector => ({
        ...connector,
        status: 'disconnected' as const
      }));
      setConnectors(connectorsWithStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (connector: MCPConnector) => {
    const apiKey = apiKeys[connector.id];
    if (connector.authType === 'api_key' && !apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key to connect",
        variant: "destructive",
      });
      return;
    }

    setConnecting(prev => new Set(prev).add(connector.id));
    
    // Update connector status to checking
    setConnectors(prev => prev.map(c => 
      c.id === connector.id ? { ...c, status: 'checking' as const } : c
    ));

    try {
      await apiClient.integrations.createConnection({
        service_name: connector.id,
        configuration: {
          api_key: apiKey,
          auth_type: connector.authType
        }
      });
      
      // Update connector status to connected
      setConnectors(prev => prev.map(c => 
        c.id === connector.id ? { ...c, status: 'connected' as const } : c
      ));
      
      toast({
        title: "Connected Successfully",
        description: `Successfully connected to ${connector.name}`,
      });
      
      if (connector.authType === 'api_key') {
        setApiKeys(prev => ({ ...prev, [connector.id]: '' }));
      }
    } catch (error) {
      console.error('Connection failed:', error);
      
      // Update connector status to error
      setConnectors(prev => prev.map(c => 
        c.id === connector.id ? { ...c, status: 'error' as const } : c
      ));
      
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${connector.name}`,
        variant: "destructive",
      });
    } finally {
      setConnecting(prev => {
        const newSet = new Set(prev);
        newSet.delete(connector.id);
        return newSet;
      });
    }
  };

  const handleDisconnect = async (connector: MCPConnector) => {
    setConnecting(prev => new Set(prev).add(connector.id));
    
    try {
      await apiClient.integrations.deleteConnection(connector.id);
      
      // Update connector status to disconnected
      setConnectors(prev => prev.map(c => 
        c.id === connector.id ? { ...c, status: 'disconnected' as const } : c
      ));
      
      toast({
        title: "Disconnected Successfully",
        description: `Disconnected from ${connector.name}`,
      });
    } catch (error) {
      console.error('Disconnection failed:', error);
      toast({
        title: "Disconnection Failed",
        description: `Failed to disconnect from ${connector.name}`,
        variant: "destructive",
      });
    } finally {
      setConnecting(prev => {
        const newSet = new Set(prev);
        newSet.delete(connector.id);
        return newSet;
      });
    }
  };

  const handleOAuthConnect = (connector: MCPConnector) => {
    // For OAuth connectors, open OAuth flow
    const authUrl = `https://oauth.${connector.id}.com/authorize?client_id=your_client_id&redirect_uri=${encodeURIComponent(window.location.origin)}/oauth/callback/${connector.id}`;
    window.open(authUrl, '_blank', 'width=600,height=400');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-gray-600';
      case 'error': return 'text-red-600';
      case 'checking': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking': return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>MCP Connectors</span>
          </CardTitle>
          <p className="text-sm text-gray-600">Loading connector status...</p>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredConnectors = connectors.filter(c => c.category === activeCategory);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>MCP Connectors</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Connect to various platforms using Model Context Protocol (MCP) for enhanced AI capabilities
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <span className="mr-1">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnectors.map(connector => (
                  <div key={connector.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{connector.icon}</span>
                        <div>
                          <h3 className="font-medium">{connector.name}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(connector.status)}
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(connector.status)}
                            >
                              {connector.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={connector.docsUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    
                    <p className="text-sm text-gray-600">{connector.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {connector.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {connector.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{connector.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    {connector.status === 'disconnected' || connector.status === 'error' ? (
                      <div className="space-y-2">
                        {connector.authType === 'oauth' ? (
                          <Button 
                            onClick={() => handleOAuthConnect(connector)}
                            disabled={connecting.has(connector.id)}
                            className="w-full"
                          >
                            {connecting.has(connector.id) ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Connecting...
                              </>
                            ) : (
                              'Connect with OAuth'
                            )}
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="w-full">Connect</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Connect to {connector.name}</DialogTitle>
                                <DialogDescription>
                                  Enter your {connector.name} API key to connect and start using MCP features.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor={`${connector.id}-api-key`}>API Key</Label>
                                  <Input
                                    id={`${connector.id}-api-key`}
                                    type="password"
                                    placeholder="Enter your API key"
                                    value={apiKeys[connector.id] || ''}
                                    onChange={(e) => setApiKeys(prev => ({ 
                                      ...prev, 
                                      [connector.id]: e.target.value 
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium">Available Features:</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {connector.features.map((feature, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <Button 
                                  onClick={() => handleConnect(connector)}
                                  disabled={connecting.has(connector.id) || !apiKeys[connector.id]}
                                  className="w-full"
                                >
                                  {connecting.has(connector.id) ? (
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
                        )}
                      </div>
                    ) : connector.status === 'connected' ? (
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => loadConnectorStatuses()}
                          disabled={connecting.has(connector.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDisconnect(connector)}
                          disabled={connecting.has(connector.id)}
                        >
                          {connecting.has(connector.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            'Disconnect'
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center space-x-2 text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Checking status...</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MCPConnectors;
