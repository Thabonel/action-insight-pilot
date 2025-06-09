
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, Settings } from 'lucide-react';

interface Webhook {
  id: number;
  name: string;
  url: string;
  events: string[];
  status: string;
}

const WebhookManagement: React.FC = () => {
  const [newWebhook, setNewWebhook] = useState('');

  const webhooks: Webhook[] = [
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'gray';
      default: return 'gray';
    }
  };

  const addWebhook = () => {
    if (newWebhook) {
      console.log('Adding webhook:', newWebhook);
      setNewWebhook('');
    }
  };

  return (
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
  );
};

export default WebhookManagement;
