import { AuthError as SupabaseAuthError } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResponse {
  error?: SupabaseAuthError | AuthError;
}

export interface ValidationData {
  success: boolean;
  errors?: string[];
}
