
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseErrorHandlerReturn {
  error: string | null;
  loading: boolean;
  handleError: (error: unknown) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  withErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error) {
      errorMessage = error.error;
    }

    setError(errorMessage);
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const clearError = () => {
    setError(null);
  };

  const withErrorHandling = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      clearError();
      const result = await fn();
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    handleError,
    clearError,
    setLoading,
    withErrorHandling,
  };
};
