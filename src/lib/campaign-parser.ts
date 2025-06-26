import type { Database } from '@/integrations/supabase/types';

type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];

export interface ParsedCampaign {
  name?: string;
  type?: 'email' | 'social_media' | 'other' | 'seo' | 'content' | 'paid_ads';
  channel?: string;
  description?: string;
  target_audience?: string;
  primary_objective?: string;
  budget_allocated?: number;
  total_budget?: number;
  start_date?: string;
  end_date?: string;
  demographics?: Record<string, any>;
  channels?: string[];
  kpi_targets?: Record<string, any>;
  budget_breakdown?: Record<string, any>;
  content?: Record<string, any>;
  settings?: Record<string, any>;
}

export function parseCampaignFromConversation(conversationText: string): ParsedCampaign {
  const text = conversationText.toLowerCase();
  const result: ParsedCampaign = {};

  // Extract campaign name
  const namePatterns = [
    /campaign name[:\s]+([^.\n]+)/i,
    /call it[:\s]+([^.\n]+)/i,
    /name[:\s]+([^.\n]+)/i,
    /"([^"]+)"\s*campaign/i,
    /for\s+([^.\n]+)\s+campaign/i
  ];
  
  for (const pattern of namePatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      result.name = match[1].trim().replace(/['"]/g, '');
      break;
    }
  }

  // Extract campaign type
  result.type = detectCampaignType(text);

  // Extract channel
  const channelPatterns = [
    /channel[:\s]+([^.\n]+)/i,
    /platform[:\s]+([^.\n]+)/i,
    /on\s+(instagram|facebook|twitter|linkedin|email|google|youtube)/i
  ];
  
  for (const pattern of channelPatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      result.channel = match[1].trim();
      break;
    }
  }

  // Set default channel based on type if not found
  if (!result.channel) {
    switch (result.type) {
      case 'email':
        result.channel = 'email';
        break;
      case 'social_media':
        result.channel = 'social media';
        break;
      case 'seo':
        result.channel = 'organic search';
        break;
      case 'paid_ads':
        result.channel = 'paid advertising';
        break;
      default:
        result.channel = 'digital';
    }
  }

  // Extract budget
  const budgetPatterns = [
    /budget[:\s]+\$?([0-9,]+)/i,
    /spend[:\s]+\$?([0-9,]+)/i,
    /\$([0-9,]+)\s*(budget|spend)/i,
    /([0-9,]+)\s*dollar/i
  ];
  
  for (const pattern of budgetPatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount)) {
        result.budget_allocated = amount;
        result.total_budget = amount;
        break;
      }
    }
  }

  // Extract target audience
  const audiencePatterns = [
    /target audience[:\s]+([^.\n]+)/i,
    /targeting[:\s]+([^.\n]+)/i,
    /audience[:\s]+([^.\n]+)/i,
    /customers?\s+(?:are|who are)\s+([^.\n]+)/i
  ];
  
  for (const pattern of audiencePatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      result.target_audience = match[1].trim();
      break;
    }
  }

  // Extract objective
  const objectivePatterns = [
    /objective[:\s]+([^.\n]+)/i,
    /goal[:\s]+([^.\n]+)/i,
    /want to[:\s]+([^.\n]+)/i,
    /trying to[:\s]+([^.\n]+)/i,
    /aim[:\s]+([^.\n]+)/i
  ];
  
  for (const pattern of objectivePatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      result.primary_objective = match[1].trim();
      break;
    }
  }

  // Extract description (use the whole text if no specific description found)
  const descPatterns = [
    /description[:\s]+([^.\n]+)/i,
    /about[:\s]+([^.\n]+)/i
  ];
  
  for (const pattern of descPatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      result.description = match[1].trim();
      break;
    }
  }

  // If no description found, use the conversation text as description (truncated)
  if (!result.description) {
    result.description = conversationText.length > 200 
      ? conversationText.substring(0, 200) + '...'
      : conversationText;
  }

  // Extract demographics
  const demographics: Record<string, any> = {};
  
  // Age patterns
  const ageMatch = text.match(/age[s]?\s*[:\s]*([0-9\-\s]+)/);
  if (ageMatch) {
    demographics.ageRange = ageMatch[1].trim();
  }

  // Location patterns
  const locationMatch = text.match(/location[:\s]+([^.\n]+)/i) || 
                       text.match(/in\s+([A-Za-z\s]+(?:city|state|country))/i);
  if (locationMatch) {
    demographics.location = locationMatch[1].trim();
  }

  // Income patterns
  const incomeMatch = text.match(/income[:\s]+([^.\n]+)/i) || 
                     text.match(/\$([0-9,k]+)\s*(?:income|salary)/i);
  if (incomeMatch) {
    demographics.income = incomeMatch[1].trim();
  }

  // Interests patterns
  const interestsMatch = text.match(/interests?[:\s]+([^.\n]+)/i) || 
                        text.match(/interested in[:\s]+([^.\n]+)/i);
  if (interestsMatch) {
    demographics.interests = interestsMatch[1].trim();
  }

  if (Object.keys(demographics).length > 0) {
    result.demographics = demographics;
  }

  // Extract channels array
  const channels: string[] = [];
  const channelKeywords = ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube', 'tiktok', 'email', 'google', 'bing'];
  
  for (const keyword of channelKeywords) {
    if (text.includes(keyword)) {
      channels.push(keyword);
    }
  }
  
  if (channels.length > 0) {
    result.channels = channels;
  }

  // Extract KPI targets
  const kpiTargets: Record<string, any> = {};
  
  // Lead generation targets
  const leadsMatch = text.match(/([0-9,]+)\s*(?:qualified\s+)?leads?\s*(?:per\s+month|monthly|per\s+week|weekly)?/i);
  if (leadsMatch) {
    kpiTargets.leads = parseInt(leadsMatch[1].replace(/,/g, ''));
    
    // Extract period if specified
    const periodMatch = text.match(/leads?\s*(?:per\s+)?(month|monthly|week|weekly|quarter|quarterly)/i);
    if (periodMatch) {
      kpiTargets.leads_period = periodMatch[1].toLowerCase().replace('ly', '');
    } else {
      kpiTargets.leads_period = 'month'; // default
    }
  }

  // Conversion rate targets
  const conversionRateMatch = text.match(/([0-9.]+)%?\s*conversion\s+rate/i);
  if (conversionRateMatch) {
    kpiTargets.conversion_rate = parseFloat(conversionRateMatch[1]);
  }

  // Engagement rate targets
  const engagementRateMatch = text.match(/([0-9.]+)%?\s*engagement\s+rate/i);
  if (engagementRateMatch) {
    kpiTargets.engagement_rate = parseFloat(engagementRateMatch[1]);
  }

  // Email specific targets
  const openRateMatch = text.match(/([0-9.]+)%?\s*(?:email\s+)?open\s+rate/i);
  if (openRateMatch) {
    kpiTargets.email_open_rate = parseFloat(openRateMatch[1]);
  }

  const clickRateMatch = text.match(/([0-9.]+)%?\s*(?:email\s+)?click\s+rate/i);
  if (clickRateMatch) {
    kpiTargets.email_click_rate = parseFloat(clickRateMatch[1]);
  }

  // Generic conversions
  const conversionsMatch = text.match(/([0-9,]+)\s*conversions?\s*(?:per\s+month|monthly|per\s+week|weekly)?/i);
  if (conversionsMatch) {
    kpiTargets.conversions = parseInt(conversionsMatch[1].replace(/,/g, ''));
    
    const periodMatch = text.match(/conversions?\s*(?:per\s+)?(month|monthly|week|weekly|quarter|quarterly)/i);
    if (periodMatch) {
      kpiTargets.conversions_period = periodMatch[1].toLowerCase().replace('ly', '');
    } else {
      kpiTargets.conversions_period = 'month';
    }
  }

  // CTR for ads
  const ctrMatch = text.match(/([0-9.]+)%?\s*(?:ctr|click.through.rate)/i);
  if (ctrMatch) {
    kpiTargets.click_through_rate = parseFloat(ctrMatch[1]);
  }

  // ROAS (Return on Ad Spend)
  const roasMatch = text.match(/([0-9.]+)(?:x|:1)?\s*(?:roas|return\s+on\s+ad\s+spend)/i);
  if (roasMatch) {
    kpiTargets.return_on_ad_spend = parseFloat(roasMatch[1]);
  }

  // Cost per acquisition
  const cpaMatch = text.match(/\$?([0-9,]+)\s*(?:cpa|cost\s+per\s+acquisition|cost\s+per\s+lead)/i);
  if (cpaMatch) {
    kpiTargets.cost_per_acquisition = parseFloat(cpaMatch[1].replace(/,/g, ''));
  }

  // Social media specific
  const reachMatch = text.match(/([0-9,]+)\s*reach/i);
  if (reachMatch) {
    kpiTargets.reach = parseInt(reachMatch[1].replace(/,/g, ''));
  }

  const impressionsMatch = text.match(/([0-9,]+)\s*impressions/i);
  if (impressionsMatch) {
    kpiTargets.impressions = parseInt(impressionsMatch[1].replace(/,/g, ''));
  }

  // Measurement period (general)
  const measurementPeriodMatch = text.match(/(?:measure|track|report)\s*(?:over|for)\s*([0-9]+)\s*(day|week|month|quarter)s?/i) ||
                                text.match(/(?:monthly|weekly|quarterly|daily)\s*(?:targets|goals|measurement)/i);
  if (measurementPeriodMatch) {
    kpiTargets.measurement_period = measurementPeriodMatch[1] ? 
      `${measurementPeriodMatch[1]} ${measurementPeriodMatch[2]}s` : 
      measurementPeriodMatch[0].split(' ')[0];
  }

  if (Object.keys(kpiTargets).length > 0) {
    result.kpi_targets = kpiTargets;
  }

  // Extract budget breakdown
  const budgetBreakdown: Record<string, any> = {};
  
  const adSpendMatch = text.match(/([0-9,]+)\s*(?:for\s+)?(?:ad\s+spend|advertising)/i);
  if (adSpendMatch) {
    budgetBreakdown.ad_spend = parseFloat(adSpendMatch[1].replace(/,/g, ''));
  }

  const creativeMatch = text.match(/([0-9,]+)\s*(?:for\s+)?(?:creative|design)/i);
  if (creativeMatch) {
    budgetBreakdown.creative = parseFloat(creativeMatch[1].replace(/,/g, ''));
  }

  if (Object.keys(budgetBreakdown).length > 0) {
    result.budget_breakdown = budgetBreakdown;
  }

  // Extract content details
  const content: Record<string, any> = {};
  
  const messageMatch = text.match(/message[:\s]+([^.\n]+)/i);
  if (messageMatch) {
    content.message = messageMatch[1].trim();
  }

  const toneMatch = text.match(/tone[:\s]+([^.\n]+)/i);
  if (toneMatch) {
    content.tone = toneMatch[1].trim();
  }

  if (Object.keys(content).length > 0) {
    result.content = content;
  }

  // Extract dates
  const datePatterns = [
    /start[:\s]+([^.\n]+)/i,
    /begin[:\s]+([^.\n]+)/i,
    /launch[:\s]+([^.\n]+)/i,
    /starting[:\s]+([^.\n]+)/i
  ];
  
  for (const pattern of datePatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      try {
        const dateStr = match[1].trim();
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          result.start_date = parsedDate.toISOString();
        }
      } catch {
        // Invalid date, continue
      }
      break;
    }
  }

  const endDatePatterns = [
    /end[:\s]+([^.\n]+)/i,
    /finish[:\s]+([^.\n]+)/i,
    /until[:\s]+([^.\n]+)/i,
    /through[:\s]+([^.\n]+)/i
  ];
  
  for (const pattern of endDatePatterns) {
    const match = conversationText.match(pattern);
    if (match && match[1]) {
      try {
        const dateStr = match[1].trim();
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          result.end_date = parsedDate.toISOString();
        }
      } catch {
        // Invalid date, continue
      }
      break;
    }
  }

  // Apply smart defaults
  return applySmartDefaults(result);
}

export function applySmartDefaults(campaign: ParsedCampaign): ParsedCampaign {
  const result = { ...campaign };

  // Smart default for campaign name
  if (!result.name) {
    const typeLabel = result.type === 'social_media' ? 'Social Media' : 
                     result.type === 'paid_ads' ? 'Paid Advertising' :
                     result.type ? result.type.charAt(0).toUpperCase() + result.type.slice(1) : 'Marketing';
    result.name = `${typeLabel} Campaign ${new Date().getFullYear()}`;
  }

  // Smart default for start date (today if not specified)
  if (!result.start_date) {
    result.start_date = new Date().toISOString();
  }

  // Smart default for end date (30 days from start date)
  if (!result.end_date && result.start_date) {
    const startDate = new Date(result.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    result.end_date = endDate.toISOString();
  }

  // Smart default for budget based on campaign type
  if (!result.budget_allocated && !result.total_budget) {
    const defaultBudgets: Record<string, number> = {
      'email': 2000,
      'social_media': 3000,
      'content': 4000,
      'seo': 5000,
      'paid_ads': 8000,
      'other': 3000
    };
    
    const suggestedBudget = defaultBudgets[result.type || 'other'];
    result.budget_allocated = suggestedBudget;
    result.total_budget = suggestedBudget;
  }

  // Smart default for target audience if not specified
  if (!result.target_audience) {
    const defaultAudiences: Record<string, string> = {
      'email': 'existing customers and qualified leads interested in company updates and offers',
      'social_media': 'engaged social media users aged 25-45 who follow industry-related content',
      'content': 'professionals seeking educational resources and industry insights',
      'seo': 'organic searchers looking for solutions in the relevant industry',
      'paid_ads': 'high-intent prospects actively researching products or services',
      'other': 'target demographics aligned with business objectives'
    };
    
    result.target_audience = defaultAudiences[result.type || 'other'];
  }

  // Smart default for primary objective
  if (!result.primary_objective) {
    const defaultObjectives: Record<string, string> = {
      'email': 'increase customer engagement and drive repeat purchases through targeted email communications',
      'social_media': 'build brand awareness and community engagement across social platforms',
      'content': 'establish thought leadership and generate qualified leads through valuable content',
      'seo': 'improve organic search visibility and drive qualified website traffic',
      'paid_ads': 'generate immediate leads and conversions through targeted advertising',
      'other': 'achieve measurable business growth through strategic marketing initiatives'
    };
    
    result.primary_objective = defaultObjectives[result.type || 'other'];
  }

  // Smart default for KPI targets based on campaign type
  if (!result.kpi_targets || Object.keys(result.kpi_targets).length === 0) {
    const defaultKPIs: Record<string, Record<string, any>> = {
      'email': {
        open_rate: 25,
        click_through_rate: 3.5,
        conversion_rate: 2.1
      },
      'social_media': {
        engagement_rate: 4.2,
        reach: 10000,
        follower_growth: 5
      },
      'content': {
        page_views: 5000,
        time_on_page: 180,
        lead_generation: 100
      },
      'seo': {
        organic_traffic_increase: 20,
        keyword_rankings: 10,
        conversion_rate: 2.5
      },
      'paid_ads': {
        click_through_rate: 2.8,
        cost_per_acquisition: 50,
        return_on_ad_spend: 4
      },
      'other': {
        traffic_increase: 15,
        conversion_rate: 2.0,
        lead_generation: 75
      }
    };
    
    result.kpi_targets = defaultKPIs[result.type || 'other'];
  }

  // Smart default for budget breakdown
  if (!result.budget_breakdown && result.total_budget) {
    const totalBudget = result.total_budget;
    const defaultBreakdowns: Record<string, Record<string, number>> = {
      'email': {
        platform_costs: Math.round(totalBudget * 0.3),
        design_content: Math.round(totalBudget * 0.4),
        tools_automation: Math.round(totalBudget * 0.3)
      },
      'social_media': {
        ad_spend: Math.round(totalBudget * 0.6),
        content_creation: Math.round(totalBudget * 0.25),
        management_tools: Math.round(totalBudget * 0.15)
      },
      'content': {
        content_creation: Math.round(totalBudget * 0.5),
        promotion: Math.round(totalBudget * 0.3),
        tools_software: Math.round(totalBudget * 0.2)
      },
      'seo': {
        tools_software: Math.round(totalBudget * 0.4),
        content_optimization: Math.round(totalBudget * 0.35),
        technical_seo: Math.round(totalBudget * 0.25)
      },
      'paid_ads': {
        ad_spend: Math.round(totalBudget * 0.7),
        creative_development: Math.round(totalBudget * 0.2),
        management_fees: Math.round(totalBudget * 0.1)
      },
      'other': {
        execution: Math.round(totalBudget * 0.6),
        creative: Math.round(totalBudget * 0.25),
        tools: Math.round(totalBudget * 0.15)
      }
    };
    
    result.budget_breakdown = defaultBreakdowns[result.type || 'other'];
  }

  // Smart default for settings
  if (!result.settings) {
    result.settings = {
      auto_optimization: true,
      frequency_capping: result.type === 'email' ? { daily: 1, weekly: 3 } : { daily: 3, weekly: 10 },
      a_b_testing: true,
      reporting_frequency: 'weekly'
    };
  }

  return result;
}

export function detectCampaignType(userInput: string): 'email' | 'social_media' | 'other' | 'seo' | 'content' | 'paid_ads' {
  const text = userInput.toLowerCase();
  
  // Email campaign detection
  if (text.includes('email blast') || text.includes('email campaign') || 
      text.includes('newsletter') || text.includes('drip campaign') ||
      text.includes('email marketing') || text.includes('email automation')) {
    return 'email';
  }
  
  // Social media campaign detection  
  if (text.includes('social media') || text.includes('social campaign') ||
      text.includes('instagram') || text.includes('facebook') || 
      text.includes('twitter') || text.includes('linkedin') ||
      text.includes('tiktok') || text.includes('social post')) {
    return 'social_media';
  }
  
  // Content campaign detection
  if (text.includes('content marketing') || text.includes('blog campaign') ||
      text.includes('article series') || text.includes('content creation') ||
      text.includes('editorial calendar') || text.includes('content strategy')) {
    return 'content';
  }
  
  // SEO campaign detection
  if (text.includes('seo campaign') || text.includes('search engine') ||
      text.includes('organic search') || text.includes('keyword optimization') ||
      text.includes('search ranking') || text.includes('google ranking')) {
    return 'seo';
  }
  
  // Paid ads campaign detection
  if (text.includes('paid ads') || text.includes('ppc campaign') ||
      text.includes('google ads') || text.includes('facebook ads') ||
      text.includes('advertising campaign') || text.includes('sponsored posts') ||
      text.includes('paid advertising') || text.includes('ad campaign')) {
    return 'paid_ads';
  }
  
  // Fallback to broader category detection
  if (text.includes('email')) return 'email';
  if (text.includes('social')) return 'social_media';  
  if (text.includes('content') || text.includes('blog')) return 'content';
  if (text.includes('seo') || text.includes('search')) return 'seo';
  if (text.includes('ads') || text.includes('advertising')) return 'paid_ads';
  
  return 'other';
}

export function enhanceUserAnswer(userInput: string, questionKey: string): string {
  const input = userInput.toLowerCase().trim();
  
  // Industry enhancement patterns
  if (questionKey === 'industry') {
    const industryMap: Record<string, string> = {
      'restaurants': 'restaurant industry focusing on operational efficiency and customer experience enhancement',
      'restaurant': 'restaurant industry focusing on operational efficiency and customer experience enhancement',
      'retail': 'retail sector emphasizing customer engagement and omnichannel commerce optimization',
      'tech': 'technology sector driving innovation and digital transformation solutions',
      'healthcare': 'healthcare industry prioritizing patient care improvement and operational excellence',
      'finance': 'financial services sector focusing on customer trust and digital banking innovation',
      'education': 'education sector enhancing learning outcomes and institutional effectiveness',
      'manufacturing': 'manufacturing industry optimizing production efficiency and supply chain management',
      'real estate': 'real estate market focusing on property value optimization and client relationship management',
      'fitness': 'fitness and wellness industry promoting healthy lifestyle transformation',
      'beauty': 'beauty and cosmetics sector emphasizing personal care and aesthetic enhancement',
      'automotive': 'automotive industry driving mobility innovation and customer satisfaction',
      'travel': 'travel and hospitality sector creating memorable experiences and seamless journeys',
      'legal': 'legal services industry providing comprehensive counsel and regulatory compliance',
      'consulting': 'professional consulting services delivering strategic insights and business transformation'
    };

    for (const [key, enhancement] of Object.entries(industryMap)) {
      if (input.includes(key)) {
        return enhancement;
      }
    }
    
    // Generic industry enhancement
    return `${input} industry focused on growth, customer satisfaction, and market leadership`;
  }

  // Target audience enhancement patterns
  if (questionKey === 'target_audience') {
    if (input.includes('young') || input.includes('millennials') || input.includes('gen z')) {
      return `digitally-native consumers aged 18-35 who value authenticity, social responsibility, and seamless digital experiences`;
    }
    if (input.includes('business') || input.includes('b2b') || input.includes('companies')) {
      return `decision-makers at growing businesses seeking efficiency improvements and competitive advantages`;
    }
    if (input.includes('families') || input.includes('parents')) {
      return `family-oriented consumers prioritizing value, convenience, and products that enhance their quality of life`;
    }
    if (input.includes('professionals') || input.includes('working')) {
      return `career-focused professionals seeking solutions that optimize their productivity and work-life balance`;
    }
    
    // Generic audience enhancement
    return `engaged consumers who value quality, trust, and meaningful brand relationships in the ${input} demographic`;
  }

  // Goals/objectives enhancement patterns
  if (questionKey === 'goals') {
    const goalMap: Record<string, string> = {
      'awareness': 'comprehensive brand awareness expansion through strategic multi-channel visibility campaigns',
      'leads': 'qualified lead generation with optimized conversion funnels and nurturing sequences',
      'sales': 'revenue growth acceleration through targeted customer acquisition and retention strategies',
      'engagement': 'enhanced customer engagement fostering long-term brand loyalty and community building',
      'traffic': 'strategic website traffic growth with focus on high-intent visitors and conversion optimization',
      'retention': 'customer retention improvement through personalized experiences and value-driven communications'
    };

    for (const [key, enhancement] of Object.entries(goalMap)) {
      if (input.includes(key)) {
        return enhancement;
      }
    }
    
    return `strategic business growth through ${input} optimization and performance enhancement`;
  }

  // Channels enhancement patterns
  if (questionKey === 'channels') {
    const channelMap: Record<string, string> = {
      'social': 'integrated social media marketing across platforms with engaging content and community management',
      'email': 'sophisticated email marketing campaigns with personalized messaging and automation workflows',
      'google': 'comprehensive Google Ads strategy including search, display, and shopping campaigns',
      'content': 'strategic content marketing featuring valuable resources, SEO optimization, and thought leadership',
      'influencer': 'authentic influencer partnerships driving brand credibility and audience expansion'
    };

    for (const [key, enhancement] of Object.entries(channelMap)) {
      if (input.includes(key)) {
        return enhancement;
      }
    }
    
    return `strategic ${input} marketing approach with integrated campaigns and performance tracking`;
  }

  // Key messages enhancement patterns
  if (questionKey === 'key_messages') {
    if (input.includes('quality') || input.includes('best')) {
      return `premium quality solutions delivering exceptional value and unmatched customer satisfaction`;
    }
    if (input.includes('affordable') || input.includes('cheap') || input.includes('budget')) {
      return `cost-effective solutions providing maximum value without compromising on quality or service`;
    }
    if (input.includes('fast') || input.includes('quick') || input.includes('speed')) {
      return `rapid service delivery and efficient solutions that respect your time and urgent needs`;
    }
    if (input.includes('reliable') || input.includes('trust')) {
      return `dependable partnership built on trust, transparency, and consistent delivery excellence`;
    }
    
    return `compelling value proposition emphasizing ${input} as a key differentiator in the marketplace`;
  }

  // Budget enhancement patterns
  if (questionKey === 'budget') {
    const amount = input.match(/(\d+)/)?.[1];
    if (amount) {
      const numAmount = parseInt(amount);
      if (numAmount < 1000) {
        return `strategic budget allocation of $${amount} focused on high-impact, cost-effective marketing channels`;
      } else if (numAmount < 10000) {
        return `comprehensive marketing investment of $${amount} enabling multi-channel campaigns with measurable ROI`;
      } else {
        return `substantial marketing budget of $${amount} supporting enterprise-level campaigns across all major channels`;
      }
    }
    
    return `optimized budget allocation ensuring maximum return on marketing investment through ${input}`;
  }

  // Timeline enhancement patterns
  if (questionKey === 'timeline') {
    if (input.includes('week')) {
      return `intensive short-term campaign designed for immediate impact and rapid market response`;
    }
    if (input.includes('month')) {
      return `focused monthly campaign strategy with weekly optimization and performance tracking`;
    }
    if (input.includes('quarter') || input.includes('3 month')) {
      return `comprehensive quarterly campaign with progressive objectives and milestone-based optimization`;
    }
    if (input.includes('ongoing') || input.includes('continuous')) {
      return `sustainable long-term marketing strategy with continuous optimization and audience development`;
    }
    
    return `strategically planned ${input} campaign timeline with phased implementation and regular performance reviews`;
  }

  // Success metrics enhancement patterns
  if (questionKey === 'success_metrics') {
    const metricsMap: Record<string, string> = {
      'revenue': 'comprehensive revenue tracking with attribution modeling and customer lifetime value analysis',
      'leads': 'qualified lead generation metrics including lead quality scores and conversion funnel performance',
      'traffic': 'website traffic analysis featuring user engagement, session quality, and conversion pathways',
      'awareness': 'brand awareness measurement through reach, frequency, and sentiment analysis across channels',
      'engagement': 'multi-platform engagement tracking including interaction rates, shares, and community growth'
    };

    for (const [key, enhancement] of Object.entries(metricsMap)) {
      if (input.includes(key)) {
        return enhancement;
      }
    }
    
    return `comprehensive performance measurement framework tracking ${input} with detailed analytics and insights`;
  }

  // Generic enhancement for any unmatched input
  if (input.length < 20) {
    return `professionally optimized ${input} strategy aligned with industry best practices and performance objectives`;
  }
  
  // If input is already detailed, enhance with professional language
  return `${input.charAt(0).toUpperCase() + input.slice(1)} with strategic focus on measurable outcomes and sustainable growth`;
}