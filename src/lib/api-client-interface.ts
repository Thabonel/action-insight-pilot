
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  budget?: number;
  target_audience?: string;
  timeline?: string;
}

export interface Lead {
  id: string;
  email: string;
  name?: string;
  company?: string;
  score: number;
  status: string;
  source: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  icon: string;
  color: string;
}

export interface Content {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled';
  seo_score?: number;
  readability_score?: number;
  created_at: string;
  updated_at: string;
}

export interface BlogPostParams {
  title: string;
  topic: string;
  keywords: string[];
  tone: string;
  length: 'short' | 'medium' | 'long';
  target_audience: string;
}

export interface ContentBrief {
  title: string;
  content_type: string;
  target_audience: string;
  key_messages: string[];
  platform: string;
  tone?: string;
  length?: string;
  keywords?: string[];
  cta?: string;
}

export interface AnalyticsOverview {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  conversionRate: number;
  totalRevenue: number;
  monthlyGrowth: number;
}

export interface UserPreferences {
  [key: string]: any;
}

export interface UserPreference {
  id: string;
  user_id: string;
  category: string;
  preference_data: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  account_name: string;
  status: 'connected' | 'disconnected' | 'error';
  last_sync: string;
  follower_count?: number;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  last_sync_at?: string;
  config: Record<string, any>;
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  secret?: string;
}
