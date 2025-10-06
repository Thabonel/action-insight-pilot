import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserMode = 'simple' | 'advanced';

interface UserModeHook {
  mode: UserMode;
  isLoading: boolean;
  setMode: (mode: UserMode) => Promise<void>;
  toggleMode: () => Promise<void>;
}

export const useUserMode = (): UserModeHook => {
  const { user } = useAuth();
  const [mode, setModeState] = useState<UserMode>('simple');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserMode();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserMode = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preference_data')
        .eq('user_id', user?.id)
        .eq('preference_category', 'interface')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const savedMode = data?.preference_data?.interface_mode || 'simple';
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
      setModeState(newMode);

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_category: 'interface',
          preference_data: { interface_mode: newMode }
        });

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

  return {
    mode,
    isLoading,
    setMode,
    toggleMode
  };
};
