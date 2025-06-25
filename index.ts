import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { query, context, user_id } = await req.json()

    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required and must be a string' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user context from campaigns and leads if available
    let userContext = ''
    if (user_id) {
      try {
        // Fetch user's recent campaigns
        const { data: campaigns } = await supabaseClient
          .from('campaigns')
          .select('name, type, status, primary_objective')
          .eq('created_by', user_id)
          .limit(5)

        // Fetch user's recent leads
        const { data: leads } = await supabaseClient
          .from('leads')
          .select('score, status')
          .eq('created_by', user_id)
          .limit(10)

        if (campaigns && campaigns.length > 0) {
          userContext += `User's recent campaigns: ${campaigns.map(c => `${c.name} (${c.type}, ${c.status})`).join(', ')}. `
        }

        if (leads && leads.length > 0) {
          const avgScore = leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length
          userContext += `User has ${leads.length} leads with average score ${avgScore.toFixed(1)}. `
        }
      } catch (error) {
        console.log('Could not fetch user context:', error)
      }
    }

    // Prepare the system prompt for marketing context
    const systemPrompt = `You are PAM, an intelligent AI marketing assistant for a comprehensive marketing automation platform. You help users with:

1. Campaign strategy and optimization
2. Content creation and marketing copy
3. Lead management and scoring
4. Email marketing campaigns
5. Social media management
6. Analytics and performance insights
7. Marketing automation workflows

${userContext ? `User Context: ${userContext}` : ''}

Always provide actionable, specific advice. Be friendly but professional. Focus on practical marketing solutions.`

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${openAIResponse.status}`)
    }

    const openAIData = await openAIResponse.json()
    const aiResponse = openAIData.choices[0]?.message?.content || 'I apologize, but I could not generate a response at this time.'

    // Generate relevant suggestions based on the query topic
    const suggestions = generateSuggestions(query, aiResponse)

    // Store chat session in database
    if (user_id) {
      try {
        await supabaseClient
          .from('chat_sessions')
          .insert({
            user_id,
            query,
            response: aiResponse,
            context: context || {},
            created_at: new Date().toISOString()
          })
      } catch (error) {
        console.log('Could not store chat session:', error)
        // Continue anyway - don't fail the request
      }
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        suggestions,
        followUp: [
          "Would you like me to elaborate on any specific point?",
          "Should I help you create a detailed plan for this?",
          "Do you need specific examples or templates?"
        ]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in chat-agent function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'Something went wrong'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function generateSuggestions(query: string, response: string): string[] {
  const queryLower = query.toLowerCase()
  const responseLower = response.toLowerCase()

  // Marketing-focused suggestions based on query content
  if (queryLower.includes('campaign')) {
    return [
      "How can I improve my campaign ROI?",
      "What are the best practices for campaign targeting?",
      "Show me campaign performance metrics",
      "Help me optimize my campaign budget"
    ]
  }

  if (queryLower.includes('email')) {
    return [
      "How can I improve my email open rates?",
      "What subject lines work best?",
      "Help me create an email sequence",
      "Show me email automation workflows"
    ]
  }

  if (queryLower.includes('content')) {
    return [
      "Generate content ideas for my industry",
      "Help me create a content calendar",
      "What content performs best on social media?",
      "Show me content optimization tips"
    ]
  }

  if (queryLower.includes('lead')) {
    return [
      "How can I improve lead quality?",
      "What's the best lead scoring strategy?",
      "Help me create lead nurturing campaigns",
      "Show me lead conversion tactics"
    ]
  }

  if (queryLower.includes('social')) {
    return [
      "What's the best posting schedule?",
      "Help me create engaging social content",
      "How can I increase social engagement?",
      "Show me social media analytics"
    ]
  }

  // Default suggestions
  return [
    "Tell me more about marketing automation",
    "How can I improve my overall marketing performance?",
    "What metrics should I be tracking?",
    "Help me create a marketing strategy"
  ]
}