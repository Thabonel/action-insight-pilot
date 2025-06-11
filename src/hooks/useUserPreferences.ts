
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export function useUserPreferences<T = Record<string, any>>(category: string, defaultValues: T) {
  const [preferences, setPreferences] = useState<T>(defaultValues);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPreferences();
  }, [category]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.userPreferences.getUserPreferences(category);
      if (response.success && response.data && response.data.length > 0) {
        setPreferences({ ...defaultValues, ...response.data[0].preference_data });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<T>) => {
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      const response = await apiClient.userPreferences.updateUserPreferences(category, updatedPreferences);
      
      if (response.success) {
        setPreferences(updatedPreferences);
        toast({
          title: "Preferences Updated",
          description: "Your preferences have been saved successfully.",
        });
      } else {
        throw new Error(response.error || 'Failed to update preferences');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetPreferences = () => {
    setPreferences(defaultValues);
  };

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    isLoading,
    error,
    reload: loadPreferences
  };
}
