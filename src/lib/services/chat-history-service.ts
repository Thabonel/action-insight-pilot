
import { supabase } from '@/integrations/supabase/client';
import { ChatSession, ChatMessage } from '@/types/profile';

export class ChatHistoryService {
  static async createSession(userId: string, title: string, metadata?: Record<string, any>): Promise<ChatSession | null> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          title,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return null;
      }

      return data;
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
        console.error('Error fetching chat sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserSessions:', error);
      return [];
    }
  }

  static async addMessage(
    sessionId: string,
    userMessage: string,
    aiResponse: any,
    agentType?: string,
    metadata?: Record<string, any>
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
        console.error('Error adding chat message:', error);
        return null;
      }

      return data;
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
        console.error('Error fetching session messages:', error);
        return [];
      }

      return data || [];
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
