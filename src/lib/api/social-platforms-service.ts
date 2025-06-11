
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
}

export interface OAuthAuthorizationURL {
  authorization_url: string;
  state: string;
}

export class SocialPlatformsService {
  constructor(private httpClient: HttpClient) {}

  async getPlatformConnections() {
    return this.httpClient.request<SocialPlatformConnection[]>('/api/social-platforms/connections');
  }

  async initiatePlatformConnection(platform: string) {
    return this.httpClient.request<OAuthAuthorizationURL>(`/api/social-platforms/${platform}/connect`, {
      method: 'POST',
    });
  }

  async completePlatformConnection(platform: string, code: string, state: string) {
    return this.httpClient.request<SocialPlatformConnection>(`/api/social-platforms/${platform}/callback`, {
      method: 'POST',
      body: JSON.stringify({ code, state }),
    });
  }

  async disconnectPlatform(platform: string) {
    return this.httpClient.request<{ success: boolean }>(`/api/social-platforms/${platform}/disconnect`, {
      method: 'DELETE',
    });
  }

  async testPlatformConnection(platform: string) {
    return this.httpClient.request<{ status: string; message: string }>(`/api/social-platforms/${platform}/test`, {
      method: 'POST',
    });
  }

  async syncPlatformData(platform: string) {
    return this.httpClient.request<{ synced_count: number }>(`/api/social-platforms/${platform}/sync`, {
      method: 'POST',
    });
  }
}
