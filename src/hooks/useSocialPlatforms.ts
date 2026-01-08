
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SocialPlatformConnection, ApiResponse } from '@/lib/api-client-interface';

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
      const result = await apiClient.getSocialPlatforms() as ApiResponse<SocialPlatformConnection[]>;
      
      if (result.success && result.data) {
        // Ensure the data matches the SocialPlatformConnection interface
        const validatedData: SocialPlatformConnection[] = result.data.map(item => ({
          ...item,
          status: (item.status === 'connected' || item.status === 'disconnected' || item.status === 'error') 
            ? item.status 
            : 'disconnected' as const,
          connection_status: (item.connection_status === 'connected' || item.connection_status === 'disconnected' || item.connection_status === 'error') 
            ? item.connection_status 
            : 'disconnected' as const
        }));
        
        setPlatforms(validatedData);
        setConnections(validatedData);
      } else {
        setError('Failed to fetch social platforms');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const connectPlatform = async (platform: string, config: Record<string, unknown> = {}) => {
    try {
      const result = await apiClient.connectSocialPlatform({ platform, ...config }) as ApiResponse<Record<string, unknown>>;
      
      if (result.success) {
        await fetchPlatforms(); // Refresh the list
        return result;
      } else {
        throw new Error('Failed to connect platform');
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
