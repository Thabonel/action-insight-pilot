
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

interface UserPreferences {
  theme?: string;
  notifications?: boolean;
  language?: string;
  timezone?: string;
  [key: string]: any;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      const userPrefs = await apiClient.userPreferences();
      const result = await userPrefs.getUserPreferences(category) as ApiResponse<UserPreferences>;
      
      if (result.success) {
        setPreferences(result.data || {});
      } else {
        setError('Failed to fetch preferences');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (category: string, data: Partial<UserPreferences>) => {
    try {
      setLoading(true);
      const userPrefs = await apiClient.userPreferences();
      const result = await userPrefs.updateUserPreferences(category, data) as ApiResponse<UserPreferences>;
      
      if (result.success) {
        setPreferences(prev => ({ ...prev, ...data }));
        return { success: true };
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  const resetPreferences = async () => {
    try {
      setLoading(true);
      setPreferences({});
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetPreferences,
    refetch: fetchPreferences
  };
};
