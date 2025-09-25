
import { HttpClient } from '../http-client';
import { supabase } from '@/integrations/supabase/client';

export interface SocialPlatformConnection {
  id: string;
  user_id: string;
  platform_name: string;
  connection_status: 'connected' | 'disconnected' | 'error';
  platform_user_id?: string;
  platform_username?: string;
  platform: string;
  is_connected: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  token_expires_at?: string;
}

export interface OAuthAuthorizationURL {
  authorization_url: string;
  state: string;
}

export class SocialPlatformsService {
  constructor(private httpClient: HttpClient) {}

  async getPlatformConnections(): Promise<SocialPlatformConnection[]> {
    try {
      // Validate user authentication before making API calls
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Check token expiration
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        throw new Error('Session token expired - please re-authenticate');
      }

      const supabaseUrl = 'https://kciuuxoqxfsogjuqflou.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/social-connections`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Only log errors in development for security
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to get platform connections:', error);
      }
      throw error;
    }
  }

  async initiatePlatformConnection(platform: string) {
    const supabaseUrl = 'https://kciuuxoqxfsogjuqflou.supabase.co';
    
    // Use proper Supabase session management instead of localStorage access
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // Check token expiration
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      throw new Error('Session expired - please re-authenticate');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/social-oauth-initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ platform })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async completePlatformConnection(platform: string, code: string, state: string) {
    // This is handled by the OAuth callback function directly
    // Frontend just needs to listen for the postMessage from the popup
    return { success: true, data: { platform, code, state } };
  }

  async disconnectPlatform(platform: string) {
    const supabaseUrl = 'https://kciuuxoqxfsogjuqflou.supabase.co';
    
    // Use proper Supabase session management instead of localStorage access
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // Check token expiration
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      throw new Error('Session expired - please re-authenticate');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/social-connections/${platform}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async testPlatformConnection(platform: string): Promise<{ success: boolean; data: any }> {
    try {
      // Get the current session to validate authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Validate token expiration
      if (session.expires_at && session.expires_at * 1000 < Date.now()) {
        throw new Error('Session token expired');
      }

      // Test connection by fetching platform connections
      const connections = await this.getPlatformConnections();
      const platformConnection = connections.find(conn => conn.platform === platform);
      
      if (!platformConnection) {
        return { success: false, data: { status: 'not_connected', message: 'Platform not connected' } };
      }

      // Validate connection is active and tokens are not expired
      const isValid = platformConnection.is_connected && 
                     (!platformConnection.expires_at || new Date(platformConnection.expires_at) > new Date());
      
      return { 
        success: isValid, 
        data: { 
          status: isValid ? 'healthy' : 'expired', 
          message: isValid ? 'Connection is working' : 'Connection expired or inactive'
        }
      };
    } catch (error) {
      // Only log errors in development for security
      if (process.env.NODE_ENV === 'development') {
        console.error('Platform connection test failed:', error);
      }
      return { success: false, data: { status: 'error', message: 'Connection test failed' } };
    }
  }

  async syncPlatformData(platform: string) {
    // This would sync data from the platform
    return { success: true, data: { synced_count: 0 } };
  }
}
