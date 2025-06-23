
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication check
    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'Test User'
    };
    
    // Set mock token
    apiClient.setToken('mock-jwt-token');
    
    setUser(mockUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: any }> => {
    setLoading(true);
    try {
      // Mock sign in
      const mockUser = {
        id: '1',
        email,
        name: 'Test User'
      };
      
      apiClient.setToken('mock-jwt-token');
      setUser(mockUser);
      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error?: any }> => {
    setLoading(true);
    try {
      // Mock sign up
      const mockUser = {
        id: '1',
        email,
        name: 'Test User'
      };
      
      apiClient.setToken('mock-jwt-token');
      setUser(mockUser);
      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      apiClient.setToken('');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
