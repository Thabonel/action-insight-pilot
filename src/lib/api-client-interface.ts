
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
  response?: T; // Add this for compatibility
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'draft' | 'completed' | 'archived';
  description?: string;
  channel?: string;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailMetrics {
  totalSent: number;
  totalOpened: number;
  totalClicks: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  engagement_score: number;
  trends?: {
    sent: number[];
    opened: number[];
    clicked: number[];
  };
  insights?: Array<{
    type: string;
    message: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
  last_updated?: string;
}

export interface UserPreferences {
  id?: string;
  user_id?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at?: string;
}

export interface SocialPost {
  id?: string;
  content: string;
  platform: string;
  scheduled_time: string;
  status: 'draft' | 'scheduled' | 'published';
  tags?: string[];
  created_at?: string;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected';
  config?: any;
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  status: 'connected' | 'disconnected';
  authorization_url?: string;
  config?: any;
}
