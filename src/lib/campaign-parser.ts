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
  if (text.includes('email') || text.includes('newsletter') || text.includes('drip')) {
    result.type = 'email';
  } else if (text.includes('social') || text.includes('instagram') || text.includes('facebook') || text.includes('twitter') || text.includes('linkedin')) {
    result.type = 'social_media';
  } else if (text.includes('seo') || text.includes('search engine') || text.includes('organic')) {
    result.type = 'seo';
  } else if (text.includes('content') || text.includes('blog') || text.includes('article')) {
    result.type = 'content';
  } else if (text.includes('paid') || text.includes('ads') || text.includes('ppc') || text.includes('advertising')) {
    result.type = 'paid_ads';
  } else {
    result.type = 'other';
  }

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
  
  const impressionsMatch = text.match(/([0-9,]+)\s*impressions/i);
  if (impressionsMatch) {
    kpiTargets.impressions = parseInt(impressionsMatch[1].replace(/,/g, ''));
  }

  const clicksMatch = text.match(/([0-9,]+)\s*clicks/i);
  if (clicksMatch) {
    kpiTargets.clicks = parseInt(clicksMatch[1].replace(/,/g, ''));
  }

  const conversionsMatch = text.match(/([0-9,]+)\s*conversions?/i);
  if (conversionsMatch) {
    kpiTargets.conversions = parseInt(conversionsMatch[1].replace(/,/g, ''));
  }

  const ctrMatch = text.match(/([0-9.]+)%?\s*(?:ctr|click.through.rate)/i);
  if (ctrMatch) {
    kpiTargets.ctr = parseFloat(ctrMatch[1]);
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

  return result;
}