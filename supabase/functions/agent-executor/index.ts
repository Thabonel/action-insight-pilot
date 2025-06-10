
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { agent_type, task_type, input_data }: AgentRequest = await req.json();

    console.log(`Executing ${task_type} for agent ${agent_type}`, input_data);

    // Get OpenAI API key from secrets
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let result;

    // Route to appropriate agent logic based on agent_type and task_type
    switch (agent_type) {
      case 'content_creator':
        result = await handleContentCreatorTasks(task_type, input_data, openaiKey);
        break;
      case 'campaign_manager':
        result = await handleCampaignManagerTasks(task_type, input_data, openaiKey);
        break;
      case 'lead_generator':
        result = await handleLeadGeneratorTasks(task_type, input_data, openaiKey);
        break;
      case 'social_media_manager':
        result = await handleSocialMediaTasks(task_type, input_data, openaiKey);
        break;
      default:
        throw new Error(`Unknown agent type: ${agent_type}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Agent execution error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function callOpenAI(messages: any[], openaiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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

async function handleContentCreatorTasks(task_type: string, input_data: any, openaiKey: string) {
  switch (task_type) {
    case 'create_email_content':
      const emailPrompt = `Create an engaging email for a ${input_data.campaign_type} campaign targeting ${input_data.target_audience}. 
      Template style: ${input_data.template}. 
      Campaign name: ${input_data.campaign_name}.
      
      Return JSON with: { "content": "email body", "subject_lines": [{"text": "subject", "score": 85}] }`;

      const emailContent = await callOpenAI([
        { role: 'system', content: 'You are an expert email marketing specialist. Always return valid JSON.' },
        { role: 'user', content: emailPrompt }
      ], openaiKey);

      try {
        return JSON.parse(emailContent);
      } catch {
        return { content: emailContent, subject_lines: [] };
      }

    default:
      throw new Error(`Unknown content creator task: ${task_type}`);
  }
}

async function handleCampaignManagerTasks(task_type: string, input_data: any, openaiKey: string) {
  switch (task_type) {
    case 'generate_ab_variants':
      const abPrompt = `Generate 3 A/B test variants for this subject line: "${input_data.base_message}"
      
      Return JSON with: { "variants": [{"text": "variant", "score": 85}] }`;

      const abContent = await callOpenAI([
        { role: 'system', content: 'You are an expert A/B testing specialist. Always return valid JSON.' },
        { role: 'user', content: abPrompt }
      ], openaiKey);

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

async function handleLeadGeneratorTasks(task_type: string, input_data: any, openaiKey: string) {
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

async function handleSocialMediaTasks(task_type: string, input_data: any, openaiKey: string) {
  switch (task_type) {
    case 'create_social_post':
      const socialPrompt = `Create engaging ${input_data.platform} content about "${input_data.content_theme}" 
      with a ${input_data.brand_voice} tone.
      
      Return JSON with: { "content": "post content", "hashtags": ["tag1", "tag2"], "optimal_time": "time" }`;

      const socialContent = await callOpenAI([
        { role: 'system', content: 'You are a social media expert. Always return valid JSON.' },
        { role: 'user', content: socialPrompt }
      ], openaiKey);

      try {
        return JSON.parse(socialContent);
      } catch {
        return { content: socialContent, hashtags: [], optimal_time: '10:00 AM' };
      }

    default:
      throw new Error(`Unknown social media task: ${task_type}`);
  }
}
