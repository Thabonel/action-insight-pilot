import { useState, useRef, useCallback } from 'react';

interface RateLimitConfig {
  maxRequests: number;
  timeWindow: number; // in milliseconds
  retryAfter?: number; // in milliseconds
}

interface RateLimitState {
  requests: number[];
  blocked: boolean;
  resetTime?: number;
}

interface RateLimiterResult {
  canProceed: boolean;
  remainingRequests: number;
  resetTime?: number;
  error?: string;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'ai-api': { maxRequests: 60, timeWindow: 60000, retryAfter: 1000 }, // 60 requests per minute
  'social-post': { maxRequests: 10, timeWindow: 300000, retryAfter: 30000 }, // 10 posts per 5 minutes
  'auth-attempt': { maxRequests: 5, timeWindow: 900000, retryAfter: 60000 }, // 5 attempts per 15 minutes
  'general': { maxRequests: 100, timeWindow: 60000, retryAfter: 1000 }, // 100 requests per minute
};

export const useRateLimiter = () => {
  const limitStates = useRef<Map<string, RateLimitState>>(new Map());
  const [globalBlocked, setGlobalBlocked] = useState(false);

  const checkRateLimit = useCallback((
    endpoint: string,
    customConfig?: RateLimitConfig
  ): RateLimiterResult => {
    const config = customConfig || DEFAULT_CONFIGS[endpoint] || DEFAULT_CONFIGS.general;
    const now = Date.now();
    
    // Get or create state for this endpoint
    let state = limitStates.current.get(endpoint);
    if (!state) {
      state = { requests: [], blocked: false };
      limitStates.current.set(endpoint, state);
    }

    // Clean old requests outside the time window
    state.requests = state.requests.filter(time => now - time < config.timeWindow);

    // Check if currently blocked
    if (state.blocked && state.resetTime && now < state.resetTime) {
      return {
        canProceed: false,
        remainingRequests: 0,
        resetTime: state.resetTime,
        error: `Rate limited. Try again after ${new Date(state.resetTime).toLocaleTimeString()}`
      };
    }

    // Check if we've exceeded the limit
    if (state.requests.length >= config.maxRequests) {
      state.blocked = true;
      state.resetTime = now + (config.retryAfter || config.timeWindow);
      
      return {
        canProceed: false,
        remainingRequests: 0,
        resetTime: state.resetTime,
        error: `Rate limit exceeded. ${config.maxRequests} requests per ${config.timeWindow/1000}s allowed.`
      };
    }

    // Reset blocked state if retry period has passed
    if (state.blocked && state.resetTime && now >= state.resetTime) {
      state.blocked = false;
      state.resetTime = undefined;
    }

    const remainingRequests = config.maxRequests - state.requests.length;
    
    return {
      canProceed: !state.blocked,
      remainingRequests,
      resetTime: state.resetTime
    };
  }, []);

  const recordRequest = useCallback((endpoint: string): void => {
    const state = limitStates.current.get(endpoint);
    if (state && !state.blocked) {
      state.requests.push(Date.now());
    }
  }, []);

  const resetLimits = useCallback((endpoint?: string): void => {
    if (endpoint) {
      limitStates.current.delete(endpoint);
    } else {
      limitStates.current.clear();
    }
    setGlobalBlocked(false);
  }, []);

  const executeWithRateLimit = useCallback(async <T>(
    endpoint: string,
    operation: () => Promise<T>,
    config?: RateLimitConfig
  ): Promise<T> => {
    const rateLimitResult = checkRateLimit(endpoint, config);
    
    if (!rateLimitResult.canProceed) {
      throw new Error(rateLimitResult.error || 'Rate limit exceeded');
    }

    try {
      recordRequest(endpoint);
      return await operation();
    } catch (error) {
      // Don't record failed requests towards the limit
      const state = limitStates.current.get(endpoint);
      if (state && state.requests.length > 0) {
        state.requests.pop();
      }
      throw error;
    }
  }, [checkRateLimit, recordRequest]);

  const getRateLimitStatus = useCallback((endpoint: string) => {
    const state = limitStates.current.get(endpoint);
    const config = DEFAULT_CONFIGS[endpoint] || DEFAULT_CONFIGS.general;
    
    if (!state) {
      return {
        requests: 0,
        maxRequests: config.maxRequests,
        blocked: false,
        remainingRequests: config.maxRequests
      };
    }

    const now = Date.now();
    const activeRequests = state.requests.filter(time => now - time < config.timeWindow);
    
    return {
      requests: activeRequests.length,
      maxRequests: config.maxRequests,
      blocked: state.blocked,
      remainingRequests: config.maxRequests - activeRequests.length,
      resetTime: state.resetTime
    };
  }, []);

  return {
    checkRateLimit,
    recordRequest,
    resetLimits,
    executeWithRateLimit,
    getRateLimitStatus,
    globalBlocked
  };
};