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
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'youtube', 'tiktok', 'blog', 'newsletter', 'reddit', 'facebook']),
  messageTag: z.string().optional(),
  topic: z.string().min(5),
  positioning: z.object({
    positioningStatement: z.string().optional(),
    villain: z.string().optional(),
    coreMessages: z.array(z.any()).optional(),
  }).optional(),
  audienceData: z.object({
    problemLanguage: z.array(z.any()).optional(),
    rawQuotes: z.array(z.string()).optional(),
  }).optional(),
  personalityElements: z.object({
    founderStory: z.string().optional(),
    personalityTraits: z.array(z.string()).optional(),
    brandVoice: z.string().optional(),
  }).optional(),
  contentType: z.enum(['post', 'thread', 'article', 'video_script', 'carousel']).optional(),
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

    console.log('Generating Seven Ideas aligned content...');

    const platformGuidelines: Record<string, string> = {
      linkedin: 'Professional tone, storytelling hooks, 1300 char optimal, use line breaks for readability',
      twitter: 'Punchy, conversational, 280 char limit, thread format for longer content',
      instagram: 'Visual-first, emoji-friendly, hashtag strategy, carousel slides if needed',
      youtube: 'Hook in first 5 seconds, clear structure, call-to-action',
      tiktok: 'Trending hooks, fast pace, authentic feel, pattern interrupts',
      blog: 'SEO-optimized headers, scannable, 1500-2500 words, internal links',
      newsletter: 'Personal, conversational, one clear CTA, mobile-friendly',
      reddit: 'Value-first, no self-promotion feel, engage with community norms',
      facebook: 'Conversational, question-based engagement, shareable format',
    };

    const systemPrompt = `You are an expert content creator using the Seven Ideas methodology for organic marketing. Your content must:

1. **Problem Match Opening**: Start by mirroring the audience's exact language and pain. Use THEIR words, not marketing speak.

2. **Personality-Driven**: Include personal stories, behind-the-scenes insights, or founder journey elements. NOT polished corporate content.

3. **AEO Optimized**: Structure content to answer specific questions that AI engines (ChatGPT, Perplexity, Google) might surface.

4. **Villain Reference**: Subtly reference the "villain" (broken system/practice) without being preachy.

5. **Message Clarity**: Each piece should deliver ONE core message clearly.

Platform: ${input.platform}
Guidelines: ${platformGuidelines[input.platform]}`;

    const positioningContext = input.positioning ? `
Positioning:
- Statement: ${input.positioning.positioningStatement || 'Not defined'}
- Villain: ${input.positioning.villain || 'Not defined'}
` : '';

    const audienceContext = input.audienceData ? `
Audience Language:
- Problem phrases: ${JSON.stringify(input.audienceData.problemLanguage?.slice(0, 5) || [])}
- Raw quotes: ${input.audienceData.rawQuotes?.slice(0, 3).join('; ') || 'None captured'}
` : '';

    const personalityContext = input.personalityElements ? `
Personality Elements:
- Founder story: ${input.personalityElements.founderStory || 'Not provided'}
- Traits: ${input.personalityElements.personalityTraits?.join(', ') || 'Not defined'}
- Brand voice: ${input.personalityElements.brandVoice || 'Not defined'}
` : '';

    const userPrompt = `Create ${input.contentType || 'post'} content for ${input.platform}:

Topic: ${input.topic}
${input.messageTag ? `Message Pillar: ${input.messageTag}` : ''}
${positioningContext}
${audienceContext}
${personalityContext}

Generate content following Seven Ideas principles:
1. Problem Match opening (use audience's exact language)
2. Personality injection (story, behind-scenes, authentic voice)
3. AEO structure (answer specific questions)
4. Villain reference (subtle, not preachy)
5. Single clear message

Return as JSON:
{
  "title": "Content title or hook",
  "content": "The full content piece",
  "problemMatchOpening": "The specific opening that mirrors audience language",
  "personalityElements": ["Element 1 used", "Element 2 used"],
  "aeoQuestionsAnswered": ["Question 1 this answers", "Question 2"],
  "villainReference": "How the villain was referenced (or null if not applicable)",
  "coreMessage": "The single message this content delivers",
  "hashtags": ["relevant", "hashtags"],
  "callToAction": "The CTA for this content",
  "platformNotes": "Any platform-specific formatting notes"
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
        temperature: 0.8,
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

    const contentResults = extractJson(responseText);
    if (!contentResults) {
      console.error('No JSON found in response:', responseText);
      throw new Error('Failed to parse content results from AI response');
    }

    const { data: savedContent, error: saveError } = await supabase
      .from('content_pieces')
      .insert({
        user_id: input.userId,
        title: contentResults.title,
        content: contentResults.content,
        platform: input.platform,
        message_tag: input.messageTag,
        problem_match_opening: contentResults.problemMatchOpening,
        personality_elements: contentResults.personalityElements ?? [],
        aeo_optimized: true,
        aeo_questions_answered: contentResults.aeoQuestionsAnswered ?? [],
        status: 'draft'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving content:', saveError);
    }

    return jsonResponse({
      success: true,
      content: contentResults,
      contentId: savedContent?.id,
      message: 'Content generated successfully'
    });

  } catch (error: unknown) {
    console.error('Error in organic-content-agent:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('configured');
    const status = isConfigError ? 503 : 500;
    const hint = isConfigError
      ? 'Check that ANTHROPIC_API_KEY is set in Supabase Edge Function environment variables'
      : undefined;

    return jsonResponse({ success: false, error: errorMessage, hint }, status);
  }
});
