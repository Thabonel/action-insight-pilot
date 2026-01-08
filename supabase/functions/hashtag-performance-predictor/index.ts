import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HashtagPrediction {
  hashtag: string
  predicted_engagement: number
  confidence: number
  recommendation: 'excellent' | 'good' | 'average' | 'poor'
  reasoning: string
  similar_hashtags: string[]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const { hashtags, platform, postContent } = await req.json()

    if (!hashtags || !Array.isArray(hashtags) || hashtags.length === 0) {
      return new Response(
        JSON.stringify({ predictions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Performance Predictor] Analyzing hashtags for user:', user.id)

    const predictions: HashtagPrediction[] = []

    for (const hashtag of hashtags) {
      const cleanTag = hashtag.trim().startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`

      // Get historical data for this exact hashtag
      const { data: historical } = await supabase
        .from('hashtag_suggestions')
        .select('usage_count, avg_engagement_rate')
        .eq('user_id', user.id)
        .eq('hashtag', cleanTag)
        .eq('platform', platform)
        .single()

      // Get similar hashtags (same platform, similar engagement patterns)
      const { data: similarHashtags } = await supabase
        .from('hashtag_suggestions')
        .select('hashtag, avg_engagement_rate, usage_count')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .neq('hashtag', cleanTag)
        .order('avg_engagement_rate', { ascending: false, nullsLast: true })
        .limit(5)

      // Calculate prediction based on historical data
      let predictedEngagement = 2.5 // Default baseline for new hashtags
      let confidence = 0.5
      let recommendation: 'excellent' | 'good' | 'average' | 'poor' = 'average'
      let reasoning = ''

      if (historical && historical.avg_engagement_rate !== null) {
        // We have data for this exact hashtag
        predictedEngagement = historical.avg_engagement_rate
        confidence = Math.min(0.5 + (historical.usage_count * 0.05), 0.95)

        if (predictedEngagement >= 5) {
          recommendation = 'excellent'
          reasoning = `This hashtag historically performs at ${predictedEngagement.toFixed(1)}% engagement. Keep using it!`
        } else if (predictedEngagement >= 3) {
          recommendation = 'good'
          reasoning = `Solid performer at ${predictedEngagement.toFixed(1)}% engagement. Good choice.`
        } else if (predictedEngagement >= 1.5) {
          recommendation = 'average'
          reasoning = `Moderate performance at ${predictedEngagement.toFixed(1)}% engagement. Consider alternatives.`
        } else {
          recommendation = 'poor'
          reasoning = `Low engagement at ${predictedEngagement.toFixed(1)}%. Try different hashtags.`
        }
      } else if (similarHashtags && similarHashtags.length > 0) {
        // No direct data, but we have similar hashtags
        const avgSimilar = similarHashtags.reduce((sum, h) =>
          sum + (h.avg_engagement_rate || 0), 0
        ) / similarHashtags.length

        predictedEngagement = avgSimilar
        confidence = 0.6

        reasoning = `New hashtag. Based on similar hashtags, predicted ${predictedEngagement.toFixed(1)}% engagement.`

        if (predictedEngagement >= 3) {
          recommendation = 'good'
        } else if (predictedEngagement >= 1.5) {
          recommendation = 'average'
        } else {
          recommendation = 'poor'
        }
      } else {
        // No data at all - new user or new hashtag
        reasoning = 'No historical data. Predicted baseline engagement of 2.5%.'
        recommendation = 'average'
        confidence = 0.3
      }

      predictions.push({
        hashtag: cleanTag,
        predicted_engagement: predictedEngagement,
        confidence,
        recommendation,
        reasoning,
        similar_hashtags: similarHashtags?.map(h => h.hashtag) || []
      })
    }

    // Sort by predicted engagement (best first)
    predictions.sort((a, b) => b.predicted_engagement - a.predicted_engagement)

    console.log(`[Performance Predictor] Generated predictions for ${predictions.length} hashtags`)

    return new Response(
      JSON.stringify({ predictions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('[Performance Predictor] Error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error) || 'Failed to predict performance',
        predictions: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
