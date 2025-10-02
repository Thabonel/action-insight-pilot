import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.rpc('get_current_user_role');
        
        if (error) {
          console.error('Error fetching user role:', error);
          setRole('viewer'); // Default to viewer on error
        } else {
          setRole(data || 'viewer');
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole('viewer');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { role, loading };
};
