import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { campaignId, contentType, brief, messagingStrategy, targetPersona } = await req.json();

    console.log('Generating full content for:', contentType);

    // Get campaign data for context
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const contentPrompt = await buildContentPrompt(contentType, brief, messagingStrategy, targetPersona, campaign);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: 'You are an expert content creator and copywriter. Create compelling, engaging content that drives action.' },
          { role: 'user', content: contentPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Parse and structure the content
    const structuredContent = parseGeneratedContent(generatedContent, contentType);

    // Save to database
    const { data: savedContent } = await supabase
      .from('generated_content_pieces')
      .insert({
        campaign_id: campaignId,
        content_type: contentType,
        title: structuredContent.title,
        content: structuredContent.content,
        metadata: {
          targetPersona,
          messagingPillar: messagingStrategy?.messagingPillars?.[0]?.title || 'Primary',
          wordCount: structuredContent.content.length,
          estimatedReadTime: Math.ceil(structuredContent.content.split(' ').length / 200),
          tone: messagingStrategy?.toneAndVoice?.personality?.[0] || 'Professional',
          callToAction: structuredContent.cta || 'Learn more'
        }
      })
      .select()
      .single();

    return new Response(JSON.stringify({
      content: structuredContent,
      id: savedContent.id,
      status: 'generated'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in full-content-generator:', error);
    // Return generic error to client, log full error server-side
    const publicError = error instanceof Error ? error.message : String(error)?.includes('API key') || error instanceof Error ? error.message : String(error)?.includes('OPENAI')
      ? 'Configuration error - please contact support'
      : error instanceof Error ? error.message : String(error)?.includes('not found')
      ? 'Campaign not found'
      : 'An error occurred generating content';
    return new Response(JSON.stringify({ error: publicError }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function buildContentPrompt(contentType: string, brief: Record<string, unknown>, messagingStrategy: Record<string, unknown>, targetPersona: Record<string, unknown>, campaign: Record<string, unknown>): Promise<string> {
  const baseContext = `
Campaign Brief: ${JSON.stringify(brief, null, 2)}
Target Persona: ${JSON.stringify(targetPersona, null, 2)}
Messaging Strategy: ${JSON.stringify(messagingStrategy, null, 2)}
Campaign Goals: ${campaign.primary_objective || 'Drive engagement and conversions'}
`;

  switch (contentType) {
    case 'blog_post':
      return `${baseContext}
Create a comprehensive blog post (1500-2000 words) that:
1. Hooks readers with a compelling headline and intro
2. Addresses the target persona's pain points
3. Provides valuable insights and actionable advice
4. Includes relevant examples and data
5. Ends with a strong call-to-action

Structure as JSON:
{
  "title": "SEO-optimized headline",
  "content": "Full blog post content with markdown formatting",
  "metaDescription": "150-character meta description",
  "cta": "Clear call-to-action",
  "tags": ["keyword1", "keyword2", "keyword3"]
}`;

    case 'ad_copy':
      return `${baseContext}
Create multiple ad copy variations for different platforms:
1. Facebook/Instagram ads (primary text, headline, description)
2. Google Ads (headlines, descriptions, extensions)
3. LinkedIn ads (headline, intro text, CTA)

Structure as JSON:
{
  "title": "Campaign name",
  "content": {
    "facebook": {
      "primaryText": "Main ad copy",
      "headline": "Compelling headline",
      "description": "Supporting description"
    },
    "google": {
      "headlines": ["Headline 1", "Headline 2", "Headline 3"],
      "descriptions": ["Description 1", "Description 2"]
    },
    "linkedin": {
      "headline": "Professional headline",
      "introText": "Engaging introduction",
      "cta": "Action button text"
    }
  },
  "cta": "Primary call-to-action"
}`;

    case 'email':
      return `${baseContext}
Create a complete email campaign sequence (3 emails):
1. Welcome/Introduction email
2. Value-driven educational email
3. Conversion-focused email

Structure as JSON:
{
  "title": "Email Campaign Name",
  "content": {
    "email1": {
      "subject": "Welcome subject line",
      "preheader": "Preview text",
      "body": "Full email HTML/text content",
      "cta": "Primary CTA"
    },
    "email2": {
      "subject": "Educational subject line",
      "preheader": "Preview text", 
      "body": "Educational content",
      "cta": "Secondary CTA"
    },
    "email3": {
      "subject": "Conversion subject line",
      "preheader": "Urgency preview text",
      "body": "Conversion-focused content",
      "cta": "Strong conversion CTA"
    }
  },
  "cta": "Overall campaign goal"
}`;

    default:
      return `${baseContext}
Create engaging ${contentType} content that aligns with the messaging strategy and appeals to the target persona.
Return as JSON with title, content, and cta fields.`;
  }
}

function parseGeneratedContent(content: string, contentType: string): Record<string, unknown> {
  try {
    return JSON.parse(content);
  } catch (error: unknown) {
    // Fallback if JSON parsing fails
    return {
      title: `Generated ${contentType}`,
      content: content,
      cta: 'Learn more'
    };
  }
}