import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RequestSchema = z.object({
  userId: z.string().uuid(),
  contentId: z.string().uuid().optional(),
  content: z.object({
    title: z.string(),
    content: z.string(),
    platform: z.string(),
    problemMatchOpening: z.string().optional(),
    personalityElements: z.array(z.string()).optional(),
    aeoQuestionsAnswered: z.array(z.string()).optional(),
  }),
  positioning: z.object({
    positioningStatement: z.string().optional(),
    villain: z.string().optional(),
    coreMessages: z.array(z.any()).optional(),
  }).optional(),
  qualityThreshold: z.number().min(0).max(100).optional(),
});

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function extractJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return JSON.parse(match[0]);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!anthropicApiKey) {
      throw new Error('Anthropic Claude API key not configured');
    }

    const requestBody = await req.json();
    const validation = RequestSchema.safeParse(requestBody);

    if (!validation.success) {
      console.error('Validation error:', validation.error);
      return jsonResponse({
        success: false,
        error: 'Invalid request parameters',
        details: validation.error.issues
      }, 400);
    }

    const input = validation.data;
    const qualityThreshold = input.qualityThreshold ?? 70;
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Running quality gate assessment...');

    const systemPrompt = `You are a strict quality assessor for organic marketing content using the Seven Ideas methodology. Your job is to score content against these principles:

1. **Problem Match** (0-20 points): Does the opening mirror the audience's exact language? Does it feel like the writer understands their pain?

2. **Personality Presence** (0-20 points): Is there authentic personality? Personal stories? Behind-the-scenes? Or is it generic corporate content?

3. **AEO Optimization** (0-20 points): Does the content answer specific questions AI engines would surface? Is it structured for discovery?

4. **Villain Reference** (0-15 points): Is there a subtle reference to the "villain" (broken system/practice)? Not preachy, but present?

5. **Message Clarity** (0-15 points): Is there ONE clear message? Or is it trying to say too many things?

6. **Platform Fit** (0-10 points): Does it follow platform best practices? Right length, format, tone?

Be honest and critical. Most content scores 50-70. Scores above 80 are excellent. Below 50 needs significant work.`;

    const positioningContext = input.positioning ? `
Brand Positioning:
- Statement: ${input.positioning.positioningStatement || 'Not defined'}
- Villain: ${input.positioning.villain || 'Not defined'}
- Core Messages: ${JSON.stringify(input.positioning.coreMessages?.slice(0, 3) || [])}
` : '';

    const userPrompt = `Score this content against Seven Ideas principles:

Platform: ${input.content.platform}
Title: ${input.content.title}

Content:
${input.content.content}

${input.content.problemMatchOpening ? `Problem Match Opening: ${input.content.problemMatchOpening}` : ''}
${input.content.personalityElements?.length ? `Personality Elements: ${input.content.personalityElements.join(', ')}` : ''}
${input.content.aeoQuestionsAnswered?.length ? `AEO Questions: ${input.content.aeoQuestionsAnswered.join('; ')}` : ''}

${positioningContext}

Score each principle and provide specific feedback:

Return as JSON:
{
  "overallScore": 0-100,
  "passed": true/false (based on threshold of ${qualityThreshold}),
  "scores": {
    "problemMatch": {
      "score": 0-20,
      "feedback": "Specific feedback on problem match",
      "suggestions": ["Improvement 1", "Improvement 2"]
    },
    "personalityPresence": {
      "score": 0-20,
      "feedback": "Specific feedback on personality",
      "suggestions": []
    },
    "aeoOptimization": {
      "score": 0-20,
      "feedback": "Specific feedback on AEO",
      "suggestions": []
    },
    "villainReference": {
      "score": 0-15,
      "feedback": "Specific feedback on villain reference",
      "suggestions": []
    },
    "messageClarity": {
      "score": 0-15,
      "feedback": "Specific feedback on message clarity",
      "suggestions": []
    },
    "platformFit": {
      "score": 0-10,
      "feedback": "Specific feedback on platform fit",
      "suggestions": []
    }
  },
  "topStrengths": ["Strength 1", "Strength 2"],
  "priorityImprovements": ["Most important fix", "Second priority"],
  "rewriteSuggestion": "Optional: A rewritten version of the opening if score < 60"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(errorData.error?.message || `Claude API request failed with status ${response.status}`);
    }

    const aiResponse = await response.json();
    const responseText = aiResponse.content?.[0]?.text;

    if (!responseText) {
      throw new Error('Invalid response from Claude API');
    }

    const qualityResults = extractJson(responseText);
    if (!qualityResults) {
      console.error('No JSON found in response:', responseText);
      throw new Error('Failed to parse quality results from AI response');
    }

    const overallScore = qualityResults.overallScore as number;
    const passed = overallScore >= qualityThreshold;

    if (input.contentId) {
      const { error: updateError } = await supabase
        .from('content_pieces')
        .update({
          quality_score: overallScore,
          quality_feedback: qualityResults,
          passed_quality_gate: passed,
          status: passed ? 'approved' : 'pending_review'
        })
        .eq('id', input.contentId)
        .eq('user_id', input.userId);

      if (updateError) {
        console.error('Error updating content:', updateError);
      }
    }

    return jsonResponse({
      success: true,
      assessment: qualityResults,
      overallScore,
      passed,
      threshold: qualityThreshold,
      message: passed ? 'Content passed quality gate' : 'Content needs improvement'
    });

  } catch (error: unknown) {
    console.error('Error in quality-gate-agent:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('configured');
    const status = isConfigError ? 503 : 500;
    const hint = isConfigError
      ? 'Check that ANTHROPIC_API_KEY is set in Supabase Edge Function environment variables'
      : undefined;

    return jsonResponse({ success: false, error: errorMessage, hint }, status);
  }
});
