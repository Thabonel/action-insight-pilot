import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface GTMInputs {
  productName: string;
  productCategory: string;
  productSubCategory: string;
  targetLaunchDate: string;
  primaryMarkets: string[];
  coreValueProposition: string;
  budgetCeiling: number;
  userId: string;
}

interface MarketResearchData {
  competitors: any[];
  marketSize: any;
  industryTrends: any[];
  pricingBenchmarks: any[];
}

async function searchMarketData(query: string): Promise<any> {
  try {
    // Use Perplexity API for real-time market research
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!perplexityKey) {
      // Fallback to GPT-4 with general knowledge
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5',
          messages: [
            {
              role: 'system',
              content: 'You are a market research analyst. Provide accurate, data-driven insights based on your knowledge. Always cite sources and provide specific numbers when possible.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          temperature: 0.3,
        }),
      });
      
      const data = await response.json();
      return data.choices[0].message.content;
    }

    // Use Perplexity for real-time research
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a market research analyst. Provide accurate, current market data with citations. Focus on concrete numbers, market sizes, competitor analysis, and trends.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        search_recency_filter: 'month',
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Market research error:', error);
    return `Unable to fetch real-time data for: ${query}`;
  }
}

async function conductMarketResearch(inputs: GTMInputs): Promise<MarketResearchData> {
  console.log('Starting market research for:', inputs.productName);

  const queries = [
    `${inputs.productCategory} market size 2024 TAM SAM SOM analysis revenue growth rate`,
    `Top 6 competitors in ${inputs.productCategory} ${inputs.productSubCategory} pricing features market share 2024`,
    `${inputs.productCategory} industry trends 2024 adoption drivers growth factors consumer behavior`,
    `${inputs.productCategory} pricing benchmarks subscription models freemium premium tiers 2024`
  ];

  const [marketSizeData, competitorData, trendsData, pricingData] = await Promise.all(
    queries.map(query => searchMarketData(query))
  );

  return {
    competitors: competitorData,
    marketSize: marketSizeData,
    industryTrends: trendsData,
    pricingBenchmarks: pricingData
  };
}

async function generateGTMStrategy(inputs: GTMInputs, researchData: MarketResearchData): Promise<string> {
  const prompt = `
Generate a comprehensive Go-to-Market (GTM) strategy document in Markdown format for the following product:

**Product Details:**
- Name: ${inputs.productName}
- Category: ${inputs.productCategory} / ${inputs.productSubCategory}
- Launch Date: ${inputs.targetLaunchDate}
- Markets: ${inputs.primaryMarkets.join(', ')}
- Value Proposition: ${inputs.coreValueProposition}
- Budget: $${inputs.budgetCeiling.toLocaleString()}

**Market Research Data:**
${JSON.stringify(researchData, null, 2)}

Create a GTM strategy document with the following structure:

# GTM Strategy: ${inputs.productName}

## Executive Summary
(≤ 300 words covering key strategy highlights, market opportunity, target metrics)

## 1. Product Definition & Market Research
### Product Concept & UVP
### Competitive Landscape
(Top 6 competitors with pricing and key features in table format)
### Target Personas
(3 personas with demographics, psychographics, pain points, buying triggers)

## 2. Market Sizing Analysis
### TAM, SAM, SOM Calculations
| Metric | Market Size | Growth Rate | Notes |
|--------|-------------|-------------|-------|
| TAM | | | |
| SAM | | | |
| SOM | | | |

### 5-Year Market Projections
### Key Adoption Drivers

## 3. Customer Acquisition Strategy
### Channel Recommendations
| Channel | Projected CAC | Conversion Rate | Priority | Notes |
|---------|---------------|-----------------|----------|-------|
| | | | | |

### 90-Day Channel Calendar
| Week | Channel | Action Items | KPIs | Owner |
|------|---------|--------------|------|-------|
| | | | | |

### Unit Economics
| Metric | Value | Notes |
|--------|-------|-------|
| CAC | | |
| LTV | | |
| LTV:CAC | | |
| Break-even Timeline | | |

## 4. Pricing Strategy Development
### 3-Tier Pricing Structure
| Tier | Price (Monthly/Annual) | Features | Target Segment |
|------|----------------------|----------|----------------|
| Free/Freemium | | | |
| Core | | | |
| Premium | | | |

### Unit Economics & Assumptions
| Metric | Free | Core | Premium |
|--------|------|------|---------|
| Churn Rate | | | |
| LTV | | | |
| Conversion Rate | | | |

## 5. Launch Timeline & Execution Plan
### Pre-Launch (90 days)
| Milestone | Owner | Due Date | Status | KPIs |
|-----------|-------|----------|--------|------|
| | | | | |

### Launch Phase (30 days)
| Milestone | Owner | Due Date | Status | KPIs |
|-----------|-------|----------|--------|------|
| | | | | |

### Post-Launch (60 days)
| Milestone | Owner | Due Date | Status | KPIs |
|-----------|-------|----------|--------|------|
| | | | | |

### Risk Register
| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| | | | | |

## Implementation Checklist
- [ ] Task 1 (Owner: , Due: )
- [ ] Task 2 (Owner: , Due: )
- [ ] Task 3 (Owner: , Due: )

**Requirements:**
- Use real data and current market insights from the research provided
- All tables must be properly formatted in GitHub-flavored Markdown
- Ensure LTV:CAC ≥ 4:1 in recommendations
- Include specific, actionable deadlines and owners
- Cite data sources with inline links where applicable
- Keep total length 1,500-2,500 words
- Use USD for all financial figures
- No placeholders - all sections must be complete and actionable
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: 'You are an expert GTM strategist and business analyst. Create comprehensive, actionable go-to-market strategies based on real market data. Always provide specific numbers, deadlines, and actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inputs, sessionId } = await req.json() as { inputs: GTMInputs; sessionId?: string };

    console.log('GTM Planner request:', inputs);

    // Validate required inputs
    const requiredFields = ['productName', 'productCategory', 'coreValueProposition', 'budgetCeiling'];
    for (const field of requiredFields) {
      if (!inputs[field]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Step 1: Conduct market research
    console.log('Conducting market research...');
    const researchData = await conductMarketResearch(inputs);

    // Step 2: Generate GTM strategy
    console.log('Generating GTM strategy...');
    const strategy = await generateGTMStrategy(inputs, researchData);

    // Step 3: Save to database
    const { data: savedStrategy, error: saveError } = await supabase
      .from('gtm_strategies')
      .insert({
        user_id: inputs.userId,
        session_id: sessionId,
        product_name: inputs.productName,
        inputs: inputs,
        research_data: researchData,
        strategy_content: strategy,
        status: 'completed'
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving strategy:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save strategy' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('GTM strategy generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        strategy: strategy,
        strategyId: savedStrategy.id,
        researchData: researchData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in GTM planner:', error);
    // Return generic error to client, log full error server-side
    const publicError = error.message?.includes('API key') || error.message?.includes('OPENAI') || error.message?.includes('PERPLEXITY')
      ? 'Configuration error - please contact support'
      : error.message?.includes('Missing required field')
      ? error.message
      : 'An error occurred generating GTM strategy';
    return new Response(
      JSON.stringify({ error: publicError }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});