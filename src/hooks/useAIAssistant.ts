import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Demographics {
  ageRange?: string;
  location?: string;
  interests?: string[];
  [key: string]: unknown;
}

interface AIAssistanceContext {
  campaignName?: string;
  campaignType?: string;
  targetAudience?: string;
  primaryObjective?: string;
  valueProposition?: string;
  demographics?: Demographics;
  industry?: string;
}

export const useAIAssistant = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateKeyMessages = async (context: AIAssistanceContext) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-campaign-assistant', {
        body: {
          type: 'key-messages',
          context
        }
      });

      if (error) throw error;

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to generate key messages');
      }
    } catch (error) {
      console.error('Error generating key messages:', error);
      toast({
        title: "AI Generation Error",
        description: "Failed to generate key messages. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateTargetPersonas = async (context: AIAssistanceContext) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-campaign-assistant', {
        body: {
          type: 'target-personas',
          context
        }
      });

      if (error) throw error;

      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to generate target personas');
      }
    } catch (error) {
      console.error('Error generating target personas:', error);
      toast({
        title: "AI Generation Error",
        description: "Failed to generate target personas. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateKeyMessages,
    generateTargetPersonas,
    loading
  };
};