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

    // Prepare the system prompt for campaign creation specialist
    const systemPrompt = `You are PAM, a specialized Campaign Creation Assistant. Your primary goal is to guide users through creating comprehensive marketing campaigns by asking strategic questions and enhancing their answers.

CORE RESPONSIBILITIES:
1. Ask strategic marketing questions ONE AT A TIME in a conversational manner
2. Enhance simple user answers into professional marketing language 
3. Track which campaign elements have been gathered
4. Know when enough information exists to create a campaign

QUESTION SEQUENCE TO FOLLOW:
1. Industry/Business Context
2. Target Audience (demographics, behaviors, pain points)
3. Budget (total marketing budget)
4. Goals/Objectives (what they want to achieve)
5. Timeline (campaign duration)
6. Marketing Channels (preferred platforms)
7. Key Messages (value propositions, unique selling points)
8. Success Metrics (how they'll measure results)

CONVERSATION STYLE:
- Ask ONE question at a time, never multiple
- Acknowledge their previous answer before asking the next question
- Enhance their simple answers into professional marketing language
- Show enthusiasm and expertise
- Be conversational, not robotic
- When you have enough info (6+ key elements), offer to create the campaign

RESPONSE FORMAT:
- Acknowledge their answer professionally
- Ask the next strategic question
- Keep responses concise but engaging
- Use marketing terminology appropriately

${userContext ? `User Context: ${userContext}` : ''}

Remember: You are building a campaign step-by-step. Stay focused on the questionnaire until you have comprehensive campaign details.`

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

  // Campaign creation focused suggestions
  if (queryLower.includes('industry') || queryLower.includes('business')) {
    return [
      "Tell me about your target audience",
      "What's your marketing budget?",
      "What are your main campaign goals?",
      "I want to create a new campaign"
    ]
  }

  if (queryLower.includes('audience') || queryLower.includes('target')) {
    return [
      "What's your budget for this campaign?",
      "What goals do you want to achieve?",
      "Which marketing channels interest you?",
      "How long should this campaign run?"
    ]
  }

  if (queryLower.includes('budget') || queryLower.includes('spend')) {
    return [
      "What are your campaign objectives?",
      "How long should the campaign run?",
      "Which marketing channels do you prefer?",
      "What's your key message?"
    ]
  }

  if (queryLower.includes('goal') || queryLower.includes('objective')) {
    return [
      "How long should this campaign run?",
      "Which marketing channels work best for you?",
      "What's your unique value proposition?",
      "How will you measure success?"
    ]
  }

  if (queryLower.includes('channel') || queryLower.includes('platform')) {
    return [
      "What's your key marketing message?",
      "How will you measure campaign success?",
      "What makes your offering unique?",
      "Create the campaign now"
    ]
  }

  // Default campaign creation suggestions
  return [
    "I want to create a new marketing campaign",
    "Help me plan a campaign strategy",
    "What industry are you in?",
    "Let's start building your campaign"
  ]
}