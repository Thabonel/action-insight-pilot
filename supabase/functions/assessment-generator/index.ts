import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const AssessmentRequestSchema = z.object({
  businessType: z.string().min(1, "Business type is required"),
  targetAudience: z.string().min(1, "Target audience is required"),
  productOffer: z.string().min(1, "Product/offer is required"),
  assessmentGoal: z.string().min(1, "Assessment goal is required"),
  campaignId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate request
    const requestBody = await req.json();
    console.log('Assessment generation request:', JSON.stringify(requestBody, null, 2));

    const validationResult = AssessmentRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid request parameters',
        details: validationResult.error.errors
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { businessType, targetAudience, productOffer, assessmentGoal } = validationResult.data;

    // Check API key
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY environment variable not set');
      return new Response(JSON.stringify({
        success: false,
        error: 'Anthropic Claude API key not configured'
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build AI prompt using the 15-question methodology
    const systemPrompt = `You are an expert conversion copywriter specializing in high-converting lead generation assessments. You create assessments that achieve 20-40% conversion rates using the proven "15-Question Methodology".

Your assessments follow this structure:
- 10 Best Practice Questions: Yes/No or multiple choice about industry best practices
- 5 Qualification Questions: Deep qualification (situation, goal, obstacle, solution preference, open text)

Each question must be:
- Clear and specific
- Easy to answer (3-5 seconds per question)
- Relevant to the business/audience
- Scored with point values (0-10 per question)

Output valid JSON only.`;

    const userPrompt = `Generate a high-converting assessment for this business:

Business Type: ${businessType}
Target Audience: ${targetAudience}
Product/Service Offer: ${productOffer}
Assessment Goal: ${assessmentGoal}

Create an assessment with exactly 15 questions following this structure:

**10 Best Practice Questions** (Questions 1-10):
- Industry-specific best practices
- Yes/No or Multiple Choice (4-5 options)
- Each answer worth 0-10 points
- Higher scores = better practices being followed
- Examples: "Do you have a documented marketing strategy?" "Do you track your conversion rates?"

**5 Qualification Questions** (Questions 11-15):
1. Current Situation: "Which best describes where you are now?" (4-5 options showing progression)
2. Desired Outcome: "What do you want to achieve in 90 days?" (4-5 specific goals)
3. Main Obstacle: "What's your biggest challenge?" (4-5 common obstacles)
4. Preferred Solution: "What type of solution suits you best?" (4-5 options revealing budget/commitment)
5. Open Text: "Is there anything else we should know?" (free text for buying signals)

Also generate:
- Landing page headline (frustration hook or results hook)
- Landing page subheadline (value proposition)
- 3 key benefits of taking the assessment
- Credibility statement
- Result categories with score ranges and messaging

Return JSON in this exact format:
{
  "landing_page": {
    "headline": "Compelling headline here",
    "subheadline": "Take this assessment to discover...",
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "credibility": "Credibility statement",
    "cta_text": "Start Assessment"
  },
  "questions": [
    {
      "id": "q1",
      "text": "Question text here?",
      "type": "multiple_choice",
      "category": "best_practice",
      "options": [
        {"label": "Yes", "value": "yes", "points": 10},
        {"label": "No", "value": "no", "points": 0}
      ]
    }
  ],
  "scoring_logic": {
    "q1": {"yes": 10, "no": 0},
    "q2": {...}
  },
  "result_categories": [
    {
      "name": "high",
      "label": "Marketing Expert",
      "min_score": 75,
      "max_score": 100,
      "message": "You're doing great! Let's optimize further.",
      "insights": ["Insight 1", "Insight 2", "Insight 3"],
      "cta_text": "Book Your Strategy Call",
      "cta_action": "calendar_booking"
    },
    {
      "name": "medium",
      "label": "Growing Marketer",
      "min_score": 50,
      "max_score": 74,
      "message": "You're on the right track. Here's what's missing...",
      "insights": ["Insight 1", "Insight 2", "Insight 3"],
      "cta_text": "Download Your Custom Plan",
      "cta_action": "resource_download"
    },
    {
      "name": "low",
      "label": "Marketing Beginner",
      "min_score": 0,
      "max_score": 49,
      "message": "Let's build a strong foundation together.",
      "insights": ["Insight 1", "Insight 2", "Insight 3"],
      "cta_text": "Get Our Free Training",
      "cta_action": "training_access"
    }
  ]
}`;

    console.log('Calling Anthropic Claude API with model: claude-opus-4.5');

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4.5',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      console.error('Status:', response.status, 'StatusText:', response.statusText);
      throw new Error(errorData.error?.message || `Claude API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error('Invalid response from Claude API');
    }

    const generatedContent = data.content[0].text;
    console.log('Assessment generated successfully');

    try {
      const parsedAssessment = JSON.parse(generatedContent);

      // Validate structure
      if (!parsedAssessment.questions || parsedAssessment.questions.length !== 15) {
        throw new Error(`Expected 15 questions, got ${parsedAssessment.questions?.length || 0}`);
      }

      if (!parsedAssessment.scoring_logic) {
        throw new Error('Missing scoring_logic in generated assessment');
      }

      if (!parsedAssessment.result_categories || parsedAssessment.result_categories.length !== 3) {
        throw new Error('Expected 3 result categories (high, medium, low)');
      }

      if (!parsedAssessment.landing_page) {
        throw new Error('Missing landing_page content');
      }

      return new Response(JSON.stringify({
        success: true,
        assessment: parsedAssessment,
        metadata: {
          questionsGenerated: parsedAssessment.questions.length,
          bestPracticeCount: parsedAssessment.questions.filter((q: Record<string, unknown>) => q.category === 'best_practice').length,
          qualificationCount: parsedAssessment.questions.filter((q: Record<string, unknown>) => q.category === 'qualification').length,
          generatedAt: new Date().toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError: unknown) {
      console.error('JSON parsing failed:', parseError);
      console.error('Raw content:', generatedContent);

      const parseErrorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';

      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to parse generated assessment',
        details: parseErrorMessage,
        raw_content: generatedContent.substring(0, 500)
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: unknown) {
    console.error('Error in assessment-generator function:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }

    const errorMessage = error instanceof Error ? error instanceof Error ? error.message : String(error) : 'An error occurred generating assessment';
    const isConfigError = errorMessage.includes('API key') || errorMessage.includes('configured');

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      hint: isConfigError ? 'Check that ANTHROPIC_API_KEY is set in Supabase Edge Function environment variables' : undefined
    }), {
      status: isConfigError ? 503 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
