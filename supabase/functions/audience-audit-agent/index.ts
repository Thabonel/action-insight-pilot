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
  businessDescription: z.string().min(10),
  targetAudience: z.string().min(10),
  industry: z.string().optional(),
  existingPlatforms: z.array(z.string()).optional(),
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
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    console.log('Running The Audit for audience discovery...');

    const systemPrompt = `You are an expert audience researcher specializing in organic content marketing and AEO (Answer Engine Optimization). Your task is to perform "The Audit" - discovering where an audience hangs out online and capturing their exact language.

Your analysis should:
1. Identify specific online platforms, communities, and forums where the target audience is most active
2. Capture the exact language, phrases, and terminology the audience uses to describe their problems
3. Identify questions they commonly ask (for AEO optimization)
4. Find gaps in competitor content that represent opportunities

Be specific - name actual subreddits, YouTube channels, forums, LinkedIn groups, etc. Use real platform names and realistic community sizes.`;

    const platformsLine = input.existingPlatforms?.length
      ? `Currently active on: ${input.existingPlatforms.join(', ')}`
      : '';

    const userPrompt = `Perform "The Audit" for this business:

Business Description: ${input.businessDescription}
Target Audience: ${input.targetAudience}
Industry: ${input.industry || 'Not specified'}
${platformsLine}

Discover:
1. Top platforms where this audience congregates (be specific: subreddit names, Facebook group types, YouTube channel categories, forums, Discord servers, etc.)
2. The exact problem language they use (quotes, phrases, complaints)
3. Common questions they ask that AI engines like ChatGPT, Perplexity, and Google would surface
4. Competitor content gaps - what topics are underserved or poorly explained

Return your analysis as JSON with this structure:
{
  "platformsDiscovered": [
    {
      "platform": "reddit",
      "specific": "r/SubredditName",
      "estimatedSize": "100K+ members",
      "activityLevel": "high|medium|low",
      "relevanceScore": 1-10,
      "notes": "Why this matters for the audience"
    }
  ],
  "problemLanguage": [
    {
      "phrase": "Exact phrase they use",
      "context": "When/why they say this",
      "emotionalIntensity": "high|medium|low",
      "frequency": "common|occasional|rare"
    }
  ],
  "aiScrapeSources": [
    {
      "source": "Wikipedia/Reddit/YouTube/Forum name",
      "type": "reference|discussion|tutorial|review",
      "aeoValue": "high|medium|low",
      "reason": "Why AI engines would cite this"
    }
  ],
  "competitorGaps": [
    {
      "topic": "Underserved topic",
      "currentState": "What content exists now",
      "opportunity": "How to fill the gap",
      "difficulty": "easy|medium|hard"
    }
  ],
  "questionsAsked": [
    "Question 1 the audience commonly asks?",
    "Question 2 they search for?",
    "Question 3 for AEO optimization?"
  ],
  "rawQuotes": [
    "An example quote or complaint from the audience",
    "Another realistic phrase they might say"
  ]
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
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
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

    const auditResults = extractJson(responseText);
    if (!auditResults) {
      console.error('No JSON found in response:', responseText);
      throw new Error('Failed to parse audit results from AI response');
    }

    const { data: savedAudit, error: saveError } = await supabase
      .from('audience_research')
      .upsert({
        user_id: input.userId,
        platforms_discovered: auditResults.platformsDiscovered ?? [],
        problem_language: auditResults.problemLanguage ?? [],
        ai_scrape_sources: auditResults.aiScrapeSources ?? [],
        competitor_gaps: auditResults.competitorGaps ?? [],
        questions_asked: auditResults.questionsAsked ?? [],
        raw_quotes: auditResults.rawQuotes ?? [],
        audit_completed_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving audit:', saveError);
    }

    return jsonResponse({
      success: true,
      audit: auditResults,
      auditId: savedAudit?.id,
      message: 'Audience audit completed successfully'
    });

  } catch (error: unknown) {
    console.error('Error in audience-audit-agent:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('configured');
    const status = isConfigError ? 503 : 500;
    const hint = isConfigError
      ? 'Check that ANTHROPIC_API_KEY is set in Supabase Edge Function environment variables'
      : undefined;

    return jsonResponse({ success: false, error: errorMessage, hint }, status);
  }
});
