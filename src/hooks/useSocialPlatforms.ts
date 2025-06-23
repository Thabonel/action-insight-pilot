
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { SocialPlatformConnection } from '@/lib/api-client-interface';

export const useSocialPlatforms = () => {
  const [platforms, setPlatforms] = useState<SocialPlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getSocialPlatforms();
      
      if (result.success && result.data) {
        setPlatforms(result.data);
      } else {
        setError(result.error || 'Failed to fetch social platforms');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchPlatforms();
  }, []);

  return {
    platforms,
    loading,
    error,
    connectPlatform,
    refetch: fetchPlatforms
  };
};
