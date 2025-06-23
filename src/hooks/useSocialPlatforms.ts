
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SocialPlatformConnection } from '@/lib/api-client-interface';

export const useSocialPlatforms = () => {
  const [platforms, setPlatforms] = useState<SocialPlatformConnection[]>([]);
  const [connections, setConnections] = useState<SocialPlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      setIsLoading(true);
      const result = await apiClient.getSocialPlatforms();
      
      if (result.success && result.data) {
        setPlatforms(result.data);
        setConnections(result.data);
      } else {
        setError(result.error || 'Failed to fetch social platforms');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const connectPlatform = async (platform: string, config: any = {}) => {
    try {
      const result = await apiClient.connectSocialPlatform(platform, config);
      
      if (result.success) {
        await fetchPlatforms(); // Refresh the list
        return result;
      } else {
        throw new Error(result.error || 'Failed to connect platform');
      }
    } catch (error) {
      console.error('Failed to connect platform:', error);
      throw error;
    }
  };

  const disconnectPlatform = async (platformId: string) => {
    try {
      // Mock disconnect for now
      setConnections(prev => prev.filter(c => c.id !== platformId));
      return { success: true };
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
      throw error;
    }
  };

  const getPlatformStatus = (platform: string) => {
    const connection = connections.find(c => c.platform === platform);
    return connection?.status || 'disconnected';
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  return {
    platforms,
    connections,
    loading,
    isLoading,
    error,
    connectPlatform,
    disconnectPlatform,
    getPlatformStatus,
    refetch: fetchPlatforms,
    reload: fetchPlatforms
  };
};
