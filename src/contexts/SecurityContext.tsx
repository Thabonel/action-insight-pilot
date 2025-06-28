import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TokenSecurityManager {
  encryptToken: (token: string) => string;
  decryptToken: (encryptedToken: string) => string;
  refreshTokens: () => Promise<boolean>;
  validateTokens: () => Promise<boolean>;
  revokeTokens: () => Promise<void>;
}

interface SecurityContextType {
  tokenManager: TokenSecurityManager;
  securitySettings: {
    autoRefresh: boolean;
    encryptStorage: boolean;
    sessionTimeout: number;
  };
  updateSecuritySettings: (settings: Partial<typeof securitySettings>) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [securitySettings, setSecuritySettings] = useState({
    autoRefresh: true,
    encryptStorage: true,
    sessionTimeout: 3600000, // 1 hour in ms
  });

  // Simple encryption for demonstration (use proper encryption in production)
  const encryptToken = (token: string): string => {
    if (!securitySettings.encryptStorage) return token;
    return btoa(token); // Base64 encoding for demo
  };

  const decryptToken = (encryptedToken: string): string => {
    if (!securitySettings.encryptStorage) return encryptedToken;
    try {
      return atob(encryptedToken);
    } catch {
      return encryptedToken;
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Token refresh failed:', error);
        return false;
      }
      return !!data.session;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const validateTokens = async (): Promise<boolean> => {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session && !isTokenExpired(data.session.expires_at);
    } catch {
      return false;
    }
  };

  const revokeTokens = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('oauth_tokens');
      sessionStorage.clear();
    } catch (error) {
      console.error('Token revocation error:', error);
    }
  };

  const isTokenExpired = (expiresAt: number): boolean => {
    return Date.now() > expiresAt * 1000;
  };

  const updateSecuritySettings = (newSettings: Partial<typeof securitySettings>) => {
    setSecuritySettings(prev => ({ ...prev, ...newSettings }));
  };

  // Auto-refresh tokens
  useEffect(() => {
    if (!securitySettings.autoRefresh) return;

    const interval = setInterval(async () => {
      const isValid = await validateTokens();
      if (!isValid) {
        await refreshTokens();
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [securitySettings.autoRefresh]);

  // Session timeout
  useEffect(() => {
    if (!securitySettings.sessionTimeout) return;

    const timeout = setTimeout(() => {
      revokeTokens();
    }, securitySettings.sessionTimeout);

    return () => clearTimeout(timeout);
  }, [securitySettings.sessionTimeout]);

  const tokenManager: TokenSecurityManager = {
    encryptToken,
    decryptToken,
    refreshTokens,
    validateTokens,
    revokeTokens,
  };

  const value = {
    tokenManager,
    securitySettings,
    updateSecuritySettings,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};