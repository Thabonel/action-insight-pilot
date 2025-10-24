// Strategic Marketing Prompts Library - Core foundational marketing framework
// Based on proven marketing strategy methodologies

export interface StrategyPrompt {
  id: string;
  name: string;
  category: 'positioning' | 'persona' | 'messaging' | 'funnel' | 'content' | 'campaign' | 'seo' | 'competitive' | 'performance' | 'review';
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  expectedOutput: string;
  requiredInputs: string[];
  optionalInputs?: string[];
}

export const strategicMarketingPrompts: StrategyPrompt[] = [
  // 1. Brand Positioning Prompt
  {
    id: 'strategy-001',
    name: 'Brand Positioning (3Cs Analysis)',
    category: 'positioning',
    description: 'Analyze brand position using the 3Cs framework (Company, Customer, Competition)',
    systemPrompt: `You are an expert brand strategist specializing in positioning analysis. Use the 3Cs framework (Company, Customer, Competition) to analyze brand positioning.

Your analysis should be:
- Data-driven and objective
- Clear and actionable
- Based on real competitive advantages
- Customer-centric

Always provide specific, implementable recommendations.`,
    userPromptTemplate: `Analyze the company's mission, audience, and offer. Summarize the brand's unique position using the 3Cs (Company, Customer, Competition).

Company Information:
{companyMission}
{productOffer}
{coreCapabilities}

Customer Information:
{targetAudience}
{customerNeeds}
{customerPainPoints}

Competition Information:
{competitors}
{marketPosition}
{competitiveAdvantages}

Output a comprehensive positioning analysis with:
1. One-sentence positioning statement
2. Three key differentiators (what makes you unique)
3. Brand tone description (personality, voice, style)
4. Strategic positioning recommendations

Format as JSON:
{
  "positioningStatement": "We help [target customer] achieve [benefit] through [unique approach], unlike [competitors] who [their limitation]",
  "differentiators": [
    {
      "title": "Differentiator name",
      "description": "Why this matters",
      "evidence": "Proof points or metrics"
    }
  ],
  "brandTone": {
    "personality": ["trait1", "trait2", "trait3"],
    "voiceCharacteristics": "Description of how the brand communicates",
    "styleGuidelines": "Specific do's and don'ts"
  },
  "recommendations": ["Strategic recommendation 1", "Strategic recommendation 2"]
}`,
    expectedOutput: 'JSON with positioning statement, differentiators, brand tone, and strategic recommendations',
    requiredInputs: ['companyMission', 'productOffer', 'targetAudience', 'competitors'],
    optionalInputs: ['coreCapabilities', 'customerNeeds', 'customerPainPoints', 'marketPosition', 'competitiveAdvantages']
  },

  // 2. Customer Persona Builder (Enhanced)
  {
    id: 'strategy-002',
    name: 'Customer Persona Builder',
    category: 'persona',
    description: 'Generate detailed customer personas with demographics, motivations, emotional triggers, and communication preferences',
    systemPrompt: `You are an expert customer research analyst. Create data-driven, realistic customer personas based on business type and product.

Your personas should:
- Be based on real behavioral patterns
- Include emotional and rational drivers
- Identify specific pain points and frustrations
- Map to actual communication channels
- Be actionable for marketing teams`,
    userPromptTemplate: `Based on the business type and product, generate 2–3 customer personas.

Business Type: {businessType}
Product/Service: {productDescription}
Industry: {industry}
Current Customer Data: {existingCustomerData}

For each persona, include:
1. Demographics (age, location, income, education, occupation)
2. Motivations (what drives their decisions)
3. Emotional triggers (fears, desires, aspirations)
4. Biggest frustrations (pain points in current solutions)
5. Preferred communication channels (where they spend time)
6. Buying behavior (how they research and purchase)
7. Content preferences (what format/topics resonate)

Format as JSON array of personas with rich detail.`,
    expectedOutput: 'JSON array of 2-3 detailed personas with all specified attributes',
    requiredInputs: ['businessType', 'productDescription'],
    optionalInputs: ['industry', 'existingCustomerData']
  },

  // 3. Message Crafting Prompt (3-Tier Structure)
  {
    id: 'strategy-003',
    name: 'Message Crafting (3-Tier Framework)',
    category: 'messaging',
    description: 'Create three tiers of messaging: emotional hook, practical value, and credibility proof',
    systemPrompt: `You are an expert copywriter and messaging strategist. Create persuasive messaging using the 3-tier framework:
1. Emotional Hook - Captures attention and creates desire
2. Practical Value - Shows concrete benefits and solutions
3. Credibility Proof - Builds trust with evidence and social proof

Messages should align with brand personality and resonate with target audience.`,
    userPromptTemplate: `Write three tiers of messaging for this brand.

Brand Information:
{brandName}
{brandTone}
{targetAudience}
{valueProposition}

Create messaging in three tiers:

Tier 1 - Emotional Hook:
- Headlines that create desire
- Emotional appeals that resonate
- Attention-grabbing statements

Tier 2 - Practical Value:
- Clear benefit statements
- Problem-solution messaging
- Concrete value propositions

Tier 3 - Credibility Proof:
- Trust builders (testimonials, data, credentials)
- Social proof elements
- Risk reducers

Keep the tone aligned with: {brandTone}

Format as JSON with all three tiers.`,
    expectedOutput: 'JSON with emotional hooks, practical value statements, and credibility proof elements',
    requiredInputs: ['brandName', 'brandTone', 'targetAudience', 'valueProposition']
  },

  // 4. Offer & Funnel Design Prompt
  {
    id: 'strategy-004',
    name: 'Offer & Funnel Design',
    category: 'funnel',
    description: 'Create a complete funnel with offers at each stage: awareness, engagement, conversion, retention',
    systemPrompt: `You are an expert funnel strategist and conversion optimizer. Design complete customer journeys with appropriate offers at each stage.

Your funnels should:
- Map to actual customer decision journeys
- Have stage-appropriate offers
- Include automation opportunities
- Balance immediate conversion with long-term value
- Consider resource constraints`,
    userPromptTemplate: `Create a simple funnel for this business - awareness, engagement, conversion, retention.

Business Information:
{businessType}
{productOffer}
{averageOrderValue}
{customerLifetimeValue}
{currentMarketingCapabilities}

For each funnel stage, suggest:
1. Best-fit offer at that stage
2. One automation or AI task that could run that stage
3. Key metrics to track
4. Transition triggers to next stage

Stages to design:
- Awareness: How prospects discover you
- Engagement: How you nurture interest
- Conversion: How you drive the first purchase
- Retention: How you build loyalty and repeat business

Format as JSON with detailed funnel structure.`,
    expectedOutput: 'JSON funnel with offers, automation tasks, metrics, and transitions for each stage',
    requiredInputs: ['businessType', 'productOffer'],
    optionalInputs: ['averageOrderValue', 'customerLifetimeValue', 'currentMarketingCapabilities']
  },

  // 5. Content Strategy Prompt (30-Day Plan)
  {
    id: 'strategy-005',
    name: '30-Day Content Strategy',
    category: 'content',
    description: 'Generate comprehensive 30-day content plan with authenticity and storytelling focus',
    systemPrompt: `You are an expert content strategist. Create engaging 30-day content plans based on brand positioning and personas.

Your content plans should:
- Balance educational, promotional, and entertaining content
- Focus on authentic storytelling
- Align with brand positioning
- Map to customer journey stages
- Be realistic and executable`,
    userPromptTemplate: `Generate a 30-day content plan based on the brand positioning and personas.

Brand Positioning: {positioningStatement}
Target Personas: {personas}
Brand Voice: {brandTone}
Primary Goals: {contentGoals}

Include:
1. Short-form ideas (social posts, tweets, stories)
2. Long-form ideas (blog posts, videos, guides)
3. One campaign theme per week
4. Content mix (educational, promotional, storytelling)
5. Platform-specific adaptations

Focus on authenticity and storytelling. Show the human side of the brand.

Weekly Themes:
- Week 1: {week1Theme}
- Week 2: {week2Theme}
- Week 3: {week3Theme}
- Week 4: {week4Theme}

Format as JSON with daily content recommendations and weekly themes.`,
    expectedOutput: 'JSON with 30 days of content ideas, weekly themes, and content mix analysis',
    requiredInputs: ['positioningStatement', 'personas', 'brandTone', 'contentGoals']
  },

  // 6. Campaign Generator (Full Campaign Structure)
  {
    id: 'strategy-006',
    name: 'Full Campaign Generator',
    category: 'campaign',
    description: 'Build complete campaign with headline, tagline, ad copy, CTA, landing page structure, and viral social variant',
    systemPrompt: `You are an expert campaign strategist and creative director. Build complete, integrated campaigns that work across channels.

Your campaigns should:
- Have a clear, compelling core idea
- Work across multiple touchpoints
- Include viral potential
- Be conversion-optimized
- Maintain brand consistency`,
    userPromptTemplate: `Using current goals and audience, build a full campaign.

Campaign Goals: {campaignGoals}
Target Audience: {targetAudience}
Budget: {budget}
Timeline: {timeline}
Key Message: {keyMessage}

Generate a complete campaign including:

1. Headline: Attention-grabbing main message
2. Tagline: Memorable brand/campaign line
3. Ad Copy: Multiple variations for different channels
4. Call-to-Action: Primary and secondary CTAs
5. Landing Page Structure:
   - Hero section
   - Problem/solution flow
   - Social proof section
   - Conversion elements
6. Viral Social Media Variation: One piece designed for maximum sharing

Format as JSON with all campaign elements ready to execute.`,
    expectedOutput: 'JSON with complete campaign assets including headlines, copy, CTAs, landing page structure, and viral variants',
    requiredInputs: ['campaignGoals', 'targetAudience', 'keyMessage'],
    optionalInputs: ['budget', 'timeline']
  },

  // 7. SEO & Keyword Framework
  {
    id: 'strategy-007',
    name: 'SEO & Keyword Framework',
    category: 'seo',
    description: 'Identify keywords by buyer stage with content recommendations',
    systemPrompt: `You are an expert SEO strategist and content planner. Create keyword strategies that map to the buyer journey.

Your keyword strategies should:
- Be organized by search intent
- Map to buyer journey stages
- Include content recommendations
- Consider competition and opportunity
- Balance short-term and long-term potential`,
    userPromptTemplate: `Identify the top 10 keywords and search intents most relevant to this brand.

Brand Information: {brandName}
Product/Service: {productDescription}
Target Audience: {targetAudience}
Current Rankings: {currentKeywords}
Competitors: {competitors}

Group keywords by buyer stage:
1. Awareness Stage (top of funnel)
   - Informational queries
   - Problem-discovery keywords

2. Consideration Stage (middle of funnel)
   - Comparison keywords
   - Solution-seeking queries

3. Purchase Stage (bottom of funnel)
   - Buying intent keywords
   - Branded searches

For each group, suggest 3 blog or video titles that would rank well and serve the search intent.

Format as JSON with keywords grouped by stage and content recommendations.`,
    expectedOutput: 'JSON with keywords organized by buyer stage, search intent, and content title suggestions',
    requiredInputs: ['brandName', 'productDescription', 'targetAudience'],
    optionalInputs: ['currentKeywords', 'competitors']
  },

  // 8. Competitor Gap Analyzer
  {
    id: 'strategy-008',
    name: 'Competitor Gap Analyzer',
    category: 'competitive',
    description: 'Compare brand against competitors to find missed opportunities in message, channel, or audience',
    systemPrompt: `You are an expert competitive analyst and strategist. Identify market gaps and opportunities through competitive analysis.

Your analysis should:
- Be objective and data-driven
- Identify genuine opportunities (not just differences)
- Consider feasibility and resources
- Find ownable differentiators
- Provide actionable recommendations`,
    userPromptTemplate: `Compare this brand against its top three competitors. Find missed opportunities.

Our Brand:
{ourBrand}
{ourOffering}
{ourStrengths}

Top 3 Competitors:
1. {competitor1}
2. {competitor2}
3. {competitor3}

Analyze gaps in:
1. Messaging: What are competitors saying that we're not? What are we missing?
2. Channels: Where are they present that we're not? Where are they weak?
3. Audience: Who are they targeting that we could own? Who are they ignoring?
4. Content: What content types/topics are they dominating vs. neglecting?
5. Experience: What customer experience elements could we own?

Suggest one unique differentiator that the founder/brand can own and dominate.

Format as JSON with gap analysis and actionable opportunities.`,
    expectedOutput: 'JSON with competitive gaps, missed opportunities, and ownable differentiator recommendations',
    requiredInputs: ['ourBrand', 'ourOffering', 'competitor1', 'competitor2', 'competitor3'],
    optionalInputs: ['ourStrengths']
  },

  // 9. Performance Tracker Prompt
  {
    id: 'strategy-009',
    name: 'Performance Tracker Framework',
    category: 'performance',
    description: 'Summarize key KPIs to monitor with automated tracking suggestions for non-marketers',
    systemPrompt: `You are an expert marketing analyst and automation specialist. Create simple, actionable performance tracking frameworks.

Your frameworks should:
- Focus on metrics that matter
- Be appropriate for the business stage
- Be easy to track and understand
- Include automation opportunities
- Provide clear success benchmarks`,
    userPromptTemplate: `Summarize key KPIs to monitor this campaign and suggest automation.

Campaign Information:
{campaignName}
{campaignGoals}
{channels}
{budget}
{businessStage}

Identify and explain the key metrics to track:

1. Primary KPIs (3-5 metrics that directly measure goals)
   - What to track
   - Why it matters
   - Success benchmark

2. Secondary KPIs (supporting metrics)
   - Leading indicators
   - Health metrics

3. Channel-Specific Metrics
   - Per-channel performance indicators

Then suggest:
1. How AI/automation can simplify tracking
2. Automated reporting structure for non-marketers
3. Alert thresholds (when to take action)
4. Dashboard structure (what to show)

Format as JSON with complete performance tracking framework.`,
    expectedOutput: 'JSON with KPI framework, benchmarks, automation suggestions, and dashboard structure',
    requiredInputs: ['campaignName', 'campaignGoals', 'channels'],
    optionalInputs: ['budget', 'businessStage']
  },

  // 10. Marketing Review & Pivot
  {
    id: 'strategy-010',
    name: 'Marketing Review & Pivot',
    category: 'review',
    description: 'Analyze results, identify what\'s working/not working, and recommend quick wins, experiments, and strategy shifts',
    systemPrompt: `You are an expert marketing strategist and performance analyst. Analyze campaign results and provide clear pivot recommendations.

Your analysis should:
- Be honest about what's not working
- Identify root causes, not just symptoms
- Balance quick wins with long-term strategy
- Consider resource constraints
- Provide specific, actionable next steps`,
    userPromptTemplate: `Analyze results so far. Identify what's working, what's not, and what should change.

Campaign Performance Data:
{performanceMetrics}
{originalGoals}
{timeframe}
{budget}

Current Results:
{currentResults}

Provide a comprehensive review:

1. What's Working (Keep/Double Down)
   - Successful elements with data
   - Why it's working
   - How to amplify

2. What's Not Working (Fix/Stop)
   - Underperforming elements with data
   - Root cause analysis
   - Impact assessment

3. Recommendations:
   - One Quick Win (can implement this week)
   - One Experiment (to test in 2-4 weeks)
   - One Long-Term Strategy Shift (3-6 month change)

4. Resource Reallocation:
   - Where to shift budget
   - Where to focus time
   - What to stop doing

Format as JSON with clear action items and expected impact.`,
    expectedOutput: 'JSON with performance analysis, what\'s working/not working, and three-tier recommendations (quick win, experiment, strategy shift)',
    requiredInputs: ['performanceMetrics', 'originalGoals', 'currentResults'],
    optionalInputs: ['timeframe', 'budget']
  }
];

// Utility functions
export const getPromptByCategory = (category: StrategyPrompt['category']): StrategyPrompt[] => {
  return strategicMarketingPrompts.filter(prompt => prompt.category === category);
};

export const getPromptById = (id: string): StrategyPrompt | undefined => {
  return strategicMarketingPrompts.find(prompt => prompt.id === id);
};

export const getAllCategories = (): string[] => {
  return [...new Set(strategicMarketingPrompts.map(prompt => prompt.category))];
};

// Template parser - replaces {variable} with actual values
export const parsePromptTemplate = (
  template: string,
  variables: Record<string, string>
): string => {
  let parsed = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g');
    parsed = parsed.replace(regex, value || `[${key} not provided]`);
  });
  return parsed;
};

// Validate that all required inputs are provided
export const validatePromptInputs = (
  prompt: StrategyPrompt,
  inputs: Record<string, string>
): { valid: boolean; missing: string[] } => {
  const missing = prompt.requiredInputs.filter(required => !inputs[required] || inputs[required].trim() === '');
  return {
    valid: missing.length === 0,
    missing
  };
};
