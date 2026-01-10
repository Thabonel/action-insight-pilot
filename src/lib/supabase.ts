// Use the single supabase client from integrations to avoid multiple GoTrue instances
export { supabase } from '@/integrations/supabase/client';

export type AuthUser = {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export class AuthService {
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  static async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  static onAuthStateChange(callback: (user: unknown) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}
