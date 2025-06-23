
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, IntegrationConnection, Webhook } from '@/lib/api-client-interface';

export const useIntegrations = () => {
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const result = await apiClient.integrations.getConnections();
      if (result.success && result.data) {
        setConnections(result.data);
      } else {
        setError(result.error || 'Failed to fetch connections');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const result = await apiClient.integrations.getWebhooks();
      if (result.success && result.data) {
        setWebhooks(result.data);
      } else {
        setError(result.error || 'Failed to fetch webhooks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const connectService = async (service: string, apiKey: string) => {
    try {
      setLoading(true);
      const result = await apiClient.integrations.connectService(service, apiKey);
      if (result.success) {
        await fetchConnections();
        return { success: true };
      } else {
        const errorMsg = result.error || 'Failed to connect service';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const syncService = async (service: string) => {
    try {
      setLoading(true);
      const result = await apiClient.integrations.syncService(service);
      if (result.success) {
        await fetchConnections();
        return { success: true };
      } else {
        const errorMsg = result.error || 'Failed to sync service';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const disconnectService = async (service: string) => {
    try {
      setLoading(true);
      const result = await apiClient.integrations.disconnectService(service);
      if (result.success) {
        await fetchConnections();
        return { success: true };
      } else {
        const errorMsg = result.error || 'Failed to disconnect service';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async (webhookData: Partial<Webhook>) => {
    try {
      setLoading(true);
      const result = await apiClient.integrations.createWebhook(webhookData);
      if (result.success) {
        await fetchWebhooks();
        return { success: true, data: result.data };
      } else {
        const errorMsg = result.error || 'Failed to create webhook';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      setLoading(true);
      const result = await apiClient.integrations.deleteWebhook(id);
      if (result.success) {
        await fetchWebhooks();
        return { success: true };
      } else {
        const errorMsg = result.error || 'Failed to delete webhook';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async (id: string) => {
    try {
      setLoading(true);
      const result = await apiClient.integrations.testWebhook(id);
      if (result.success) {
        return { success: true };
      } else {
        const errorMsg = result.error || 'Failed to test webhook';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Add the missing refreshIntegrations method
  const refreshIntegrations = async () => {
    await fetchConnections();
    await fetchWebhooks();
  };

  useEffect(() => {
    fetchConnections();
    fetchWebhooks();
  }, []);

  return {
    connections,
    webhooks,
    loading,
    error,
    connectService,
    syncService,
    disconnectService,
    createWebhook,
    deleteWebhook,
    testWebhook,
    refreshIntegrations, // Add this method
    refetch: () => {
      fetchConnections();
      fetchWebhooks();
    }
  };
};
