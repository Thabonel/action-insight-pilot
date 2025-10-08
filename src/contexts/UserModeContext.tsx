import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserMode = 'simple' | 'advanced';

interface UserModeContextType {
  mode: UserMode;
  isLoading: boolean;
  setMode: (mode: UserMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

const UserModeContext = createContext<UserModeContextType | undefined>(undefined);

export const UserModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mode, setModeState] = useState<UserMode>('simple');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserMode();

      // Subscribe to real-time changes
      const subscription = supabase
        .channel('user-mode-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_preferences',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new && payload.new.interface_mode) {
              const newMode = payload.new.interface_mode;
              setModeState(newMode as UserMode);
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserMode = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('interface_mode')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const savedMode = data?.interface_mode || 'simple';
      setModeState(savedMode as UserMode);
    } catch (error) {
      console.error('Error fetching user mode:', error);
      setModeState('simple');
    } finally {
      setIsLoading(false);
    }
  };

  const setMode = async (newMode: UserMode) => {
    if (!user) return;

    try {
      // Optimistically update the UI
      setModeState(newMode);

      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            user_id: user.id,
            interface_mode: newMode
          },
          {
            onConflict: 'user_id'
          }
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user mode:', error);
      // Revert on error
      await fetchUserMode();
    }
  };

  const toggleMode = async () => {
    const newMode = mode === 'simple' ? 'advanced' : 'simple';
    await setMode(newMode);
  };

  return (
    <UserModeContext.Provider value={{ mode, isLoading, setMode, toggleMode }}>
      {children}
    </UserModeContext.Provider>
  );
};

export const useUserMode = (): UserModeContextType => {
  const context = useContext(UserModeContext);
  if (context === undefined) {
    throw new Error('useUserMode must be used within a UserModeProvider');
  }
  return context;
};
