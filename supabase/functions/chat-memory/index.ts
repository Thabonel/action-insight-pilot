import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, serviceKey!);
    const { conversationId, role, content, limit = 20 } = await req.json();

    if (!conversationId) {
      throw new Error('conversationId required');
    }

    if (role && content) {
      const embedding = await generateEmbedding(content, openAIApiKey!);
      await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        role,
        content,
        embedding,
      });
    }

    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    return new Response(
      JSON.stringify({ success: true, messages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('chat-memory error:', error);
    // Return generic error to client, log full error server-side
    const publicError = error.message?.includes('API key') || error.message?.includes('OPENAI')
      ? 'Configuration error - please contact support'
      : 'An error occurred accessing conversation history';
    return new Response(
      JSON.stringify({ error: publicError }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-ada-002',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.data[0].embedding;
}
