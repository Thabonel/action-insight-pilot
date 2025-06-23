
export interface UserPreferences {
  name?: string;
  domain?: string;
  industry?: string;
  teamSize?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    [key: string]: boolean;
  };
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'error';
  username?: string;
  lastSync?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface EmailMetrics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  budget?: number;
  target_audience?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialPost {
  id: string;
  content: string;
  platform: string;
  scheduledTime: string;
  status: 'scheduled' | 'published' | 'failed';
  campaignId?: string;
  created_at: string;
}

export interface IntegrationConnection {
  service_name: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync_at?: string;
  sync_status: 'idle' | 'syncing' | 'error' | 'success';
  configuration?: Record<string, any>;
  error_message?: string;
}

export interface OAuthResponse {
  authorization_url: string;
  state: string;
}
