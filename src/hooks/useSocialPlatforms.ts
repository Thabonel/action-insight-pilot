
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import type { SocialPlatformConnection } from '@/lib/api/social-platforms-service';

export function useSocialPlatforms() {
  const [connections, setConnections] = useState<SocialPlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.socialPlatforms.getPlatformConnections();
      if (response.success && response.data) {
        setConnections(response.data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform connections');
      console.error('Error loading platform connections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const connectPlatform = async (platform: string) => {
    try {
      const response = await apiClient.socialPlatforms.initiatePlatformConnection(platform);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to initiate connection');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect platform';
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const disconnectPlatform = async (platform: string) => {
    try {
      const response = await apiClient.socialPlatforms.disconnectPlatform(platform);
      if (response.success) {
        await loadConnections();
        toast({
          title: "Platform Disconnected",
          description: `Successfully disconnected from ${platform}`,
        });
      } else {
        throw new Error(response.error || 'Failed to disconnect platform');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect platform';
      toast({
        title: "Disconnection Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const testConnection = async (platform: string) => {
    try {
      const response = await apiClient.socialPlatforms.testPlatformConnection(platform);
      if (response.success && response.data) {
        toast({
          title: "Connection Test",
          description: response.data.message,
        });
      }
    } catch (err) {
      toast({
        title: "Connection Test Failed",
        description: "Unable to verify platform connection",
        variant: "destructive",
      });
    }
  };

  const getPlatformStatus = (platform: string): 'connected' | 'disconnected' | 'error' => {
    const connection = connections.find(conn => conn.platform_name === platform);
    return connection?.connection_status || 'disconnected';
  };

  return {
    connections,
    isLoading,
    error,
    connectPlatform,
    disconnectPlatform,
    testConnection,
    getPlatformStatus,
    reload: loadConnections
  };
}
