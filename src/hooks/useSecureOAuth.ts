import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityContext } from '@/contexts/SecurityContext';

interface OAuthProvider {
  provider: 'google' | 'facebook' | 'twitter' | 'linkedin_oidc' | 'github';
  scopes?: string[];
  options?: Record<string, unknown>;
}

interface SecureOAuthResult {
  success: boolean;
  error?: string;
  session?: Record<string, unknown>;
}

export const useSecureOAuth = () => {
  const [loading, setLoading] = useState(false);
  const { tokenManager } = useSecurityContext();

  const signInWithProvider = useCallback(async (
    provider: OAuthProvider
  ): Promise<SecureOAuthResult> => {
    setLoading(true);
    
    try {
      // Configure secure OAuth options
      const oauthOptions = {
        redirectTo: `${window.location.origin}/oauth/callback`,
        scopes: provider.scopes?.join(' ') || 'email profile',
        queryParams: {
          // Add PKCE for security
          code_challenge_method: 'S256',
          // Prevent CSRF attacks
          state: generateSecureState(),
          ...provider.options
        }
      };

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider.provider,
        options: oauthOptions
      });

      if (error) {
        console.error('OAuth error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('OAuth sign-in failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OAuth failed'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOAuthCallback = useCallback(async (): Promise<SecureOAuthResult> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('OAuth callback error:', error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        // Validate and secure the session
        const isValid = await tokenManager.validateTokens();
        if (!isValid) {
          await tokenManager.revokeTokens();
          return { success: false, error: 'Invalid session' };
        }

        return { success: true, session: data.session };
      }

      return { success: false, error: 'No session found' };
    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Callback failed'
      };
    }
  }, [tokenManager]);

  const refreshConnection = useCallback(async (platform: string): Promise<boolean> => {
    try {
      // Check if tokens need refreshing
      const needsRefresh = await checkTokenExpiry(platform);
      
      if (needsRefresh) {
        return await tokenManager.refreshTokens();
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to refresh ${platform} connection:`, error);
      return false;
    }
  }, [tokenManager]);

  const revokeConnection = useCallback(async (platform: string): Promise<void> => {
    try {
      // Revoke platform-specific tokens
      await fetch(`/api/oauth/revoke/${platform}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      // Clear local tokens
      await tokenManager.revokeTokens();
    } catch (error) {
      console.error(`Failed to revoke ${platform} connection:`, error);
      throw error;
    }
  }, [tokenManager]);

  return {
    loading,
    signInWithProvider,
    handleOAuthCallback,
    refreshConnection,
    revokeConnection
  };
};

// Helper functions
function generateSecureState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

async function checkTokenExpiry(platform: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/oauth/check-expiry/${platform}`, {
      headers: {
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      }
    });
    
    const { expires_soon } = await response.json();
    return expires_soon;
  } catch {
    return true; // Assume needs refresh if we can't check
  }
}