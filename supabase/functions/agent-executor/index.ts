
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const AgentRequestSchema = z.object({
  agent_type: z.string().min(1).max(50),
  task_type: z.string().min(1).max(50),
  input_data: z.record(z.unknown()).optional().default({})
});

interface AgentRequest {
  agent_type: string;
  task_type: string;
  input_data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication required
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and parse request body
    const requestBody = await req.json();
    const validationResult = AgentRequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { agent_type, task_type, input_data }: AgentRequest = validationResult.data;

    console.log(`🚀 User ${user.id} executing ${task_type} for agent ${agent_type}`, input_data);

    // Get AI API keys from secrets
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!openaiKey && !anthropicKey) {
      throw new Error('No AI API key configured. Please add either OpenAI or Anthropic API key.');
    }

    let result;

    // Route to appropriate agent logic based on agent_type and task_type
    switch (agent_type) {
      case 'content_creator':
        result = await handleContentCreatorTasks(task_type, input_data, openaiKey, anthropicKey);
        break;
      case 'campaign_manager':
        result = await handleCampaignManagerTasks(task_type, input_data, openaiKey, anthropicKey);
        break;
      case 'lead_generator':
        result = await handleLeadGeneratorTasks(task_type, input_data, openaiKey, anthropicKey);
        break;
      case 'social_media_manager':
        result = await handleSocialMediaTasks(task_type, input_data, openaiKey, anthropicKey);
        break;
      default:
        throw new Error(`Unknown agent type: ${agent_type}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Log detailed error server-side only
    console.error('Agent execution error:', error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function callAI(messages: any[], openaiKey?: string, anthropicKey?: string) {
  // Prefer OpenAI if available, fallback to Claude
  if (openaiKey) {
    return await callOpenAI(messages, openaiKey);
  } else if (anthropicKey) {
    return await callClaude(messages, anthropicKey);
  } else {
    throw new Error('No AI API key available');
  }
}

async function callOpenAI(messages: any[], openaiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini',
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(messages: any[], anthropicKey: string) {
  // Convert OpenAI format to Claude format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anthropicKey}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4.5',
      max_tokens: 1000,
      system: systemMessage,
      messages: userMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function handleContentCreatorTasks(task_type: string, input_data: any, openaiKey?: string, anthropicKey?: string) {
  switch (task_type) {
    case 'create_email_content':
      const emailPrompt = `Create an engaging email for a ${input_data.campaign_type} campaign targeting ${input_data.target_audience}. 
      Template style: ${input_data.template}. 
      Campaign name: ${input_data.campaign_name}.
      
      Return JSON with: { "content": "email body", "subject_lines": [{"text": "subject", "score": 85}] }`;

      const emailContent = await callAI([
        { role: 'system', content: 'You are an expert email marketing specialist. Always return valid JSON.' },
        { role: 'user', content: emailPrompt }
      ], openaiKey, anthropicKey);

      try {
        return JSON.parse(emailContent);
      } catch {
        return { content: emailContent, subject_lines: [] };
      }

    default:
      throw new Error(`Unknown content creator task: ${task_type}`);
  }
}

async function handleCampaignManagerTasks(task_type: string, input_data: any, openaiKey?: string, anthropicKey?: string) {
  switch (task_type) {
    case 'generate_ab_variants':
      const abPrompt = `Generate 3 A/B test variants for this subject line: "${input_data.base_message}"
      
      Return JSON with: { "variants": [{"text": "variant", "score": 85}] }`;

      const abContent = await callAI([
        { role: 'system', content: 'You are an expert A/B testing specialist. Always return valid JSON.' },
        { role: 'user', content: abPrompt }
      ], openaiKey, anthropicKey);

      try {
        return JSON.parse(abContent);
      } catch {
        return { variants: [] };
      }

    case 'suggest_send_time':
      // Simulate AI-powered send time optimization
      const times = ['Tuesday 10:30 AM', 'Wednesday 2:00 PM', 'Thursday 9:00 AM'];
      const randomTime = times[Math.floor(Math.random() * times.length)];
      const improvement = Math.floor(Math.random() * 20) + 10;

      return {
        optimal_time: randomTime,
        improvement: improvement,
        confidence: 87
      };

    default:
      throw new Error(`Unknown campaign manager task: ${task_type}`);
  }
}

async function handleLeadGeneratorTasks(task_type: string, input_data: any, openaiKey?: string, anthropicKey?: string) {
  switch (task_type) {
    case 'score_leads':
      // Simulate AI lead scoring
      return {
        leads_scored: Math.floor(Math.random() * 100) + 50,
        insights: {
          averageScoreAccuracy: 87 + Math.floor(Math.random() * 10),
          conversionRate: `${(20 + Math.random() * 10).toFixed(1)}%`,
          topSource: ['LinkedIn', 'Website', 'Referrals'][Math.floor(Math.random() * 3)]
        }
      };

    case 'analyze_performance':
      return {
        performance_metrics: {
          conversion_rate: (Math.random() * 10 + 15).toFixed(1),
          lead_quality_score: Math.floor(Math.random() * 20) + 80,
          best_source: 'LinkedIn'
        }
      };

    default:
      throw new Error(`Unknown lead generator task: ${task_type}`);
  }
}

async function handleSocialMediaTasks(task_type: string, input_data: any, openaiKey?: string, anthropicKey?: string) {
  switch (task_type) {
    case 'create_social_post':
      const socialPrompt = `Create engaging ${input_data.platform} content about "${input_data.content_theme}" 
      with a ${input_data.brand_voice} tone.
      
      Return JSON with: { "content": "post content", "hashtags": ["tag1", "tag2"], "optimal_time": "time" }`;

      const socialContent = await callAI([
        { role: 'system', content: 'You are a social media expert. Always return valid JSON.' },
        { role: 'user', content: socialPrompt }
      ], openaiKey, anthropicKey);

      try {
        return JSON.parse(socialContent);
      } catch {
        return { content: socialContent, hashtags: [], optimal_time: '10:00 AM' };
      }

    default:
      throw new Error(`Unknown social media task: ${task_type}`);
  }
}
