
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
  platform?: string;
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
  connection_status: 'connected' | 'disconnected' | 'error';
  last_sync: string;
  follower_count?: number;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  service_name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  connection_status: 'connected' | 'disconnected' | 'pending' | 'error';
  last_sync_at?: string;
  config: Record<string, any>;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  is_active: boolean;
  created_at: string;
  secret?: string;
  last_triggered_at?: string;
  last_response_code?: number;
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
  insights?: any;
  trends?: any;
  last_updated?: string;
}

export interface BlogAnalytics {
  views: number;
  uniqueViews: number;
  engagement: number;
  shares: number;
  timeOnPage: number;
  bounceRate: number;
  conversionRate: number;
  leads: number;
  revenue: number;
}

export interface BlogPerformanceMetrics {
  id: string;
  title: string;
  publishDate: string;
  views: number;
  engagement: number;
  shares: number;
  conversionRate: number;
  roi: number;
  trending: 'up' | 'down' | 'stable';
}

export interface TrafficSource {
  source: string;
  visits: number;
  percentage: number;
  conversionRate: number;
}

export interface KeywordPerformance {
  keyword: string;
  impressions: number;
  clicks: number;
  position: number;
  ctr: number;
}

export interface SocialPost {
  id: string;
  content: string;
  platform: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  created_at: string;
  campaignId?: string;
}

export interface WorkflowAutomation {
  id: string;
  name: string;
  description: string;
  trigger_type: 'schedule' | 'content_publish' | 'manual';
  actions: AutomationAction[];
  status: 'active' | 'inactive';
  created_at: string;
}

export interface AutomationAction {
  id: string;
  type: 'social_post' | 'email_excerpt' | 'cross_platform_publish' | 'content_series';
  platform?: string;
  template?: string;
  delay_minutes?: number;
}

export interface ContentIdea {
  id: string;
  title: string;
  topic: string;
  trending_score: number;
  source: string;
  keywords: string[];
  created_at: string;
}

export interface WritingStats {
  daily_word_count: number;
  weekly_streak: number;
  total_posts: number;
  goals: {
    daily_words: number;
    weekly_posts: number;
  };
}

export interface PublishingPlatform {
  id: string;
  name: string;
  type: 'blog' | 'social' | 'email' | 'website';
  connected: boolean;
  auto_publish: boolean;
  config: Record<string, any>;
}

// Content Repurposing Interfaces
export interface ContentVariant {
  id: string;
  contentId: string;
  format: string;
  platform?: string;
  title?: string;
  content: string;
  tone: string;
  characterCount: number;
  wordCount: number;
  characterLimit?: number;
  wordLimit?: number;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RepurposingRequest {
  contentId: string;
  targetFormat: string;
  platform?: string;
  tone?: string;
  characterLimit?: number;
  wordLimit?: number;
  audience?: string;
  ctaType?: string;
  options?: Record<string, any>;
}

export interface RepurposingResponse {
  success: boolean;
  data?: {
    content: string;
    title?: string;
    metadata?: Record<string, any>;
    suggestions?: string[];
  };
  error?: string;
}

export interface OptimizationOptions {
  targetLength?: number;
  targetAudience?: string;
  ctaType?: string;
  platform?: string;
  tone?: string;
}
