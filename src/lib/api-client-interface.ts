
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SocialPlatformConnection {
  id: string;
  platform: string;
  account_name: string;
  status: 'connected' | 'disconnected' | 'error';
  connection_status: 'connected' | 'disconnected' | 'error';
  last_sync: string;
  follower_count: number;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  type: string;
  config: any;
  order: number;
  title?: string;
  description?: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  icon?: string;
  color?: string;
}

export interface ContentBrief {
  topic: string;
  audience: string;
  tone: string;
  platform: string;
  length: string;
  keywords?: string[];
  title?: string;
  target_audience?: string;
  content_type?: string;
  key_messages?: string[];
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
  insights?: string[];
  trends?: {
    positive: number;
    negative: number;
    neutral: number;
  };
  last_updated?: string;
}

export interface IntegrationConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  config: any;
  created_at: string;
  updated_at: string;
  service_name?: string;
  connection_status?: 'connected' | 'disconnected' | 'error';
  last_sync_at?: string;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
  last_response_code?: number;
}

export interface WorkflowMethods {
  getAll: () => Promise<ApiResponse<Workflow[]>>;
  create: (workflow: Partial<Workflow>) => Promise<ApiResponse<Workflow>>;
  update: (id: string, workflow: Partial<Workflow>) => Promise<ApiResponse<Workflow>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  execute: (id: string, input?: any) => Promise<ApiResponse<any>>;
}

export interface UserPreferences {
  theme?: string;
  notifications?: boolean;
  language?: string;
  timezone?: string;
  [key: string]: any;
}

export interface UserPreferencesMethods {
  get: () => Promise<ApiResponse<UserPreferences>>;
  update: (data: Partial<UserPreferences>) => Promise<ApiResponse<UserPreferences>>;
  getUserPreferences: (category?: string) => Promise<ApiResponse<UserPreferences>>;
  updateUserPreferences: (category: string, data: Partial<UserPreferences>) => Promise<ApiResponse<UserPreferences>>;
}
