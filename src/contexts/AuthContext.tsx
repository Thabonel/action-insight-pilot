
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentToken, setCurrentToken] = useState<string>('');

  const updateToken = (newToken: string) => {
    // Only set token if it's different from current token
    if (new
Token !== currentToken) {
      console.log('HTTP Client token updated:', newToken ? 'Token provided' : 'Token cleared');
      apiClient.setToken(newToken);
      setCurrentToken(newToken);
    }
  };

  useEffect(() => {
    // Check current user
    AuthService.getCurrentUser().then(({ user }) => {
      setUser(user);
      if (user) {
        // Get the session to access the token
        const getSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            updateToken(session.access_token);
          }
        };
        getSession();
        behaviorTracker.trackAction('execution', 'auth', { action: 'auto_login', userId: user.id });
      } else {
        updateToken('');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        // Get the session to access the token
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          updateToken(session.access_token);
        }
        behaviorTracker.trackAction('execution', 'auth', { action: 'login', userId: user.id });
      } else {
        updateToken('');
        behaviorTracker.trackAction('execution', 'auth', { action: 'logout' });
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    behaviorTracker.trackAction('planning', 'auth', { action: 'sign_in_attempt' });
    const result = await AuthService.signIn(email, password);
    if (result.data?.user) {
      behaviorTracker.trackAction('success', 'auth', { action: 'sign_in_success' });
    } else {
      behaviorTracker.trackAction('error', 'auth', { action: 'sign_in_failed', error: result.error?.message });
    }
    return result;
  };

  const signUp = async (email: string, password: string) => {
    behaviorTracker.trackAction('planning', 'auth', { action: 'sign_up_attempt' });
    const result = await AuthService.signUp(email, password);
    if (result.data?.user) {
      behaviorTracker.trackAction('success', 'auth', { action: 'sign_up_success' });
    } else {
      behaviorTracker.trackAction('error', 'auth', { action: 'sign_up_failed', error: result.error?.message });
    }
    return result;
  };

  const signOut = async () => {
    behaviorTracker.trackAction('execution', 'auth', { action: 'sign_out_attempt' });
    await AuthService.signOut();
  };

  const resetPassword = async (email: string) => {
    behaviorTracker.trackAction('execution', 'auth', { action: 'password_reset_attempt' });
    return await AuthService.resetPassword(email);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
