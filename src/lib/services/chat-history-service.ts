
import { supabase } from '@/integrations/supabase/client';

export interface AgentResponseData {
  type?: string;
  title?: string;
  explanation?: string;
  businessImpact?: string;
  nextActions?: string[];
  data?: unknown;
  response?: string;
  suggestions?: string[];
  followUp?: string[];
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_message: string;
  ai_response: AgentResponseData;
  agent_type?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export class ChatHistoryService {
  static async createSession(userId: string, title: string, metadata?: Record<string, unknown>): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title,
          content: title, // content is required, using title as default content
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return null;
      }

      return {
        ...data,
        metadata: (data.metadata as Record<string, unknown>) || {}
      };
    } catch (error) {
      console.error('Error in createSession:', error);
      return null;
    }
  }

  static async getUserSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return (data || []).map(session => ({
        ...session,
        metadata: (session.metadata as Record<string, unknown>) || {}
      }));
    } catch (error) {
      console.error('Error in getUserSessions:', error);
      return [];
    }
  }

  static async addMessage(
    sessionId: string,
    userMessage: string,
    aiResponse: AgentResponseData,
    agentType?: string,
    metadata?: Record<string, unknown>
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_message: userMessage,
          ai_response: aiResponse,
          agent_type: agentType,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding message:', error);
        return null;
      }

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return {
        ...data,
        ai_response: (data.ai_response as AgentResponseData) || {},
        metadata: (data.metadata as Record<string, unknown>) || {}
      };
    } catch (error) {
      console.error('Error in addMessage:', error);
      return null;
    }
  }

  static async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return (data || []).map(message => ({
        ...message,
        ai_response: (message.ai_response as AgentResponseData) || {},
        metadata: (message.metadata as Record<string, unknown>) || {}
      }));
    } catch (error) {
      console.error('Error in getSessionMessages:', error);
      return [];
    }
  }

  static async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session title:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSessionTitle:', error);
      return false;
    }
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteSession:', error);
      return false;
    }
  }
}
