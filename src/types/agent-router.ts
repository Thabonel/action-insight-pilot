// Type definitions for chat agent router

export interface AgentContext {
  chatHistory?: ChatHistoryItem[];
  sessionId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date | string;
}

export interface AgentResponse {
  type: 'daily_focus' | 'campaign_analysis' | 'general' | 'error' | 'network_error' | 'server_sleeping';
  title: string;
  explanation: string;
  businessImpact: string;
  nextActions: string[];
  data?: unknown;
  priority_items?: unknown[];
  metadata?: {
    isCampaignFlow?: boolean;
    hasBasicInfo?: boolean;
    hasKPITargets?: boolean;
    hasBudget?: boolean;
    isMultiChannel?: boolean;
    campaignTypeOptions?: Array<{
      label: string;
      value: string;
      description: string;
    }>;
  };
}

export interface DailyFocusResponse {
  type: 'daily_focus';
  title: string;
  explanation: string;
  businessImpact: string;
  nextActions: string[];
  data: unknown[];
}

export interface ErrorResponse {
  type: 'error' | 'network_error' | 'server_sleeping';
  title: string;
  explanation: string;
  businessImpact: string;
  nextActions: string[];
}
