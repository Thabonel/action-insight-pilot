import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { 
      userId, 
      sessionId, 
      interactionType, 
      originalSuggestion, 
      userModification, 
      contextData, 
      feedbackScore 
    } = await req.json();

    console.log('Recording AI feedback:', { interactionType, userId });

    // Record the feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('ai_interaction_feedback')
      .insert({
        user_id: userId,
        session_id: sessionId,
        interaction_type: interactionType,
        original_suggestion: originalSuggestion,
        user_modification: userModification,
        context_data: contextData,
        feedback_score: feedbackScore
      })
      .select()
      .single();

    if (feedbackError) throw feedbackError;

    // Process feedback for learning
    await processLearningFromFeedback(supabase, feedback);

    // Update session interaction history
    if (sessionId) {
      const { data: session } = await supabase
        .from('campaign_copilot_sessions')
        .select('interaction_history')
        .eq('id', sessionId)
        .single();

      if (session) {
        await supabase
          .from('campaign_copilot_sessions')
          .update({
            interaction_history: [
              ...session.interaction_history || [],
              {
                type: 'user_feedback',
                timestamp: new Date().toISOString(),
                data: {
                  interactionType,
                  feedbackScore,
                  hasModification: !!userModification
                }
              }
            ]
          })
          .eq('id', sessionId);
      }
    }

    return new Response(JSON.stringify({ success: true, feedbackId: feedback.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in ai-feedback-loop:', error);

    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Failed to process feedback';

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface FeedbackData {
  id: string;
  interaction_type: string;
  context_data: Record<string, unknown>;
  original_suggestion: unknown;
  user_modification: unknown;
  feedback_score?: number;
  timestamp: string;
}

async function processLearningFromFeedback(supabase: SupabaseClient, feedback: FeedbackData): Promise<void> {
  try {
    const agentType = determineAgentType(feedback.context_data);
    if (!agentType) return;

    // Get existing learning data for this pattern
    const { data: existingPattern } = await supabase
      .from('agent_learning_data')
      .select('*')
      .eq('agent_type', agentType)
      .limit(1)
      .single();

    const learningData = extractLearningPattern(feedback);
    
    if (existingPattern) {
      // Update existing pattern
      const newConfidence = calculateNewConfidence(
        existingPattern.confidence_score,
        feedback.interaction_type,
        feedback.feedback_score
      );
      
      const newSuccessRate = updateSuccessRate(
        existingPattern.success_rate,
        existingPattern.usage_count,
        feedback.interaction_type,
        feedback.feedback_score
      );

      await supabase
        .from('agent_learning_data')
        .update({
          pattern_data: mergePatternData(existingPattern.pattern_data, learningData),
          confidence_score: newConfidence,
          success_rate: newSuccessRate,
          usage_count: existingPattern.usage_count + 1,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingPattern.id);
    } else {
      // Create new learning pattern
      await supabase
        .from('agent_learning_data')
        .insert({
          agent_type: agentType,
          pattern_data: learningData,
          confidence_score: getInitialConfidence(feedback),
          usage_count: 1,
          success_rate: getInitialSuccessRate(feedback)
        });
    }

  } catch (error: unknown) {
    console.error('Error processing learning from feedback:', error);
  }
}

function determineAgentType(contextData: Record<string, unknown>): string | null {
  if (!contextData) return null;
  
  if (contextData.type?.includes('audience') || contextData.personas) return 'audience';
  if (contextData.type?.includes('channel') || contextData.channels) return 'channel';
  if (contextData.type?.includes('messaging') || contextData.messaging) return 'messaging';
  if (contextData.type?.includes('content') || contextData.content) return 'content';
  
  return null;
}

function extractLearningPattern(feedback: FeedbackData): Record<string, unknown> {
  const pattern: Record<string, unknown> = {
    interactionType: feedback.interaction_type,
    timestamp: feedback.timestamp,
    context: feedback.context_data
  };

  if (feedback.user_modification) {
    pattern.userPreferences = {
      original: feedback.original_suggestion,
      modified: feedback.user_modification,
      changes: findDifferences(feedback.original_suggestion, feedback.user_modification)
    };
  }

  if (feedback.feedback_score) {
    pattern.satisfactionScore = feedback.feedback_score;
  }

  return pattern;
}

function findDifferences(original: unknown, modified: unknown): Record<string, unknown> {
  const differences: Record<string, unknown> = {};
  
  if (typeof original === 'object' && typeof modified === 'object') {
    for (const key in modified) {
      if (original[key] !== modified[key]) {
        differences[key] = {
          from: original[key],
          to: modified[key]
        };
      }
    }
  }
  
  return differences;
}

function calculateNewConfidence(currentConfidence: number, interactionType: string, feedbackScore?: number): number {
  let adjustment = 0;
  
  switch (interactionType) {
    case 'approve':
      adjustment = 0.1;
      break;
    case 'edit':
      adjustment = feedbackScore ? (feedbackScore - 3) * 0.05 : -0.05;
      break;
    case 'regenerate':
      adjustment = -0.15;
      break;
    case 'reject':
      adjustment = -0.2;
      break;
  }
  
  return Math.max(0, Math.min(1, currentConfidence + adjustment));
}

function updateSuccessRate(currentRate: number, usageCount: number, interactionType: string, feedbackScore?: number): number {
  const isSuccess = interactionType === 'approve' || (feedbackScore && feedbackScore >= 4);
  const newSuccessCount = currentRate * usageCount + (isSuccess ? 1 : 0);
  const newUsageCount = usageCount + 1;
  
  return newSuccessCount / newUsageCount;
}

function getInitialConfidence(feedback: FeedbackData): number {
  if (feedback.interaction_type === 'approve') return 0.7;
  if (feedback.feedback_score && feedback.feedback_score >= 4) return 0.6;
  if (feedback.interaction_type === 'edit') return 0.4;
  return 0.3;
}

function getInitialSuccessRate(feedback: FeedbackData): number {
  if (feedback.interaction_type === 'approve') return 1.0;
  if (feedback.feedback_score && feedback.feedback_score >= 4) return 0.8;
  if (feedback.interaction_type === 'edit') return 0.6;
  return 0.2;
}

function mergePatternData(existing: Record<string, unknown>, newData: Record<string, unknown>): Record<string, unknown> {
  // Simple merge strategy - in production, this would be more sophisticated
  return {
    ...existing,
    recentInteractions: [
      ...(existing.recentInteractions || []).slice(-9), // Keep last 9
      newData
    ],
    lastUpdated: new Date().toISOString()
  };
}