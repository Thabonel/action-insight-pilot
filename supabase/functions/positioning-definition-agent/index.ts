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
  auditData: z.object({
    problemLanguage: z.array(z.any()).optional(),
    competitorGaps: z.array(z.any()).optional(),
  }).optional(),
  existingPositioning: z.string().optional(),
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

    console.log('Creating positioning definition with Blank for Blank + Mega Mean Mouse...');

    const systemPrompt = `You are an expert brand strategist specializing in the Seven Ideas methodology for organic marketing. Your task is to create:

1. **Blank for Blank Positioning**: "The [what you do] for [who you serve]" - hyper-specific positioning that's instantly memorable.

2. **Mega Mean Mouse (Villain Identification)**: Identify a "villain" that is NOT a person but rather:
   - A broken system
   - An outdated industry practice
   - A common misconception
   - A market gap that hurts people

3. **Downstream Costs**: Show the real costs of NOT solving this problem - what happens if the audience doesn't act.

4. **Core Messages**: 5-7 specific messages the audience needs to hear repeatedly.

Your positioning should be specific, memorable, and emotionally resonant.`;

    const auditContext = input.auditData ? `
Audit Insights:
- Problem Language: ${JSON.stringify(input.auditData.problemLanguage || [])}
- Competitor Gaps: ${JSON.stringify(input.auditData.competitorGaps || [])}
` : '';

    const userPrompt = `Create positioning for this business:

Business Description: ${input.businessDescription}
Target Audience: ${input.targetAudience}
${input.existingPositioning ? `Current Positioning: ${input.existingPositioning}` : ''}
${auditContext}

Generate a complete positioning definition with:
1. Blank for Blank statement (The X for Y)
2. Villain identification (system/practice, NOT a person)
3. Downstream costs of not solving
4. 5-7 core messages

Return as JSON:
{
  "positioningStatement": "The [specific thing] for [specific people]",
  "whatYouDo": "Clear description of the transformation you provide",
  "whoYouServe": "Specific description of your ideal customer",
  "villain": {
    "name": "The broken system/practice/misconception",
    "type": "broken_system|industry_practice|outdated_method|common_misconception|market_gap",
    "description": "Why this villain exists and why it's harmful",
    "howItHurts": "Specific ways this villain hurts the target audience"
  },
  "downstreamCosts": [
    {
      "cost": "What happens if they don't act",
      "timeframe": "immediate|short-term|long-term",
      "severity": "high|medium|low",
      "emotional": "How it feels to experience this cost"
    }
  ],
  "coreMessages": [
    {
      "message": "The core message",
      "pillar": "awareness|consideration|decision|retention",
      "emotionalHook": "The feeling this message evokes",
      "useCase": "When to use this message"
    }
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

    const positioningResults = extractJson(responseText);
    if (!positioningResults) {
      console.error('No JSON found in response:', responseText);
      throw new Error('Failed to parse positioning results from AI response');
    }

    const villainData = positioningResults.villain as Record<string, unknown> | undefined;

    const { data: savedPositioning, error: saveError } = await supabase
      .from('positioning_definitions')
      .insert({
        user_id: input.userId,
        positioning_statement: positioningResults.positioningStatement,
        what_you_do: positioningResults.whatYouDo,
        who_you_serve: positioningResults.whoYouServe,
        villain: villainData?.name || villainData?.description,
        villain_type: villainData?.type,
        downstream_costs: positioningResults.downstreamCosts ?? [],
        core_messages: positioningResults.coreMessages ?? [],
        is_active: true
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving positioning:', saveError);
    }

    return jsonResponse({
      success: true,
      positioning: positioningResults,
      positioningId: savedPositioning?.id,
      message: 'Positioning definition created successfully'
    });

  } catch (error: unknown) {
    console.error('Error in positioning-definition-agent:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('configured');
    const status = isConfigError ? 503 : 500;
    const hint = isConfigError
      ? 'Check that ANTHROPIC_API_KEY is set in Supabase Edge Function environment variables'
      : undefined;

    return jsonResponse({ success: false, error: errorMessage, hint }, status);
  }
});
