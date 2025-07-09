import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'key-messages':
        systemPrompt = 'You are an expert marketing strategist. Generate 3-5 compelling key messages for a marketing campaign based on the provided context. Each message should be clear, action-oriented, and resonate with the target audience.';
        userPrompt = `Campaign Context:
Campaign Name: ${context.campaignName || 'Not specified'}
Campaign Type: ${context.campaignType || 'Not specified'}
Target Audience: ${context.targetAudience || 'Not specified'}
Primary Objective: ${context.primaryObjective || 'Not specified'}
Value Proposition: ${context.valueProposition || 'Not specified'}

Generate key messages that align with these campaign details. Return them as a JSON array of strings.`;
        break;

      case 'target-personas':
        systemPrompt = 'You are an expert marketing researcher. Create 2-3 detailed buyer personas based on the campaign context provided. Each persona should include name, demographics, pain points, motivations, and preferred communication channels.';
        userPrompt = `Campaign Context:
Campaign Name: ${context.campaignName || 'Not specified'}
Campaign Type: ${context.campaignType || 'Not specified'}
Target Audience: ${context.targetAudience || 'Not specified'}
Demographics: ${JSON.stringify(context.demographics || {})}
Industry/Category: ${context.industry || 'Not specified'}

Create detailed buyer personas. Return them as a JSON array of objects with the structure: {name: string, description: string, demographics: string, painPoints: string, motivations: string, channels: string}`;
        break;

      default:
        throw new Error('Invalid assistance type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    try {
      // Try to parse as JSON first
      const parsedContent = JSON.parse(generatedContent);
      return new Response(JSON.stringify({ 
        success: true, 
        data: parsedContent,
        type 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      // If JSON parsing fails, return as raw text
      return new Response(JSON.stringify({ 
        success: true, 
        data: generatedContent,
        type,
        format: 'text'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in ai-campaign-assistant function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});