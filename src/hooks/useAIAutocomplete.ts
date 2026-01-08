import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

export interface AutocompleteContext {
  campaignType?: string;
  industry?: string;
  product?: string;
  targetAudience?: string;
  [key: string]: unknown;
}

export const useAIAutocomplete = (
  field: string,
  context: AutocompleteContext = {},
  delay: number = 300
) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(
    debounce(async (currentValue: string) => {
      if (!currentValue || currentValue.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.functions.invoke('ai-autocomplete', {
          body: {
            field,
            currentValue,
            context,
            userId: user.id
          }
        });

        if (error) throw error;

        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error('Error fetching autocomplete suggestions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, delay),
    [field, context, delay]
  );

  const getSuggestions = useCallback((value: string) => {
    fetchSuggestions(value);
  }, [fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
  }, [fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    getSuggestions,
    clearSuggestions
  };
};