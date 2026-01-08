import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kciuuxoqxfsogjuqflou.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjaXV1eG9xeGZzb2dqdXFmbG91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0Mzg4MDMsImV4cCI6MjA2NDAxNDgwM30.xLArvJytF37HKDMnr8O1euf_t_M_iRFy55_D9CI1DC0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
