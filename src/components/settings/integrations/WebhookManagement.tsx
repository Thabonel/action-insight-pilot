
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, Settings, Trash2, TestTube, Loader2 } from 'lucide-react';
import { useIntegrations } from '@/hooks/useIntegrations';
import type { Webhook } from '@/lib/api-client-interface';

const WebhookManagement: React.FC = () => {
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [testingWebhooks, setTestingWebhooks] = useState<Set<string>>(new Set());

  const {
    webhooks,
    loading,
    createWebhook,
    deleteWebhook,
    testWebhook,
    refreshIntegrations
  } = useIntegrations();

  // Ensure webhooks is always an array
  const webhooksList = Array.isArray(webhooks) ? webhooks : [];

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'gray';
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl || !newWebhookName) return;

    setIsCreating(true);
    try {
      await createWebhook({
        name: newWebhookName,
        url: newWebhookUrl,
        events: ['campaign.completed', 'lead.created'],
        active: true
      });
      setNewWebhookUrl('');
      setNewWebhookName('');
    } catch (error) {
      console.error('Failed to create webhook:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    setTestingWebhooks(prev => new Set(prev).add(webhookId));
    try {
      await testWebhook(webhookId);
    } catch (error) {
      console.error('Failed to test webhook:', error);
    } finally {
      setTestingWebhooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(webhookId);
        return newSet;
      });
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await deleteWebhook(webhookId);
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Webhook Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="h-5 w-5" />
          <span>Webhook Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            placeholder="Webhook name"
            value={newWebhookName}
            onChange={(e) => setNewWebhookName(e.target.value)}
          />
          <div className="flex space-x-2">
            <Input
              placeholder="Webhook URL (https://...)"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleCreateWebhook}
              disabled={!newWebhookUrl || !newWebhookName || isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {webhooksList.map(webhook => (
            <div key={webhook.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{webhook.name}</h4>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`text-${getStatusColor(webhook.active)}-600 border-${getStatusColor(webhook.active)}-300`}
                  >
                    {webhook.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestWebhook(webhook.id)}
                    disabled={testingWebhooks.has(webhook.id)}
                  >
                    {testingWebhooks.has(webhook.id) ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <TestTube className="h-3 w-3" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash2 className="h-3 w-3" />
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
              {webhook.last_triggered_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Last triggered: {new Date(webhook.last_triggered_at).toLocaleString()}
                  {webhook.last_response_code && (
                    <span className="ml-2">
                      (Status: {webhook.last_response_code})
                    </span>
                  )}
                </p>
              )}
            </div>
          ))}
          {webhooksList.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No webhooks configured. Create your first webhook above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookManagement;
