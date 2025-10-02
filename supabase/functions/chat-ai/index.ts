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
    const { message, conversationId, context } = await req.json();

    if (!conversationId || !message) {
      throw new Error('conversationId and message required');
    }

    const { data: history } = await supabase
      .from('conversation_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })
      .limit(20);

    let historyText = (history || [])
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n');

    if (estimateTokenCount(historyText) > 1500) {
      historyText = await summarizeText(historyText, openAIApiKey!);
    }

    const embedding = await generateEmbedding(`${historyText}\n${message}`, openAIApiKey!);

    const { data: chunks } = await supabase
      .rpc('search_knowledge_chunks', {
        p_user_id: context?.userId,
        p_query_embedding: embedding,
        p_limit: 5,
        p_similarity_threshold: 0.7,
      });

    const knowledgeContext = chunks && chunks.length
      ? '\n\nRelevant knowledge:\n' +
        chunks.map((c: any) => `- ${c.chunk_content}`).join('\n')
      : '';

    const messages = [
      { role: 'system', content: `You are a helpful marketing assistant.${knowledgeContext}` },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const aiResponse = await callOpenAI(messages, openAIApiKey!);

    const userEmbedding = await generateEmbedding(message, openAIApiKey!);
    await supabase.from('conversation_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
      embedding: userEmbedding,
    });

    const assistantEmbedding = await generateEmbedding(aiResponse, openAIApiKey!);
    await supabase.from('conversation_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse,
      embedding: assistantEmbedding,
    });

    if (chunks && chunks.length) {
      const refs = chunks.map((c: any) => ({
        conversation_id: conversationId,
        chunk_id: c.chunk_id,
      }));
      await supabase.from('conversation_knowledge_refs').insert(refs);
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('chat-ai error:', error);
    // Return generic error to client, log full error server-side
    const publicError = error.message?.includes('API key') || error.message?.includes('OPENAI')
      ? 'Configuration error - please contact support'
      : 'An error occurred processing your message';
    return new Response(
      JSON.stringify({ error: publicError }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});

async function callOpenAI(messages: any[], apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-2025-08-07',
      messages,
      max_completion_tokens: 1500,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }
  return data.choices[0].message.content as string;
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: text, model: 'text-embedding-ada-002' }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }
  return data.data[0].embedding as number[];
}

async function summarizeText(text: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5-mini-2025-08-07',
      messages: [
        { role: 'system', content: 'Summarize the following text' },
        { role: 'user', content: text },
      ],
      max_completion_tokens: 200,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }
  return data.choices[0].message.content as string;
}

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
