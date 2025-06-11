
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import type { Webhook, IntegrationConnection } from '@/lib/api/integrations-service';

export function useIntegrations() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const [webhooksResponse, connectionsResponse] = await Promise.all([
        apiClient.integrations.getWebhooks(),
        apiClient.integrations.getConnections()
      ]);

      if (webhooksResponse.success) {
        setWebhooks(webhooksResponse.data || []);
      }

      if (connectionsResponse.success) {
        setConnections(connectionsResponse.data || []);
      }

      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load integrations';
      setError(errorMessage);
      console.error('Error loading integrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async (webhookData: Partial<Webhook>) => {
    try {
      const response = await apiClient.integrations.createWebhook(webhookData);
      if (response.success && response.data) {
        setWebhooks(prev => [...prev, response.data]);
        toast({
          title: "Webhook Created",
          description: "Webhook has been successfully created",
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create webhook');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create webhook';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const response = await apiClient.integrations.deleteWebhook(webhookId);
      if (response.success) {
        setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
        toast({
          title: "Webhook Deleted",
          description: "Webhook has been successfully deleted",
        });
      } else {
        throw new Error(response.error || 'Failed to delete webhook');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete webhook';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const testWebhook = async (webhookId: string) => {
    try {
      const response = await apiClient.integrations.testWebhook(webhookId);
      if (response.success) {
        toast({
          title: "Webhook Test Successful",
          description: "Webhook responded successfully",
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Webhook test failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Webhook test failed';
      toast({
        title: "Webhook Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const connectService = async (service: string, apiKey: string) => {
    try {
      const response = await apiClient.integrations.connectService(service, apiKey);
      if (response.success) {
        await loadIntegrations(); // Reload to get updated connection status
        toast({
          title: "Service Connected",
          description: `Successfully connected to ${service}`,
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to connect service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect service';
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const syncService = async (service: string) => {
    try {
      const response = await apiClient.integrations.syncService(service);
      if (response.success) {
        await loadIntegrations(); // Reload to get updated sync status
        toast({
          title: "Sync Complete",
          description: `Successfully synced data from ${service}`,
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to sync service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync service';
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const disconnectService = async (service: string) => {
    try {
      const response = await apiClient.integrations.disconnectService(service);
      if (response.success) {
        await loadIntegrations(); // Reload to get updated connection status
        toast({
          title: "Service Disconnected",
          description: `Successfully disconnected from ${service}`,
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to disconnect service');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect service';
      toast({
        title: "Disconnection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    webhooks,
    connections,
    loading,
    error,
    createWebhook,
    deleteWebhook,
    testWebhook,
    connectService,
    syncService,
    disconnectService,
    refreshIntegrations: loadIntegrations
  };
}
