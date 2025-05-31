
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Plus, 
  Settings, 
  ExternalLink, 
  Key,
  Globe,
  Database,
  Mail,
  MessageSquare,
  BarChart3,
  ShoppingCart,
  DollarSign
} from 'lucide-react';

const IntegrationSettings: React.FC = () => {
  const [newWebhook, setNewWebhook] = useState('');
  const [showApiKeys, setShowApiKeys] = useState(false);

  const integrations = [
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'Analytics',
      icon: BarChart3,
      status: 'connected',
      description: 'Track website performance and user behavior',
      lastSync: '2 minutes ago'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      category: 'Email',
      icon: Mail,
      status: 'connected',
      description: 'Sync email lists and campaign data',
      lastSync: '1 hour ago'
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'Communication',
      icon: MessageSquare,
      status: 'pending',
      description: 'Get notifications and updates in Slack',
      lastSync: 'Never'
    },
    {
      id: 'shopify',
      name: 'Shopify',
      category: 'E-commerce',
      icon: ShoppingCart,
      status: 'disconnected',
      description: 'Sync product data and sales information',
      lastSync: 'Never'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'Payments',
      icon: DollarSign,
      status: 'connected',
      description: 'Track revenue and payment analytics',
      lastSync: '5 minutes ago'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      category: 'CRM',
      icon: Database,
      status: 'disconnected',
      description: 'Sync contacts and lead information',
      lastSync: 'Never'
    }
  ];

  const webhooks = [
    {
      id: 1,
      name: 'Campaign Completed',
      url: 'https://api.company.com/webhooks/campaign-complete',
      events: ['campaign.completed', 'campaign.paused'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Lead Generated',
      url: 'https://api.company.com/webhooks/new-lead',
      events: ['lead.created', 'lead.qualified'],
      status: 'active'
    },
    {
      id: 3,
      name: 'Performance Alert',
      url: 'https://api.company.com/webhooks/alerts',
      events: ['performance.threshold', 'budget.exceeded'],
      status: 'inactive'
    }
  ];

  const apiEndpoints = [
    { method: 'GET', endpoint: '/api/campaigns', description: 'List all campaigns' },
    { method: 'POST', endpoint: '/api/campaigns', description: 'Create new campaign' },
    { method: 'GET', endpoint: '/api/leads', description: 'Retrieve leads data' },
    { method: 'POST', endpoint: '/api/content', description: 'Generate content' },
    { method: 'GET', endpoint: '/api/analytics', description: 'Get analytics data' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'pending': return 'yellow';
      case 'disconnected': return 'gray';
      case 'active': return 'green';
      case 'inactive': return 'gray';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Analytics': return BarChart3;
      case 'Email': return Mail;
      case 'Communication': return MessageSquare;
      case 'E-commerce': return ShoppingCart;
      case 'Payments': return DollarSign;
      case 'CRM': return Database;
      default: return Globe;
    }
  };

  const addWebhook = () => {
    if (newWebhook) {
      console.log('Adding webhook:', newWebhook);
      setNewWebhook('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Third-Party Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Third-Party Integrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map(integration => {
              const Icon = integration.icon;
              return (
                <div key={integration.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-gray-600">{integration.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-${getStatusColor(integration.status)}-600 border-${getStatusColor(integration.status)}-300`}>
                      {integration.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Last sync: {integration.lastSync}</span>
                    <Button variant="outline" size="sm">
                      {integration.status === 'connected' ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Webhook Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Webhook URL (https://...)"
              value={newWebhook}
              onChange={(e) => setNewWebhook(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addWebhook}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {webhooks.map(webhook => (
              <div key={webhook.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{webhook.name}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={`text-${getStatusColor(webhook.status)}-600 border-${getStatusColor(webhook.status)}-300`}>
                      {webhook.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{webhook.url}</p>
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="secondary" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Access & Documentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">API Keys</h4>
              <p className="text-sm text-gray-600">Manage your API authentication keys</p>
            </div>
            <Button variant="outline" onClick={() => setShowApiKeys(!showApiKeys)}>
              {showApiKeys ? 'Hide' : 'Show'} Keys
            </Button>
          </div>

          {showApiKeys && (
            <div className="space-y-3">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Production API Key</h5>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
                <code className="text-sm bg-gray-100 p-2 rounded block">mk_prod_12345...abcdef</code>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Development API Key</h5>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
                <code className="text-sm bg-gray-100 p-2 rounded block">mk_dev_67890...uvwxyz</code>
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">API Endpoints</h4>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-2" />
                Full Documentation
              </Button>
            </div>
            <div className="space-y-2">
              {apiEndpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center space-x-4 p-2 bg-gray-50 rounded">
                  <Badge variant="outline" className={`${
                    endpoint.method === 'GET' ? 'text-green-600 border-green-300' :
                    endpoint.method === 'POST' ? 'text-blue-600 border-blue-300' :
                    'text-orange-600 border-orange-300'
                  }`}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono">{endpoint.endpoint}</code>
                  <span className="text-sm text-gray-600 flex-1">{endpoint.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Synchronization</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Real-time Sync</h4>
                <p className="text-sm text-gray-600">Sync data immediately when changes occur</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Batch Processing</h4>
                <p className="text-sm text-gray-600">Process data in scheduled batches</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Data Validation</h4>
                <p className="text-sm text-gray-600">Validate data integrity during sync</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Error Retry</h4>
                <p className="text-sm text-gray-600">Automatically retry failed syncs</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationSettings;
