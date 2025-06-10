
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAIOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  successMessage?: string;
}

export function useAIOperation<T = any>(options: UseAIOperationOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async (operation: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      
      if (result.success) {
        setData(result.data);
        options.onSuccess?.(result.data);
        
        if (options.successMessage) {
          toast({
            title: "Success",
            description: options.successMessage,
          });
        }
      } else {
        const errorMessage = result.error || 'Operation failed';
        setError(errorMessage);
        options.onError?.(errorMessage);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [options, toast]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
}
