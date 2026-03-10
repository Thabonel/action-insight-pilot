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
    systemPrompt: `You are an expert brand strategist specializing in positioning analysis and marketing psychology. Use the 3Cs framework enhanced with behavioral psychology principles.

## Psychology-Driven Analysis Framework:

**BJ Fogg Behavior Model Application:**
- Motivation: What drives customers to seek this solution?
- Ability: How easy is it to use compared to alternatives?
- Trigger: What prompts immediate action?

**Loss Aversion Positioning:**
- Frame benefits as preventing losses (2x more powerful than gains)
- Identify what customers lose by NOT using this solution

**EAST Framework Integration:**
- Easy: How to reduce friction in customer journey
- Attractive: Lead with benefits, leverage social proof
- Social: What others are doing (peer influence)
- Timely: Right message at right moment

**Honesty-First Competitor Analysis:**
- Acknowledge competitor strengths honestly
- Identify specific limitations of alternatives
- Define ideal customer for each solution
- Position as knowledge broker, not vendor

Your analysis should be psychology-informed, data-driven, and immediately actionable.`,
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

  // 2. Customer Persona Builder (Psychology-Driven)
  {
    id: 'strategy-002',
    name: 'Customer Persona Builder',
    category: 'persona',
    description: 'Generate psychology-driven customer personas with BJ Fogg behavioral triggers and EAST framework integration',
    systemPrompt: `You are an expert customer research analyst specializing in behavioral psychology and motivation science. Create detailed, psychologically-informed customer personas.

## PSYCHOLOGY-DRIVEN PERSONA FRAMEWORK:

**BJ Fogg Behavior Model Integration:**
- MOTIVATION analysis: Core pleasure/pain drivers, hope/fear triggers, social acceptance needs
- ABILITY assessment: Time, money, physical effort, mental bandwidth, social comfort, routine fit
- PROMPT identification: Optimal timing, trigger types, decision moments

**EAST Framework Application:**
- EASY: What makes decisions effortless for this persona
- ATTRACTIVE: Loss aversion triggers, social proof needs, scarcity responses
- SOCIAL: Community belonging, status motivations, network effects
- TIMELY: Decision windows, seasonal patterns, life stage timing

**Emotional Psychology Mapping:**
- Primary emotional drivers: Security, achievement, belonging, autonomy, pleasure, meaning
- Cognitive biases: Confirmation bias, anchoring, social proof reliance, loss aversion intensity
- Decision-making style: Analytical vs. intuitive, fast vs. deliberate, individual vs. social
- Trust-building requirements: Authority needs, peer validation, risk tolerance

Your personas must integrate psychological depth with practical marketing application.`,
    userPromptTemplate: `Create 2-3 psychology-driven customer personas using advanced behavioral frameworks.

Business Type: {businessType}
Product/Service: {productDescription}
Industry: {industry}
Current Customer Data: {existingCustomerData}

Apply BJ Fogg Behavior Model to understand:
- What MOTIVATES each persona type (emotional drivers, core desires, fears)
- Their ABILITY constraints (time, money, effort, social comfort, routine disruption)
- Optimal PROMPT strategies (when they're ready to act, trigger preferences)

Use EAST Framework to identify:
- How to make decisions EASY for them
- What makes offers ATTRACTIVE (loss aversion, social proof preferences)
- SOCIAL elements they value (community, status, belonging)
- TIMELY moments when they're ready to engage

Format as JSON with comprehensive psychological profiles:

{
  "personas": [
    {
      "name": "Persona Name",
      "demographics": {...},
      "behaviorModel": {
        "motivation": {
          "primaryDriver": "Core emotional motivation",
          "pleasureTriggers": ["What they seek to gain"],
          "painTriggers": ["What they seek to avoid"],
          "socialNeeds": "Belonging, status, acceptance drivers"
        },
        "ability": {
          "timeConstraints": "How much time they have",
          "moneyConstraints": "Budget limitations",
          "effortThreshold": "Complexity tolerance",
          "socialComfort": "Risk tolerance for new things"
        },
        "promptOptimization": {
          "bestTiming": "When they're most receptive",
          "triggerTypes": "What motivates immediate action",
          "decisionSpeed": "Fast/slow decision maker"
        }
      },
      "eastFramework": {
        "easy": "What makes decisions effortless",
        "attractive": {
          "lossAversion": "What they fear losing",
          "socialProof": "Whose approval they need"
        },
        "social": "Groups they identify with",
        "timely": "When they make decisions"
      },
      "marketingPsychology": {
        "persuasionStyle": "Authority/Social/Logic preference",
        "trustBuilding": "What builds credibility",
        "purchasePsychology": "Decision style and price perception"
      }
    }
  ]
}`,
    expectedOutput: 'JSON with psychology-driven personas including BJ Fogg behavioral analysis and EAST framework application',
    requiredInputs: ['businessType', 'productDescription'],
    optionalInputs: ['industry', 'existingCustomerData']
  },

  // 3. Message Crafting Prompt (3-Tier Structure)
  {
    id: 'strategy-003',
    name: 'Message Crafting (3-Tier Framework)',
    category: 'messaging',
    description: 'Create three tiers of messaging: emotional hook, practical value, and credibility proof',
    systemPrompt: `You are an expert copywriter and messaging strategist specializing in conversion psychology and proven copywriting frameworks.

## COPYWRITING EXCELLENCE FRAMEWORK:

**Headline Formulas** (use for emotional hooks):
- Outcome-focused: "Get [desired outcome] without [pain point]"
- Specificity: Include numbers, timeframes, concrete details
- Social proof: "Join [number]+ [audience] who [achieved result]"
- Curiosity gap: "The [number] [topic] that [unexpected outcome]"
- Specific beats vague: "Cut reporting time 75%" beats "Save time"

**Voice/Tone Rules:**
- Write like a peer, not a vendor
- Use contractions (it's, you'll, we're)
- Lead with "You/your" not "I/we"
- Read aloud test - if it sounds like brochure, rewrite

**Content Structure Guidelines:**
- Lead with transformation, not features
- Use Problem-Agitation-Solution pattern
- Every word must earn its place
- End with single clear next step

**Psychology Integration:**
- Loss aversion: Frame as preventing loss, not just gaining
- Social proof: What similar people are doing
- Authority: Credible source backing
- Urgency: Time-sensitive authentic scarcity

Create enhanced 3-tier messaging framework using psychology and copywriting excellence:

1. Emotional Hook + Headlines - Using proven formulas above
2. Practical Value + Structure - Problem-Agitation-Solution with specificity
3. Credibility Proof + Psychology - Authority, social proof, risk reduction

Messages should be psychology-informed and conversion-optimized.`,
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

  // 4. Offer & Funnel Design (Growth-Engineered)
  {
    id: 'strategy-004',
    name: 'Offer & Funnel Design',
    category: 'funnel',
    description: 'Create growth-engineered funnels with email automation, viral mechanics, lead magnets, and ad creative angles',
    systemPrompt: `You are an expert funnel strategist specializing in growth-engineered customer journeys with built-in viral mechanics and professional automation frameworks.

## COMPREHENSIVE FUNNEL DESIGN FRAMEWORK:

**Email Sequence Mastery:**
- Hook-Bridge-Value-Close structure for all email communications
- Timing optimization: Day 1, 3, 7, 14, 21 pattern for nurture sequences
- Subject line psychology: 2-6 words, curiosity-driven, no spam triggers
- Deliverability focus: warmup patterns, engagement monitoring

**Lead Magnet Value-First Design:**
- Quick Win Principle: Instant value within 5 minutes of consumption
- Format matching: Checklists for awareness, templates for consideration, calculators for decision
- Implementation ease: Must be actionable without additional tools/purchases

**ORB Channel Framework Integration:**
- OWNED: Email list, website, customer database (highest control)
- RENTED: Social media platforms, third-party marketplaces (medium control)
- BORROWED: PR, influencers, partnerships (lowest control but highest reach)
- 70-20-10 budget allocation: 70% owned, 20% rented, 10% borrowed

**Growth & Viral Mechanics:**
- Built-in referral loops at each stage with psychological motivations
- Shared incentives: Both referrer and referee benefit
- Social sharing friction reduction: One-click sharing with pre-written copy
- Network effects: Community features that increase value with more users

**Ad Creative Angle Development:**
- Problem-focused angles: "Tired of X?"
- Outcome-focused angles: "Get Y without Z"
- Method-focused angles: "The Z way to achieve Y"
- Social proof angles: "Join N+ people who..."

Design for exponential growth, not just linear conversion.`,
    userPromptTemplate: `Design a growth-engineered funnel with professional automation, viral mechanics, and multi-channel acquisition.

Business Information:
{businessType}
{productOffer}
{averageOrderValue}
{customerLifetimeValue}
{currentMarketingCapabilities}

## DESIGN REQUIREMENTS:

**Email Sequence Integration:**
For each stage, design Hook-Bridge-Value-Close email sequences with:
- Day 1, 3, 7, 14, 21 timing optimization
- 2-6 word subject lines with curiosity psychology
- Deliverability-safe content and sender reputation management

**Lead Magnet Quick Win Design:**
Create instant-value lead magnets for each stage:
- 5-minute consumption time maximum
- Actionable without additional purchases
- Format matched to buyer stage (checklist/template/calculator)

**ORB Channel Strategy:**
Allocate touchpoints across:
- OWNED (70%): Email, website, customer database
- RENTED (20%): Social platforms, marketplaces
- BORROWED (10%): PR, influencers, partnerships

**Viral Growth Mechanics:**
Build referral loops with:
- Dual incentives (referrer + referee benefits)
- Friction-reduced sharing (one-click + pre-written copy)
- Network effects that increase value with scale

**Ad Creative Angles:**
Develop 3 testing angles per stage:
- Problem-focused, Outcome-focused, Method-focused, Social proof

Format as JSON with comprehensive funnel design including viral mechanics, email sequences, lead magnets, ORB channels, and ad creative angles for each stage.`,
    expectedOutput: 'JSON funnel with growth mechanics, email sequences, lead magnets, viral loops, ORB channels, and ad creative angles',
    requiredInputs: ['businessType', 'productOffer'],
    optionalInputs: ['averageOrderValue', 'customerLifetimeValue', 'currentMarketingCapabilities']
  },

  // 5. Content Strategy (Searchable vs. Shareable Framework)
  {
    id: 'strategy-005',
    name: '30-Day Content Strategy',
    category: 'content',
    description: 'Generate strategic content plan using searchable vs. shareable framework with platform optimization',
    systemPrompt: `You are an expert content strategist specializing in platform-optimized content with searchable vs. shareable framework and social media mastery.

## ADVANCED CONTENT STRATEGY FRAMEWORK:

**Content Classification (Searchable vs. Shareable):**
- SEARCHABLE: SEO-optimized, keyword-driven, long-term traffic builders
- SHAREABLE: Emotional, viral-potential, immediate engagement drivers
- 60% searchable / 40% shareable optimal mix for sustainable growth

**Content Pillar Framework (4:1 Value Ratio):**
- EDUCATIONAL (40%): How-to, tutorials, insights, frameworks
- INSPIRATIONAL (30%): Stories, transformations, behind-scenes
- ENTERTAINING (20%): Humor, trends, relatable content
- PROMOTIONAL (10%): Product features, testimonials, sales content

**Social Media Platform Mastery:**
- Platform-specific optimization for algorithms and user behavior
- Hook formulas adapted per platform (TikTok vs. LinkedIn vs. Instagram)
- Content format optimization (video/image/text ratios per platform)
- Community engagement strategies tailored to platform culture

**Keyword Research Integration:**
- Awareness stage: Problem/symptom keywords
- Consideration stage: Solution comparison keywords
- Decision stage: Brand/product-specific keywords
- Map content to buyer journey stage with appropriate keyword focus

**Content Topic Selection Framework:**
- Trend intersection: Your expertise + trending topics + audience interest
- Evergreen foundation: 70% timeless content, 30% trend-responsive
- Question-mining: Customer questions, forums, social comments
- Competitor gap analysis: Topics they're not covering well

Create content strategies that build both immediate engagement and long-term organic growth.`,
    userPromptTemplate: `Create a strategic 30-day content plan using searchable vs. shareable framework and platform optimization.

Brand Context:
{positioningStatement}
{personas}
{brandTone}
{contentGoals}

## CONTENT STRATEGY REQUIREMENTS:

**Searchable vs. Shareable Balance:**
- 60% SEARCHABLE content: SEO-optimized, keyword-targeted, long-term value
- 40% SHAREABLE content: Emotional hooks, viral potential, immediate engagement

**Content Pillar Distribution:**
- Educational (40%): How-to guides, tutorials, frameworks, insights
- Inspirational (30%): Success stories, transformations, behind-the-scenes
- Entertaining (20%): Humor, trends, relatable moments
- Promotional (10%): Product features, testimonials, offers

**Platform Optimization:**
For each platform, optimize for:
- Algorithm preferences (video priority, engagement signals)
- Content format best practices
- Optimal posting times and frequency
- Platform-specific hook formulas

**Keyword Integration:**
Map content to buyer journey:
- Awareness: Problem/symptom-focused keywords
- Consideration: Solution comparison keywords
- Decision: Brand-specific keywords

## OUTPUT FORMAT:

Generate comprehensive 30-day content strategy:

{
  "contentStrategy": {
    "overallTheme": "Monthly content narrative",
    "searchableShareableRatio": "60% searchable, 40% shareable",
    "contentPillarMix": "Educational 40%, Inspirational 30%, Entertaining 20%, Promotional 10%"
  },
  "weeklyThemes": [
    {
      "week": 1,
      "theme": "Week 1 focus topic",
      "objectives": "What this week achieves",
      "keywordFocus": "Primary keywords to target",
      "contentTypes": "Mix of searchable/shareable content"
    }
  ],
  "dailyContent": [
    {
      "day": 1,
      "contentType": "Searchable/Shareable",
      "pillar": "Educational/Inspirational/Entertaining/Promotional",
      "format": "Blog post/Video/Social post/Story",
      "topic": "Specific content topic",
      "hook": "Platform-specific hook/headline",
      "keywordTarget": "Primary keyword (for searchable content)",
      "platforms": [
        {
          "platform": "Instagram/TikTok/LinkedIn/Twitter",
          "adaptation": "Platform-specific version",
          "optimalTime": "Best posting time",
          "hashtags": "Platform-appropriate hashtags"
        }
      ],
      "cta": "Call-to-action for this content",
      "contentGoal": "Awareness/Consideration/Decision stage"
    }
  ],
  "platformStrategy": {
    "instagram": {
      "focus": "Visual storytelling and behind-scenes",
      "postFrequency": "1-2 posts daily",
      "contentMix": "70% stories, 20% posts, 10% reels",
      "hookFormulas": "Visual-first attention grabbers"
    },
    "linkedin": {
      "focus": "Professional insights and thought leadership",
      "postFrequency": "5-7 posts weekly",
      "contentMix": "50% educational, 30% inspirational, 20% promotional",
      "hookFormulas": "Professional curiosity and value-driven"
    }
  },
  "contentCalendar": {
    "week1": "Focus on [theme] with [content types]",
    "week2": "Focus on [theme] with [content types]",
    "week3": "Focus on [theme] with [content types]",
    "week4": "Focus on [theme] with [content types]"
  },
  "performanceMetrics": {
    "searchableContent": "Organic traffic growth, keyword rankings",
    "shareableContent": "Engagement rate, shares, viral potential",
    "overallSuccess": "Brand awareness and conversion metrics"
  }
}

Focus on creating content that builds both immediate engagement and long-term organic discovery.`,
    expectedOutput: 'JSON with 30-day content strategy using searchable/shareable framework, platform optimization, and content pillar distribution',
    requiredInputs: ['positioningStatement', 'personas', 'brandTone', 'contentGoals']
  },

  // 6. Campaign Generator (Copywriting Excellence + Viral Growth)
  {
    id: 'strategy-006',
    name: 'Full Campaign Generator',
    category: 'campaign',
    description: 'Build conversion-optimized campaigns with copywriting excellence, viral mechanics, and multi-angle creative testing',
    systemPrompt: `You are an expert campaign strategist specializing in conversion-optimized copywriting with viral growth mechanics and systematic creative testing.

## COMPREHENSIVE CAMPAIGN FRAMEWORK:

**Copywriting Excellence (Headlines & Copy):**
- Headline formulas: Outcome-focused, specificity-driven, social proof-backed
- Problem-Agitation-Solution structure for landing pages
- Voice rules: Peer-to-peer tone, contractions, "you/your" focus
- Specificity beats vague: "Cut reporting time 75%" beats "Save time"
- Psychology integration: Loss aversion, social proof, authority, urgency

**Ad Creative Angle System:**
- Problem-focused: "Tired of [specific pain point]?"
- Outcome-focused: "Get [specific result] without [common barrier]"
- Method-focused: "The [unique approach] that [delivers outcome]"
- Social proof: "Join [specific number]+ [audience] who [achieved result]"
- Iteration protocol: Test 3 angles weekly, scale winners

**Viral Growth Integration:**
- Built-in sharing incentives and social proof elements
- Referral loops with dual benefits (referrer + referee)
- Network effects that increase campaign value with scale
- Community features that amplify reach organically

**CTA Psychology & Optimization:**
- Urgency without false scarcity
- Action clarity and friction reduction
- Multiple CTA variations for testing
- Psychology-driven button copy and placement

Create campaigns designed for both immediate conversion and viral amplification.`,
    userPromptTemplate: `Build a conversion-optimized campaign with copywriting excellence, viral mechanics, and systematic creative testing.

Campaign Context:
{campaignGoals}
{targetAudience}
{budget}
{timeline}
{keyMessage}

## CAMPAIGN REQUIREMENTS:

**Copywriting Excellence:**
Apply proven headline formulas:
- Outcome-focused: "Get [specific result] without [common barrier]"
- Specificity-driven: Include numbers, timeframes, concrete details
- Social proof-backed: "Join [specific number]+ [audience] who [achieved result]"

Use Problem-Agitation-Solution structure for landing page flow
Write with peer-to-peer voice (contractions, "you/your" focus)
Integrate psychology: Loss aversion, social proof, authority, urgency

**Multi-Angle Creative Testing:**
Develop 4 core creative angles:
- Problem-focused: "Tired of [specific pain point]?"
- Outcome-focused: "Get [specific result] without [common barrier]"
- Method-focused: "The [unique approach] that [delivers outcome]"
- Social proof: "Join [specific number]+ [audience] who [achieved result]"

**Viral Growth Integration:**
Build in sharing incentives and referral mechanics
Design network effects that increase campaign value with scale
Include community features for organic amplification

**CTA Psychology:**
Create urgency without false scarcity
Ensure action clarity and friction reduction
Design multiple CTA variations for testing

## OUTPUT FORMAT:

{
  "campaignCore": {
    "mainHeadline": "Primary outcome-focused headline",
    "tagline": "Memorable brand positioning line",
    "coreMessage": "Central value proposition"
  },
  "creativeAngles": [
    {
      "angle": "Problem-focused",
      "headline": "Specific pain-point focused headline",
      "subheadline": "Supporting detail",
      "adCopy": "Short-form copy for this angle",
      "landingPageCopy": "Extended copy version",
      "targetAudience": "Who this angle targets"
    },
    {
      "angle": "Outcome-focused",
      "headline": "Specific result-focused headline",
      "subheadline": "Supporting detail",
      "adCopy": "Short-form copy for this angle",
      "landingPageCopy": "Extended copy version",
      "targetAudience": "Who this angle targets"
    },
    {
      "angle": "Method-focused",
      "headline": "Unique approach headline",
      "subheadline": "Supporting detail",
      "adCopy": "Short-form copy for this angle",
      "landingPageCopy": "Extended copy version",
      "targetAudience": "Who this angle targets"
    },
    {
      "angle": "Social proof",
      "headline": "Community/number-driven headline",
      "subheadline": "Supporting detail",
      "adCopy": "Short-form copy for this angle",
      "landingPageCopy": "Extended copy version",
      "targetAudience": "Who this angle targets"
    }
  ],
  "landingPageStructure": {
    "heroSection": {
      "headline": "Outcome-focused main headline",
      "subheadline": "Specific benefit elaboration",
      "cta": "Primary call-to-action"
    },
    "problemAgitationSolution": {
      "problem": "Specific pain point identification",
      "agitation": "Why this problem matters now",
      "solution": "How we solve it uniquely"
    },
    "socialProofSection": {
      "testimonials": "Customer success stories",
      "numbers": "Specific metrics and results",
      "logos": "Trust signals and certifications"
    },
    "conversionElements": {
      "primaryCta": "Main action button",
      "secondaryCta": "Alternative action option",
      "urgency": "Time-sensitive element",
      "riskReduction": "Guarantee or trial offer"
    }
  },
  "viralComponents": {
    "shareIncentive": "Why people would share this",
    "referralMechanic": "How sharing benefits both parties",
    "socialProofAmplifier": "Community features that increase virality",
    "networkEffect": "How value increases with more participants"
  },
  "ctaVariations": [
    {
      "type": "Primary",
      "copy": "Action-oriented button text",
      "psychology": "Urgency/benefit/social proof focus",
      "placement": "Where on page/ad"
    },
    {
      "type": "Secondary",
      "copy": "Alternative action text",
      "psychology": "Lower commitment option",
      "placement": "Where on page/ad"
    }
  ],
  "channelAdaptations": {
    "facebook": "Facebook-optimized version",
    "google": "Google Ads version",
    "email": "Email marketing version",
    "social": "Organic social version"
  },
  "testingStrategy": {
    "week1": "Test all 4 angles with small budget",
    "week2": "Scale best 2 performers",
    "week3": "Iterate winners with new variations",
    "week4": "Focus budget on proven winner"
  }
}

Create campaigns designed for both immediate conversion and viral growth amplification.`,
    expectedOutput: 'JSON with complete campaign assets including headlines, copy, CTAs, landing page structure, and viral variants',
    requiredInputs: ['campaignGoals', 'targetAudience', 'keyMessage'],
    optionalInputs: ['budget', 'timeline']
  },

  // 7. SEO & Keyword Framework (Buyer Journey Mapping)
  {
    id: 'strategy-007',
    name: 'SEO & Keyword Framework',
    category: 'seo',
    description: 'Map keywords to buyer stages with searchable vs. shareable content strategy and topic clustering',
    systemPrompt: `You are an expert SEO strategist specializing in buyer journey keyword mapping with advanced content strategy integration.

## ADVANCED SEO & CONTENT FRAMEWORK:

**Buyer Journey Keyword Mapping:**
- AWARENESS: Problem/symptom keywords (high volume, low intent)
- CONSIDERATION: Solution comparison keywords (medium volume, medium intent)
- DECISION: Brand/product keywords (low volume, high intent)
- Map 70% awareness, 20% consideration, 10% decision for sustainable growth

**Searchable vs. Shareable Integration:**
- SEARCHABLE content: Keyword-optimized, long-term traffic builders
- SHAREABLE content: Emotional hooks for backlink attraction
- Use keyword data to inform shareable content topics
- Balance SEO optimization with viral potential

**Content Topic Selection:**
- Question-mining: Customer questions, forums, social comments
- Trend intersection: SEO data + trending topics + expertise
- Competitor gap analysis: Keywords they rank poorly for
- Semantic clustering: Related keyword groups for topic authority

**Content Format Optimization:**
- Awareness: Blog posts, guides, educational videos
- Consideration: Comparison articles, case studies, demos
- Decision: Product pages, testimonials, pricing content
- Mixed-intent: Tools, calculators, interactive content

Create SEO strategies that build both organic traffic and content authority.`,
    userPromptTemplate: `Create comprehensive SEO strategy using buyer journey mapping with searchable vs. shareable content integration.

Brand Context:
{brandName}
{productDescription}
{targetAudience}
{currentKeywords}
{competitors}

## SEO STRATEGY REQUIREMENTS:

**Buyer Journey Keyword Distribution:**
- AWARENESS (70%): Problem/symptom keywords - high volume, informational intent
- CONSIDERATION (20%): Solution comparison keywords - medium volume, commercial intent
- DECISION (10%): Brand/product keywords - low volume, transactional intent

**Searchable vs. Shareable Integration:**
For each keyword group, identify:
- SEARCHABLE opportunities: Long-term traffic builders with SEO optimization
- SHAREABLE potential: Emotional angles that attract backlinks and social shares

**Content Topic Selection Framework:**
- Question-mining: Analyze customer questions, forums, social comments
- Trend intersection: SEO data + trending topics + brand expertise
- Competitor gap analysis: Keywords they rank poorly for or ignore
- Semantic clustering: Group related keywords for topic authority

## OUTPUT FORMAT:

{
  "keywordStrategy": {
    "overallFocus": "Primary SEO strategy direction",
    "buyerJourneyDistribution": "70% awareness, 20% consideration, 10% decision",
    "contentBalance": "Searchable vs. shareable content mix"
  },
  "awarenessStage": {
    "keywordFocus": "Problem/symptom keywords",
    "targetVolume": "High volume, low competition opportunities",
    "keywords": [
      {
        "keyword": "Primary keyword phrase",
        "searchVolume": "Monthly search volume estimate",
        "difficulty": "Keyword difficulty (1-100)",
        "intent": "Informational/problem-focused",
        "contentType": "Searchable/Shareable potential"
      }
    ],
    "contentRecommendations": [
      {
        "title": "SEO-optimized blog post title",
        "format": "Blog post/Video/Guide/Tool",
        "contentType": "Searchable - keyword optimized",
        "shareablePotential": "Emotional hook for social sharing",
        "targetKeywords": ["Primary", "secondary", "LSI keywords"]
      }
    ]
  },
  "considerationStage": {
    "keywordFocus": "Comparison and solution keywords",
    "targetVolume": "Medium volume, commercial intent",
    "keywords": [...],
    "contentRecommendations": [
      {
        "title": "Comparison-focused content title",
        "format": "Comparison article/Case study/Demo",
        "contentType": "Searchable - commercial intent optimized",
        "shareablePotential": "Industry insights worth sharing"
      }
    ]
  },
  "decisionStage": {
    "keywordFocus": "Brand and product keywords",
    "targetVolume": "Lower volume, high conversion intent",
    "keywords": [...],
    "contentRecommendations": [
      {
        "title": "Product/brand-focused content",
        "format": "Product page/Testimonials/Pricing",
        "contentType": "Searchable - conversion optimized",
        "shareablePotential": "Customer success stories"
      }
    ]
  },
  "topicClusters": [
    {
      "clusterTopic": "Main topic theme",
      "pillarContent": "Primary comprehensive guide",
      "supportingContent": ["Related subtopic 1", "Related subtopic 2"],
      "keywordGroups": ["Related keyword families"],
      "searchableContent": "SEO-optimized pieces",
      "shareableContent": "Viral potential pieces"
    }
  ],
  "competitorGaps": [
    {
      "keyword": "Keyword they rank poorly for",
      "opportunity": "Why this is an opportunity",
      "contentAngle": "How to approach this better",
      "difficulty": "Realistic assessment of effort needed"
    }
  ],
  "contentCalendar": {
    "month1": "Awareness-focused content (70% of effort)",
    "month2": "Consideration content with comparison focus",
    "month3": "Decision stage optimization and authority building",
    "ongoing": "Topic cluster expansion and authority development"
  },
  "performanceMetrics": {
    "awarenessMetrics": "Organic traffic, impressions, brand searches",
    "considerationMetrics": "Click-through rates, time on page, demo requests",
    "decisionMetrics": "Conversion rate, qualified leads, sales attribution"
  }
}

Focus on creating SEO strategies that balance long-term organic growth with immediate engagement and sharing potential.`,
    expectedOutput: 'JSON with keywords organized by buyer stage, search intent, and content title suggestions',
    requiredInputs: ['brandName', 'productDescription', 'targetAudience'],
    optionalInputs: ['currentKeywords', 'competitors']
  },

  // 8. Competitor Gap Analyzer (Honesty-First Analysis)
  {
    id: 'strategy-008',
    name: 'Competitor Gap Analyzer',
    category: 'competitive',
    description: 'Honesty-first competitor analysis with messaging intelligence and ownable differentiation discovery',
    systemPrompt: `You are an expert competitive strategist specializing in honesty-first competitor analysis and ownable differentiation discovery.

## ADVANCED COMPETITOR INTELLIGENCE FRAMEWORK:

**Honesty-First Analysis Methodology:**
- Acknowledge competitor strengths openly and objectively
- Identify genuine competitive advantages (not manufactured differences)
- Analyze sustainable vs. temporary competitive moats
- Assess realistic opportunities based on resources and market position
- Avoid wishful thinking or underestimating competition

**Content & Messaging Intelligence:**
- Hook formula analysis: Problem/Outcome/Method/Social proof angle usage
- Content pillar breakdown: Educational/Inspirational/Entertaining/Promotional ratios
- Platform-specific messaging adaptation and performance
- Voice and tone differentiation opportunities
- Untapped messaging territories and positioning white space

**Market Positioning Intelligence:**
- Customer segment prioritization and focus areas
- Price positioning and value justification strategies
- Distribution channel strength and expansion opportunities
- Brand personality and emotional positioning gaps
- Innovation pipeline and future market direction

Your analysis must be brutally honest about competitor strengths while identifying specific, actionable opportunities.`,
    userPromptTemplate: `Conduct comprehensive competitive intelligence using honesty-first methodology with advanced messaging and positioning analysis.

Brand Context:
{ourBrand}
{ourOffering}
{ourStrengths}

Competitors to Analyze:
1. {competitor1}
2. {competitor2}
3. {competitor3}

## ANALYSIS REQUIREMENTS:

**Honesty-First Assessment:**
Acknowledge competitor strengths objectively. Identify genuine (not manufactured) opportunities. Focus on sustainable competitive advantages.

**Messaging & Content Intelligence:**
- Hook formula analysis: Problem/Outcome/Method/Social proof angle usage
- Content pillar ratios: Educational/Inspirational/Entertaining/Promotional
- Platform-specific messaging and optimization strategies
- Voice and tone differentiation opportunities

**Market Positioning Analysis:**
- Customer segment focus and priorities
- Price positioning and value justification
- Distribution channel strengths and gaps
- Brand personality and emotional positioning
- Innovation direction and future planning

## OUTPUT FORMAT:

{
  "honestyFirstAssessment": {
    "competitorStrengths": [
      {
        "competitor": "Competitor name",
        "genuineStrengths": ["What they truly do well"],
        "competitiveAdvantages": ["Sustainable advantages they hold"],
        "marketPosition": "Their defendable position"
      }
    ],
    "realOpportunities": ["Genuine gaps we can exploit"],
    "competitiveRealities": ["Hard truths about our position"]
  },
  "messagingIntelligence": {
    "hookFormulas": {
      "competitorUsage": "How they use different hook types",
      "missedAngles": ["Hook formulas they're not using"],
      "ownershipOpportunity": "Which angle we can dominate"
    },
    "contentStrategy": {
      "competitorPillars": "Their content mix and approach",
      "contentGaps": ["Types/topics they're missing"],
      "qualityOpportunity": "Where we can outperform"
    },
    "voicePositioning": {
      "theirTone": "How competitors communicate",
      "differentiationOpportunity": "Tone/voice space we can claim"
    }
  },
  "marketPositioning": {
    "customerSegments": {
      "theirFocus": "Primary segments they target",
      "underservedSegments": ["Segments they ignore"],
      "segmentOpportunity": "Customer group we can own"
    },
    "pricePositioning": {
      "theirStrategy": "How they position on value/price",
      "pricingGaps": "Value justification weaknesses",
      "pricingOpportunity": "Our optimal price position"
    },
    "channelStrategy": {
      "strongChannels": ["Where they dominate"],
      "weakChannels": ["Where they underperform"],
      "untappedChannels": ["Channels they're missing"]
    }
  },
  "ownableDifferentiator": {
    "title": "The defensible position we can own",
    "description": "Detailed explanation of opportunity",
    "whyDefensible": "Why this can't be easily copied",
    "competitorWeakness": "Specific vulnerability this exploits",
    "activationStrategy": [
      "Phase 1: Foundation building",
      "Phase 2: Momentum creation",
      "Phase 3: Market dominance"
    ],
    "messagingFramework": {
      "coreMessage": "Primary positioning statement",
      "hookFormula": "Best angle for this differentiator",
      "competitorComparison": "How we'll honestly compare"
    },
    "resourceRequirements": ["Capabilities needed"],
    "timeline": "Realistic dominance timeframe"
  },
  "tacticalRecommendations": {
    "immediateActions": ["Week 1-4 moves"],
    "messagingRollout": "New positioning launch strategy",
    "contentStrategy": "Content to support differentiation",
    "competitorResponse": "How they might react"
  },
  "realityChecks": {
    "competitorAdvantages": ["Advantages we must acknowledge"],
    "resourceConstraints": ["Our limitations"],
    "marketRealities": ["Industry dynamics we can't ignore"],
    "avoidanceTraps": ["Competitive mistakes to avoid"]
  }
}

Focus on identifying genuine, defensible opportunities while honestly assessing competitive realities.`,
    expectedOutput: 'JSON with competitive gaps, missed opportunities, and ownable differentiator recommendations',
    requiredInputs: ['ourBrand', 'ourOffering', 'competitor1', 'competitor2', 'competitor3'],
    optionalInputs: ['ourStrengths']
  },

  // 9. Performance Tracker Framework (Psychology + Growth Metrics)
  {
    id: 'strategy-009',
    name: 'Performance Tracker Framework',
    category: 'performance',
    description: 'Psychology-driven performance tracking with growth engineering and creative intelligence metrics',
    systemPrompt: `You are an expert marketing analyst specializing in psychology-driven performance tracking with growth engineering focus.

## ADVANCED PERFORMANCE TRACKING FRAMEWORK:

**Psychology-Based Metrics (BJ Fogg Model):**
- MOTIVATION tracking: Emotional engagement, urgency response, desire intensity
- ABILITY metrics: Friction points, completion rates, effort barriers
- PROMPT effectiveness: Trigger response rates, timing optimization
- Behavioral change indicators: Adoption rates, habit formation

**Growth Engineering Metrics:**
- Viral coefficient (K-factor): Users acquired per existing user
- Viral cycle time: Time from share to conversion
- Network effects: Value increase with user base growth
- Compound growth rate: Month-over-month acceleration
- Retention cohort analysis: Long-term value creation

**Creative Performance Intelligence:**
- Creative angle effectiveness: Problem/Outcome/Method/Social proof performance
- Iteration velocity: Testing frequency and learning speed
- Creative fatigue indicators: Performance degradation patterns
- Audience-angle fit: Which angles resonate with segments

Your frameworks must track both rational metrics AND emotional engagement while being actionable for non-marketers.`,
    userPromptTemplate: `Create comprehensive performance tracking combining traditional KPIs with psychology-driven metrics and growth engineering analytics.

Campaign Context:
{campaignName}
{campaignGoals}
{channels}
{budget}
{businessStage}

## TRACKING REQUIREMENTS:

**Psychology Metrics (BJ Fogg Model):**
- Track MOTIVATION: Emotional engagement, urgency response, desire intensity
- Monitor ABILITY: Friction points, completion rates, effort barriers
- Measure PROMPT effectiveness: Trigger response, timing optimization
- Analyze behavioral change: Adoption, habit formation, retention

**Growth Engineering Analytics:**
- Viral coefficient: K-factor calculation and tracking
- Viral cycle time: Share-to-conversion timeline
- Network effects: Value scaling with user base
- Compound growth: Month-over-month acceleration
- Cohort retention: Long-term value analysis

**Creative Performance Intelligence:**
- Angle effectiveness: Problem/Outcome/Method/Social proof performance
- Iteration velocity: Testing frequency and learning rate
- Creative fatigue: Performance degradation patterns
- Audience-angle fit: Segmented response analysis

## OUTPUT FORMAT:

{
  "performanceFramework": {
    "overallStrategy": "Integrated tracking approach",
    "psychologyFocus": "BJ Fogg behavioral model integration",
    "growthFocus": "Viral and network effects measurement",
    "creativeFocus": "Angle testing and optimization"
  },
  "primaryKPIs": [
    {
      "metric": "KPI name",
      "category": "Traditional/Psychology/Growth/Creative",
      "whatToTrack": "Specific measurement",
      "whyItMatters": "Business and psychological impact",
      "successBenchmark": "Target value or range",
      "psychologyConnection": "BJ Fogg model element"
    }
  ],
  "behaviorMetrics": {
    "motivation": [
      {
        "metric": "Emotional engagement score",
        "measurement": "How to calculate",
        "target": "Success threshold",
        "insight": "What this reveals about audience"
      }
    ],
    "ability": [
      {
        "metric": "Friction coefficient",
        "measurement": "Calculation method",
        "target": "Optimal range",
        "insight": "Ease of action indicator"
      }
    ],
    "prompt": [
      {
        "metric": "Trigger response rate",
        "measurement": "Response calculation",
        "target": "Performance target",
        "insight": "CTA effectiveness indicator"
      }
    ]
  },
  "growthEngineering": {
    "viralMetrics": {
      "kFactor": {
        "calculation": "New users / existing users / time",
        "target": "> 1.0 for viral growth",
        "measurement": "Tracking method"
      },
      "viralCycleTime": {
        "calculation": "Share to activation time",
        "target": "< 24 hours optimal",
        "measurement": "Event tracking approach"
      }
    },
    "networkEffects": {
      "valueScaling": "Value per user vs network size",
      "communityGrowth": "User-generated content rate",
      "referralQuality": "Quality of referred users"
    }
  },
  "creativeIntelligence": {
    "anglePerformance": {
      "problemFocused": "Pain-point messaging performance",
      "outcomeFocused": "Benefit messaging performance",
      "methodFocused": "Process messaging performance",
      "socialProof": "Testimonial messaging performance"
    },
    "iterationMetrics": {
      "testingVelocity": "Creative tests per week",
      "learningRate": "Insights per test",
      "scaleEfficiency": "Time from test to scale"
    },
    "fatigueMonitoring": {
      "performanceDegradation": "Week 4 vs Week 1 performance",
      "refreshTriggers": "When to launch new creatives",
      "audienceSegmentation": "Which creatives work for which segments"
    }
  },
  "automatedInsights": {
    "psychologyAlerts": [
      {
        "trigger": "Motivation drop below threshold",
        "action": "Test new emotional triggers",
        "priority": "High/Medium/Low"
      }
    ],
    "growthAlerts": [
      {
        "trigger": "K-factor below 0.8",
        "action": "Optimize sharing incentives",
        "priority": "Critical"
      }
    ],
    "creativeAlerts": [
      {
        "trigger": "Creative fatigue detected",
        "action": "Launch new angle test",
        "priority": "Medium"
      }
    ]
  },
  "intelligentDashboard": {
    "executiveSummary": "One-page psychology + growth overview",
    "psychologyOverview": "Motivation, ability, prompt trends",
    "growthOverview": "Viral coefficient and network effects",
    "creativeOverview": "Angle performance and fatigue status"
  },
  "nonMarketerFriendly": {
    "dailyCheckIn": "Psychology score (single number 1-10)",
    "weeklyReview": "Growth velocity and creative performance",
    "monthlyDeepDive": "Full behavioral and growth analysis",
    "plainEnglishExplanations": {
      "psychologyScore": "How engaged and motivated audience is",
      "kFactor": "How many new customers each customer brings",
      "creativeAngle": "Which message type works best"
    }
  }
}

Create frameworks that track both psychological engagement and growth mechanics in language non-marketers can understand.`,
    expectedOutput: 'JSON with KPI framework, benchmarks, automation suggestions, and dashboard structure',
    requiredInputs: ['campaignName', 'campaignGoals', 'channels'],
    optionalInputs: ['budget', 'businessStage']
  },

  // 10. Marketing Review & Pivot (Growth Optimization)
  {
    id: 'strategy-010',
    name: 'Marketing Review & Pivot',
    category: 'review',
    description: 'Data-driven performance analysis with psychology insights, growth optimization, and systematic pivot recommendations',
    systemPrompt: `You are an expert marketing strategist specializing in data-driven performance analysis with psychology insights and growth optimization focus.

## ADVANCED PERFORMANCE ANALYSIS FRAMEWORK:

**Root Cause Analysis Methodology:**
- Distinguish symptoms from underlying causes
- Apply BJ Fogg behavior model to identify psychological barriers
- Analyze growth mechanics: viral loops, network effects, retention curves
- Examine creative fatigue and audience-angle fit patterns

**Growth Optimization Focus:**
- Viral coefficient analysis: What's driving/inhibiting viral growth
- Network effects assessment: How community features perform
- Retention cohort analysis: Long-term value creation patterns
- Compound growth evaluation: Month-over-month acceleration trends

**Psychology-Driven Insights:**
- Motivation analysis: What's driving/blocking emotional engagement
- Ability assessment: Where friction is preventing action
- Prompt optimization: Which triggers are/aren't working
- Behavioral change tracking: Adoption and habit formation patterns

**Strategic Pivot Framework:**
- Quick wins: Tactical changes with immediate impact
- Growth experiments: Systematic tests for breakthrough improvement
- Strategic shifts: Fundamental approach changes for long-term success
- Resource reallocation: Budget/time optimization based on performance data

Your analysis must be brutally honest while providing specific, actionable optimization pathways.`,
    userPromptTemplate: `Conduct comprehensive performance analysis using psychology insights, growth mechanics, and systematic optimization frameworks.

Performance Context:
{performanceMetrics}
{originalGoals}
{timeframe}
{budget}
{currentResults}

## ANALYSIS REQUIREMENTS:

**Root Cause Analysis:**
Apply BJ Fogg behavior model to identify psychological barriers:
- MOTIVATION gaps: Where emotional engagement is failing
- ABILITY barriers: What friction is preventing action
- PROMPT issues: Which triggers aren't working

Examine growth mechanics:
- Viral coefficient performance: K-factor trends and bottlenecks
- Network effects: How community features are performing
- Retention patterns: Cohort analysis and churn indicators

**Performance Psychology Assessment:**
- Creative fatigue: Which angles are degrading in performance
- Audience-angle fit: What's working for which segments
- Behavioral change tracking: Adoption and habit formation success

## OUTPUT FORMAT:

{
  "performanceOverview": {
    "currentStatus": "High-level performance summary",
    "vsOriginalGoals": "Progress against initial objectives",
    "psychologyInsights": "Key behavioral patterns observed",
    "growthMetrics": "Viral coefficient and network effects status"
  },
  "rootCauseAnalysis": {
    "whatIsWorking": [
      {
        "element": "Successful campaign element",
        "performanceData": "Specific metrics and results",
        "psychologyWhy": "Psychological reason it's working",
        "growthImpact": "How it's driving viral/network effects",
        "amplificationPlan": "How to double down on this success"
      }
    ],
    "whatIsNotWorking": [
      {
        "element": "Underperforming element",
        "performanceData": "Specific metrics showing poor results",
        "rootCause": "Underlying psychological or mechanical issue",
        "motivationGap": "Emotional engagement problem",
        "abilityBarrier": "Friction or complexity issue",
        "promptProblem": "Trigger or timing issue",
        "impactAssessment": "Cost of not fixing this issue"
      }
    ]
  },
  "growthDiagnostics": {
    "viralPerformance": {
      "currentKFactor": "Viral coefficient performance",
      "viralBottlenecks": "What's preventing viral growth",
      "sharingFriction": "Barriers to social sharing",
      "referralQuality": "Quality of referred users"
    },
    "networkEffects": {
      "communityEngagement": "User interaction with each other",
      "ugcGeneration": "User-generated content creation",
      "valueScaling": "How value increases with network size"
    },
    "retentionAnalysis": {
      "cohortTrends": "User retention patterns over time",
      "churnIndicators": "Early warning signs of user departure",
      "habitFormation": "Are users developing lasting habits"
    }
  },
  "creativeFatigueAnalysis": {
    "anglePerformance": {
      "problemFocused": "Pain-point messaging degradation",
      "outcomeFocused": "Benefit messaging performance decline",
      "methodFocused": "Process messaging fatigue",
      "socialProof": "Testimonial message effectiveness"
    },
    "audienceSegmentation": "Which creatives work for which segments",
    "refreshNeeds": "Which creative angles need immediate refresh"
  },
  "strategicRecommendations": {
    "quickWins": [
      {
        "action": "Specific tactical change",
        "timeframe": "Can implement this week",
        "expectedImpact": "Quantified improvement estimate",
        "psychologyFocus": "Which BJ Fogg element this addresses",
        "implementationSteps": ["Step 1", "Step 2", "Step 3"]
      }
    ],
    "growthExperiments": [
      {
        "hypothesis": "What we believe will improve growth",
        "testDesign": "How to test this systematically",
        "timeframe": "2-4 week experiment window",
        "successMetrics": "How we'll measure success",
        "riskAssessment": "Potential downside of this test"
      }
    ],
    "strategicShifts": [
      {
        "shift": "Fundamental approach change",
        "timeframe": "3-6 month implementation",
        "rationale": "Why this major change is needed",
        "psychologyAlignment": "How this aligns with audience psychology",
        "growthPotential": "Expected viral/network effect impact",
        "resourceRequirements": ["People", "Budget", "Technology"]
      }
    ]
  },
  "resourceOptimization": {
    "budgetReallocation": {
      "stopSpending": "Where to cut budget immediately",
      "increaseSpending": "Where to invest more resources",
      "testBudget": "Resources for growth experiments",
      "expectedROI": "Return on reallocation decisions"
    },
    "timeReallocation": {
      "stopDoing": "Activities to eliminate",
      "focusMore": "High-impact activities to expand",
      "newPriorities": "Emerging priorities based on data",
      "teamAlignment": "How team time should shift"
    }
  },
  "implementationPlan": {
    "week1": "Immediate quick wins to implement",
    "weeks2-4": "Growth experiments to launch",
    "month2-3": "Strategic shift preparation and testing",
    "month4-6": "Full strategic shift implementation",
    "ongoingMonitoring": "Key metrics to watch for course correction"
  },
  "riskAssessment": {
    "implementationRisks": "What could go wrong with these changes",
    "competitorResponse": "How competitors might react",
    "userReaction": "How audience might respond to changes",
    "mitigation": "How to minimize identified risks"
  }
}

Provide brutally honest assessment while giving specific, psychology-informed optimization pathways for sustainable growth.`,
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
