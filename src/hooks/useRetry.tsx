
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

interface UseRetryReturn {
  retry: <T>(fn: () => Promise<T>, options?: UseRetryOptions) => Promise<T>;
  isRetrying: boolean;
  retryCount: number;
}

export const useRetry = (): UseRetryReturn => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const retry = useCallback(async <T,>(
    fn: () => Promise<T>,
    options: UseRetryOptions = {}
  ): Promise<T> => {
    const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          setRetryCount(attempt);
          onRetry?.(attempt);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }

        const result = await fn();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt === maxRetries) {
          setIsRetrying(false);
          setRetryCount(0);
          toast({
            title: "Operation Failed",
            description: `Failed after ${maxRetries + 1} attempts. Please try again later.`,
            variant: "destructive",
          });
          throw lastError;
        }
      }
    }

    throw lastError;
  }, [toast]);

  return { retry, isRetrying, retryCount };
};
