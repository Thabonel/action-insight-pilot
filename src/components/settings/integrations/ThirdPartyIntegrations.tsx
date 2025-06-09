
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap,
  BarChart3,
  Mail,
  MessageSquare,
  ShoppingCart,
  DollarSign,
  Database
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  category: string;
  icon: any;
  status: string;
  description: string;
  lastSync: string;
}

const ThirdPartyIntegrations: React.FC = () => {
  const integrations: Integration[] = [
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'green';
      case 'pending': return 'yellow';
      case 'disconnected': return 'gray';
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
  );
};

export default ThirdPartyIntegrations;
