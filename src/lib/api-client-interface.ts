
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
  platform_name: string;
  status: 'connected' | 'disconnected' | 'error';
  connection_status: 'connected' | 'disconnected' | 'error';
  username?: string;
  platform_username?: string;
  platform_user_id?: string;
  lastSync?: string;
  last_sync_at?: string;
  token_expires_at?: string;
  connection_metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
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
  // Alternative property names for backward compatibility
  total_sent?: number;
  total_opened?: number;
  total_clicked?: number;
  totalOpened?: number;
  totalClicks?: number;
  // Additional properties for dashboard
  insights?: Array<{
    type: string;
    message: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  trends?: {
    sent?: number[];
    opened?: number[];
    clicked?: number[];
  };
  last_updated?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
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
  scheduled_time?: string; // Alternative property name
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  campaignId?: string;
  created_at: string;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  service_name: string;
  connection_status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync_at?: string;
  sync_status: 'idle' | 'syncing' | 'error' | 'success';
  configuration?: Record<string, any>;
  error_message?: string;
  lastSync?: string;
}

export interface OAuthResponse {
  authorization_url: string;
  state: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
