
export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
  company?: string;
  job_title?: string;
  location?: string;
  website?: string;
  timezone?: string;
  theme_preference?: 'light' | 'dark' | 'system';
  language_preference?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    chat: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  preference_category: string;
  preference_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_message: string;
  ai_response: any;
  agent_type?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
