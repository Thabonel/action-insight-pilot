
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
}

export interface ContentBrief {
  topic: string;
  audience: string;
  tone: string;
  platform: string;
  length: string;
  keywords?: string[];
}

export interface WorkflowMethods {
  getAll: () => Promise<ApiResponse<Workflow[]>>;
  create: (workflow: Partial<Workflow>) => Promise<ApiResponse<Workflow>>;
  update: (id: string, workflow: Partial<Workflow>) => Promise<ApiResponse<Workflow>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  execute: (id: string, input?: any) => Promise<ApiResponse<any>>;
}
