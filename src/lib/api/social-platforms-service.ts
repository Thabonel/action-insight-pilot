
import { HttpClient } from '../http-client';

export interface SocialPlatformConnection {
  id: string;
  user_id: string;
  platform_name: string;
  connection_status: 'connected' | 'disconnected' | 'error';
  platform_user_id?: string;
  platform_username?: string;
  connection_metadata: Record<string, any>;
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

  async getPlatformConnections() {
    const supabaseUrl = 'https://kciuuxoqxfsogjuqflou.supabase.co';
    const response = await fetch(`${supabaseUrl}/functions/v1/social-connections`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async initiatePlatformConnection(platform: string) {
    const supabaseUrl = 'https://kciuuxoqxfsogjuqflou.supabase.co';
    
    // Get current user token from Supabase auth
    const token = localStorage.getItem('sb-kciuuxoqxfsogjuqflou-auth-token');
    let authToken = '';
    
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed.access_token;
      } catch (e) {
        console.error('Failed to parse auth token:', e);
        throw new Error('Authentication required');
      }
    } else {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/social-oauth-initiate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
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
    
    const token = localStorage.getItem('sb-kciuuxoqxfsogjuqflou-auth-token');
    let authToken = '';
    
    if (token) {
      try {
        const parsed = JSON.parse(token);
        authToken = parsed.access_token;
      } catch (e) {
        console.error('Failed to parse auth token:', e);
        throw new Error('Authentication required');
      }
    } else {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/social-connections/${platform}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
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

  async testPlatformConnection(platform: string) {
    // This would make an actual API call to the platform to test the connection
    return { success: true, data: { status: 'healthy', message: 'Connection is working' } };
  }

  async syncPlatformData(platform: string) {
    // This would sync data from the platform
    return { success: true, data: { synced_count: 0 } };
  }
}
