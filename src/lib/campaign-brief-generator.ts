import type { Database } from '@/integrations/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'];

export interface CampaignBrief {
  title: string;
  executiveSummary: string;
  objectives: string[];
  targetAudience: {
    primary: string;
    demographics: Record<string, any>;
    psychographics: string[];
  };
  strategy: {
    approach: string;
    channels: string[];
    messaging: string[];
  };
  budget: {
    total: number;
    allocation: Record<string, number>;
    breakdown: Record<string, number>;
  };
  timeline: {
    startDate: string;
    endDate: string;
    duration: string;
    milestones: Array<{ date: string; description: string }>;
  };
  kpiTargets: {
    primary: Record<string, any>;
    secondary: Record<string, any>;
    measurementPeriod: string;
  };
  deliverables: string[];
  riskMitigation: string[];
  successCriteria: string[];
  nextSteps: string[];
  generatedAt: string;
}

export function generateCampaignBrief(campaign: Campaign): CampaignBrief {
  const startDate = new Date(campaign.start_date || Date.now());
  const endDate = new Date(campaign.end_date || Date.now() + 30 * 24 * 60 * 60 * 1000);
  const duration = calculateDuration(startDate, endDate);

  return {
    title: `Campaign Brief: ${campaign.name}`,
    executiveSummary: generateExecutiveSummary(campaign),
    objectives: generateObjectives(campaign),
    targetAudience: generateTargetAudience(campaign),
    strategy: generateStrategy(campaign),
    budget: generateBudgetSection(campaign),
    timeline: {
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      duration,
      milestones: generateMilestones(startDate, endDate, campaign)
    },
    kpiTargets: generateKPITargets(campaign),
    deliverables: generateDeliverables(campaign),
    riskMitigation: generateRiskMitigation(campaign),
    successCriteria: generateSuccessCriteria(campaign),
    nextSteps: generateNextSteps(campaign),
    generatedAt: new Date().toISOString()
  };
}

function generateExecutiveSummary(campaign: Campaign): string {
  const channelText = Array.isArray(campaign.channels) && campaign.channels.length > 1 
    ? `multi-channel approach across ${campaign.channels.join(', ')}` 
    : `focused ${campaign.channel} strategy`;

  return `This ${campaign.type?.replace('_', ' ')} campaign leverages a ${channelText} to achieve ${campaign.primary_objective || 'business growth objectives'}. With a total budget of $${campaign.budget_allocated?.toLocaleString() || 'TBD'} over ${calculateDuration(new Date(campaign.start_date || Date.now()), new Date(campaign.end_date || Date.now()))}, this initiative targets ${campaign.target_audience || 'key demographics'} through strategic messaging and optimized channel execution. The campaign is designed to deliver measurable results aligned with organizational KPIs and market positioning goals.`;
}

function generateObjectives(campaign: Campaign): string[] {
  const objectives = [];
  
  if (campaign.primary_objective) {
    objectives.push(`Primary: ${campaign.primary_objective}`);
  }
  
  // Extract objectives from KPI targets
  const kpiTargets = campaign.kpi_targets as Record<string, any> || {};
  if (kpiTargets.leads) {
    objectives.push(`Generate ${kpiTargets.leads} qualified leads ${kpiTargets.leads_period ? `per ${kpiTargets.leads_period}` : ''}`);
  }
  if (kpiTargets.conversions) {
    objectives.push(`Achieve ${kpiTargets.conversions} conversions ${kpiTargets.conversions_period ? `per ${kpiTargets.conversions_period}` : ''}`);
  }
  if (kpiTargets.engagement_rate) {
    objectives.push(`Maintain ${kpiTargets.engagement_rate}% engagement rate across social channels`);
  }
  if (kpiTargets.email_open_rate) {
    objectives.push(`Achieve ${kpiTargets.email_open_rate}% email open rate`);
  }
  
  // Add strategic objectives based on campaign type
  const typeObjectives = getTypeSpecificObjectives(campaign.type);
  objectives.push(...typeObjectives);
  
  return objectives.length > 0 ? objectives : ['Increase brand awareness and market presence', 'Drive qualified lead generation', 'Optimize customer acquisition costs'];
}

function generateTargetAudience(campaign: Campaign): CampaignBrief['targetAudience'] {
  const demographics = campaign.demographics as Record<string, any> || {};
  
  return {
    primary: campaign.target_audience || 'Primary target demographic',
    demographics: {
      ageRange: demographics.ageRange || 'Not specified',
      location: demographics.location || 'Geographic focus area',
      income: demographics.income || 'Income bracket',
      interests: demographics.interests || 'Interest categories'
    },
    psychographics: generatePsychographics(campaign)
  };
}

function generateStrategy(campaign: Campaign): CampaignBrief['strategy'] {
  const channels = Array.isArray(campaign.channels) ? campaign.channels.map(String) : [campaign.channel].filter(Boolean);
  const content = campaign.content as Record<string, any> || {};
  
  return {
    approach: generateStrategicApproach(campaign),
    channels: channels,
    messaging: generateMessaging(content, campaign.type)
  };
}

function generateBudgetSection(campaign: Campaign): CampaignBrief['budget'] {
  const budgetBreakdown = campaign.budget_breakdown as Record<string, number> || {};
  const channelAllocation = campaign.channel_budget_allocation as Record<string, number> || {};
  
  return {
    total: campaign.budget_allocated || campaign.total_budget || 0,
    allocation: Object.keys(channelAllocation).length > 0 ? channelAllocation : { [campaign.channel || 'primary']: campaign.budget_allocated || 0 },
    breakdown: Object.keys(budgetBreakdown).length > 0 ? budgetBreakdown : generateDefaultBudgetBreakdown(campaign)
  };
}

function generateKPITargets(campaign: Campaign): CampaignBrief['kpiTargets'] {
  const kpiTargets = campaign.kpi_targets as Record<string, any> || {};
  
  const primary: Record<string, any> = {};
  const secondary: Record<string, any> = {};
  
  // Categorize KPIs
  ['leads', 'conversions', 'conversion_rate'].forEach(key => {
    if (kpiTargets[key]) primary[key] = kpiTargets[key];
  });
  
  ['engagement_rate', 'email_open_rate', 'click_through_rate', 'reach', 'impressions'].forEach(key => {
    if (kpiTargets[key]) secondary[key] = kpiTargets[key];
  });
  
  return {
    primary: Object.keys(primary).length > 0 ? primary : { 'lead_generation': 'Target number TBD' },
    secondary: Object.keys(secondary).length > 0 ? secondary : { 'engagement': 'Engagement targets TBD' },
    measurementPeriod: kpiTargets.measurement_period || kpiTargets.leads_period || 'monthly'
  };
}

function generateDeliverables(campaign: Campaign): string[] {
  const deliverables = [];
  const type = campaign.type;
  const channels = Array.isArray(campaign.channels) ? campaign.channels : [campaign.channel].filter(Boolean);
  
  // Type-specific deliverables
  if (type === 'email') {
    deliverables.push('Email template designs', 'Subject line variations', 'Automation workflows', 'A/B testing framework');
  } else if (type === 'social') {
    deliverables.push('Social content calendar', 'Visual assets and graphics', 'Community management guidelines', 'Hashtag strategy');
  } else if (type === 'content') {
    deliverables.push('Content strategy document', 'Editorial calendar', 'SEO-optimized articles', 'Content performance framework');
  } else if (type === 'paid_ads') {
    deliverables.push('Ad creative variations', 'Landing page optimization', 'Audience targeting setup', 'Bid management strategy');
  }
  
  // Channel-specific deliverables
  channels.forEach(channel => {
    if (channel === 'instagram') deliverables.push('Instagram story templates', 'IGTV content plan');
    if (channel === 'facebook') deliverables.push('Facebook ad campaigns', 'Event setup and promotion');
    if (channel === 'linkedin') deliverables.push('LinkedIn article strategy', 'Professional networking plan');
  });
  
  // Universal deliverables
  deliverables.push(
    'Campaign performance dashboard',
    'Weekly performance reports',
    'ROI analysis and optimization recommendations',
    'Final campaign summary and insights'
  );
  
  return [...new Set(deliverables)]; // Remove duplicates
}

function generateRiskMitigation(campaign: Campaign): string[] {
  const risks = [
    'Budget monitoring and spend optimization to prevent overspend',
    'Performance tracking with weekly reviews and adjustment protocols',
    'Creative fatigue mitigation through regular asset rotation',
    'Audience targeting refinement based on performance data'
  ];
  
  if (campaign.type === 'social') {
    risks.push('Social media crisis management plan and response protocols');
  }
  
  if (campaign.type === 'email') {
    risks.push('Email deliverability monitoring and sender reputation management');
  }
  
  if (Array.isArray(campaign.channels) && campaign.channels.length > 1) {
    risks.push('Cross-channel message consistency monitoring and coordination');
  }
  
  return risks;
}

function generateSuccessCriteria(campaign: Campaign): string[] {
  const criteria = [];
  const kpiTargets = campaign.kpi_targets as Record<string, any> || {};
  
  if (kpiTargets.leads) {
    criteria.push(`Achievement of ${kpiTargets.leads} qualified leads target`);
  }
  if (kpiTargets.conversion_rate) {
    criteria.push(`Conversion rate at or above ${kpiTargets.conversion_rate}%`);
  }
  if (kpiTargets.engagement_rate) {
    criteria.push(`Social engagement rate exceeding ${kpiTargets.engagement_rate}%`);
  }
  
  criteria.push(
    'Positive ROI with cost per acquisition within target range',
    'Brand awareness increase measured through surveys and social listening',
    'Successful campaign execution within budget and timeline constraints'
  );
  
  return criteria;
}

function generateNextSteps(campaign: Campaign): string[] {
  return [
    'Creative asset development and brand alignment review',
    'Campaign setup and technical implementation across selected channels',
    'Launch sequence coordination and stakeholder communication',
    'Performance monitoring dashboard configuration',
    'Weekly optimization reviews and adjustment implementation',
    'Post-campaign analysis and learnings documentation'
  ];
}

// Helper functions
function calculateDuration(start: Date, end: Date): string {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
  return `${Math.ceil(diffDays / 30)} months`;
}

function generateMilestones(start: Date, end: Date, campaign: Campaign): Array<{ date: string; description: string }> {
  const milestones = [];
  const duration = end.getTime() - start.getTime();
  
  milestones.push({
    date: start.toLocaleDateString(),
    description: 'Campaign launch and initial monitoring'
  });
  
  // Add mid-campaign milestone
  const midPoint = new Date(start.getTime() + duration / 2);
  milestones.push({
    date: midPoint.toLocaleDateString(),
    description: 'Mid-campaign performance review and optimization'
  });
  
  // Add final milestone
  milestones.push({
    date: end.toLocaleDateString(),
    description: 'Campaign completion and final analysis'
  });
  
  return milestones;
}

function getTypeSpecificObjectives(type: string | null): string[] {
  const objectives: Record<string, string[]> = {
    email: ['Improve email list engagement and retention', 'Optimize email automation workflows'],
    social_media: ['Increase social media following and engagement', 'Build brand community and advocacy'],
    content: ['Establish thought leadership in industry', 'Improve organic search rankings'],
    paid_ads: ['Optimize ad spend efficiency and ROAS', 'Expand market reach through targeted advertising'],
    seo: ['Improve organic search visibility', 'Increase website traffic and domain authority']
  };
  
  return objectives[type || 'other'] || ['Drive brand awareness and market presence'];
}

function generatePsychographics(campaign: Campaign): string[] {
  const type = campaign.type;
  const psychographics: Record<string, string[]> = {
    email: ['Values personalized communication', 'Prefers detailed information', 'Responds to exclusive offers'],
    social_media: ['Highly engaged with digital content', 'Values community and social proof', 'Seeks authentic brand interactions'],
    content: ['Values educational content and insights', 'Prefers in-depth analysis', 'Seeks industry expertise'],
    paid_ads: ['Responsive to targeted messaging', 'Values convenience and efficiency', 'Open to new product discovery']
  };
  
  return psychographics[type || 'other'] || ['Tech-savvy and digitally engaged', 'Values quality and authenticity', 'Seeks value-driven solutions'];
}

function generateStrategicApproach(campaign: Campaign): string {
  const approaches: Record<string, string> = {
    email: 'Personalized email marketing with segmentation-based messaging and automated nurture sequences',
    social_media: 'Community-driven social engagement with user-generated content and influencer collaboration',
    content: 'Educational content marketing establishing thought leadership and driving organic discovery',
    paid_ads: 'Data-driven paid advertising with continuous optimization and audience refinement',
    seo: 'Comprehensive SEO strategy focusing on content optimization and technical improvements'
  };
  
  return approaches[campaign.type || 'other'] || 'Integrated marketing approach combining multiple touchpoints for maximum impact';
}

function generateMessaging(content: Record<string, any>, type: string | null): string[] {
  const messaging = [];
  
  if (content.message) {
    messaging.push(`Primary message: ${content.message}`);
  }
  
  if (content.tone) {
    messaging.push(`Tone: ${content.tone}`);
  }
  
  // Add type-specific messaging
  const typeMessaging: Record<string, string[]> = {
    email: ['Personalized and value-driven communication', 'Clear call-to-action messaging'],
    social_media: ['Engaging and shareable content', 'Community-focused messaging'],
    content: ['Educational and informative messaging', 'Expert positioning and thought leadership'],
    paid_ads: ['Compelling and action-oriented messaging', 'Benefit-focused value propositions']
  };
  
  const specificMessaging = typeMessaging[type || 'other'] || ['Professional and trustworthy messaging', 'Customer-centric value communication'];
  messaging.push(...specificMessaging);
  
  return messaging;
}

function generateDefaultBudgetBreakdown(campaign: Campaign): Record<string, number> {
  const total = campaign.budget_allocated || campaign.total_budget || 0;
  const type = campaign.type;
  
  const breakdowns: Record<string, Record<string, number>> = {
    email: {
      'Platform and tools': Math.round(total * 0.3),
      'Design and content': Math.round(total * 0.4),
      'Automation setup': Math.round(total * 0.3)
    },
    social_media: {
      'Ad spend': Math.round(total * 0.6),
      'Content creation': Math.round(total * 0.25),
      'Management tools': Math.round(total * 0.15)
    },
    paid_ads: {
      'Ad spend': Math.round(total * 0.7),
      'Creative development': Math.round(total * 0.2),
      'Management and optimization': Math.round(total * 0.1)
    }
  };
  
  return breakdowns[type || 'other'] || {
    'Execution': Math.round(total * 0.6),
    'Creative and content': Math.round(total * 0.25),
    'Tools and platforms': Math.round(total * 0.15)
  };
}