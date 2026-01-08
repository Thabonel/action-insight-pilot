import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIFeedbackData {
  userId: string;
  sessionId?: string;
  interactionType: 'edit' | 'approve' | 'regenerate' | 'reject';
  originalSuggestion: any;
  userModification?: any;
  contextData: any;
  feedbackScore?: number; // 1-5 rating
}

export const useAIFeedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (feedbackData: AIFeedbackData) => {
    try {
      setIsSubmitting(true);
      
      const { data, error } = await supabase.functions.invoke('ai-feedback-loop', {
        body: feedbackData
      });

      if (error) throw error;

      console.log('Feedback submitted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to record feedback');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const recordApproval = async (originalSuggestion: Record<string, unknown>, contextData: Record<string, unknown>, sessionId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return submitFeedback({
      userId: user.id,
      sessionId,
      interactionType: 'approve',
      originalSuggestion,
      contextData
    });
  };

  const recordEdit = async (
    originalSuggestion: any, 
    userModification: any, 
    contextData: any, 
    sessionId?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return submitFeedback({
      userId: user.id,
      sessionId,
      interactionType: 'edit',
      originalSuggestion,
      userModification,
      contextData
    });
  };

  const recordRegeneration = async (originalSuggestion: Record<string, unknown>, contextData: Record<string, unknown>, sessionId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return submitFeedback({
      userId: user.id,
      sessionId,
      interactionType: 'regenerate',
      originalSuggestion,
      contextData
    });
  };

  const recordRejection = async (originalSuggestion: Record<string, unknown>, contextData: Record<string, unknown>, sessionId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return submitFeedback({
      userId: user.id,
      sessionId,
      interactionType: 'reject',
      originalSuggestion,
      contextData
    });
  };

  const recordRating = async (
    originalSuggestion: any, 
    rating: number, 
    contextData: any, 
    sessionId?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    return submitFeedback({
      userId: user.id,
      sessionId,
      interactionType: rating >= 4 ? 'approve' : 'reject',
      originalSuggestion,
      contextData,
      feedbackScore: rating
    });
  };

  return {
    submitFeedback,
    recordApproval,
    recordEdit,
    recordRegeneration,
    recordRejection,
    recordRating,
    isSubmitting
  };
};