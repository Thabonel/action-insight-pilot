// Viral Prompts Library - Research-backed viral content prompts

export interface ViralPrompt {
  id: string;
  name: string;
  category: 'hook' | 'story' | 'engagement' | 'cta' | 'emotion';
  platform: 'universal' | 'twitter' | 'linkedin' | 'instagram' | 'tiktok' | 'facebook';
  template: string;
  description: string;
  effectiveness_score: number; // 1-10 based on proven results
  psychological_triggers: string[];
}

export const viralPromptsLibrary: ViralPrompt[] = [
  // Attention-Grabbing Hooks
  {
    id: 'hook-001',
    name: 'Stop Scroll Pattern',
    category: 'hook',
    platform: 'universal',
    template: 'Stop scrolling if you {specific condition}. This {solution/tip} will {specific benefit} in {timeframe}.',
    description: 'Pattern interrupt that stops endless scrolling',
    effectiveness_score: 9,
    psychological_triggers: ['pattern interrupt', 'exclusivity', 'urgency']
  },
  {
    id: 'hook-002', 
    name: 'Controversial Opinion',
    category: 'hook',
    platform: 'universal',
    template: 'Unpopular opinion: {controversial statement}. Here\'s why I\'m right...',
    description: 'Creates debate and engagement through contrarian views',
    effectiveness_score: 8,
    psychological_triggers: ['controversy', 'curiosity', 'social proof']
  },
  {
    id: 'hook-003',
    name: 'Secret Revelation',
    category: 'hook', 
    platform: 'universal',
    template: 'Nobody talks about this, but {industry/topic} professionals secretly {hidden truth}...',
    description: 'Promises insider knowledge and exclusive information',
    effectiveness_score: 9,
    psychological_triggers: ['exclusivity', 'insider knowledge', 'curiosity']
  },
  {
    id: 'hook-004',
    name: 'Before/After Tease',
    category: 'hook',
    platform: 'instagram',
    template: '6 months ago I was {negative situation}. Today I {positive outcome}. Here\'s what changed everything:',
    description: 'Shows transformation journey to create engagement',
    effectiveness_score: 8,
    psychological_triggers: ['transformation', 'hope', 'curiosity']
  },
  {
    id: 'hook-005',
    name: 'Mistake Admission',
    category: 'hook',
    platform: 'universal',
    template: 'I made a {costly/embarrassing} mistake so you don\'t have to. Here\'s what I learned:',
    description: 'Vulnerability creates connection and provides value',
    effectiveness_score: 7,
    psychological_triggers: ['vulnerability', 'learning', 'prevention']
  },

  // Storytelling Frameworks
  {
    id: 'story-001',
    name: 'Hero\'s Journey Micro',
    category: 'story',
    platform: 'universal',
    template: 'I was {starting point}, then {challenge appeared}, so I {action taken}, and now {transformation}. The lesson: {key insight}',
    description: 'Compressed hero\'s journey for social media',
    effectiveness_score: 9,
    psychological_triggers: ['narrative arc', 'transformation', 'relatability']
  },
  {
    id: 'story-002',
    name: 'The Moment Everything Changed',
    category: 'story',
    platform: 'universal',
    template: 'There was one moment that changed everything for me. It was {specific moment}, and suddenly I realized {insight}. Since then, {outcome}.',
    description: 'Pivotal moment storytelling that creates emotional connection',
    effectiveness_score: 8,
    psychological_triggers: ['epiphany', 'transformation', 'emotional connection']
  },
  {
    id: 'story-003',
    name: 'Behind the Scenes Truth',
    category: 'story',
    platform: 'universal',
    template: 'Everyone sees {public success}, but nobody talks about {hidden struggle}. The real story is {authentic experience}.',
    description: 'Reveals the hidden reality behind success',
    effectiveness_score: 8,
    psychological_triggers: ['authenticity', 'vulnerability', 'relatability']
  },

  // Engagement Drivers
  {
    id: 'engagement-001',
    name: 'This or That Challenge',
    category: 'engagement',
    platform: 'universal',
    template: '{Option A} vs {Option B} - which team are you on? Comment {A} or {B} and I\'ll tell you why you\'re right (or wrong) 😏',
    description: 'Creates binary choice engagement with playful follow-up',
    effectiveness_score: 9,
    psychological_triggers: ['choice', 'gamification', 'social belonging']
  },
  {
    id: 'engagement-002',
    name: 'Fill in the Blank',
    category: 'engagement', 
    platform: 'universal',
    template: 'Finish this sentence: "The biggest mistake people make with {topic} is ________." I\'ll share the best answers!',
    description: 'Interactive completion that showcases audience wisdom',
    effectiveness_score: 8,
    psychological_triggers: ['participation', 'validation', 'community']
  },
  {
    id: 'engagement-003',
    name: 'Unpopular Opinion Poll',
    category: 'engagement',
    platform: 'universal',
    template: 'Unpopular opinion: {controversial statement}. React with 🔥 if you agree, 😬 if you disagree. Let\'s see where everyone stands...',
    description: 'Uses reactions to gauge controversial opinions',
    effectiveness_score: 7,
    psychological_triggers: ['controversy', 'social proof', 'tribal identity']
  },

  // Emotional Triggers
  {
    id: 'emotion-001',
    name: 'Fear of Missing Out',
    category: 'emotion',
    platform: 'universal',
    template: 'While everyone is {common behavior}, smart people are quietly {alternative behavior}. Don\'t get left behind.',
    description: 'Creates FOMO by highlighting alternative approaches',
    effectiveness_score: 8,
    psychological_triggers: ['FOMO', 'exclusivity', 'intelligence signaling']
  },
  {
    id: 'emotion-002',
    name: 'Inspiration Through Struggle',
    category: 'emotion',
    platform: 'universal',
    template: 'When I was {lowest point}, someone told me "{motivational quote/advice}". It changed everything. If you\'re struggling with {issue}, read this.',
    description: 'Combines vulnerability with inspirational messaging',
    effectiveness_score: 8,
    psychological_triggers: ['hope', 'relatability', 'inspiration']
  },
  {
    id: 'emotion-003',
    name: 'Righteous Anger',
    category: 'emotion',
    platform: 'universal', 
    template: 'I\'m tired of seeing {unfair situation}. It\'s time we talk about {important issue} that nobody wants to address.',
    description: 'Channels frustration into actionable discussion',
    effectiveness_score: 7,
    psychological_triggers: ['justice', 'advocacy', 'community']
  },

  // Call-to-Actions
  {
    id: 'cta-001',
    name: 'Tag and Share',
    category: 'cta',
    platform: 'universal',
    template: 'Tag someone who needs to see this. Share if you agree. Save if you\'ll come back to it later.',
    description: 'Triple CTA that maximizes different types of engagement',
    effectiveness_score: 9,
    psychological_triggers: ['social sharing', 'agreement', 'utility']
  },
  {
    id: 'cta-002',
    name: 'Comment Challenge',
    category: 'cta',
    platform: 'universal',
    template: 'Drop your {specific request} in the comments. I\'ll personally reply to every single one with {value offer}.',
    description: 'Personal response promise drives comments',
    effectiveness_score: 8,
    psychological_triggers: ['personal attention', 'value exchange', 'reciprocity']
  },
  {
    id: 'cta-003',
    name: 'Experience Share',
    category: 'cta',
    platform: 'universal',
    template: 'What\'s your experience with {topic}? Share your story below - I read every comment and the best ones get featured!',
    description: 'Encourages story sharing with featured incentive',
    effectiveness_score: 7,
    psychological_triggers: ['storytelling', 'recognition', 'community']
  },

  // Platform-Specific Templates
  {
    id: 'twitter-001',
    name: 'Twitter Thread Starter',
    category: 'hook',
    platform: 'twitter',
    template: '{Number} {controversial/surprising} truths about {topic} that will {specific outcome}:\n\n🧵Thread below',
    description: 'Thread format optimized for Twitter engagement',
    effectiveness_score: 9,
    psychological_triggers: ['list format', 'controversy', 'thread anticipation']
  },
  {
    id: 'linkedin-001',
    name: 'LinkedIn Professional Insight',
    category: 'hook',
    platform: 'linkedin',
    template: 'After {number} years in {industry}, I\'ve learned that {counterintuitive insight}. Here\'s what most professionals get wrong:',
    description: 'Authority-building opener for professional audience',
    effectiveness_score: 8,
    psychological_triggers: ['authority', 'experience', 'professional insight']
  },
  {
    id: 'tiktok-001',
    name: 'TikTok Trend Hook',
    category: 'hook',
    platform: 'tiktok',
    template: 'POV: You just discovered {surprising fact/hack} and now you\'re {emotional reaction}. Here\'s what happened:',
    description: 'POV format popular on TikTok with emotional payoff',
    effectiveness_score: 9,
    psychological_triggers: ['perspective taking', 'discovery', 'emotional journey']
  }
];

// Utility functions
export const getPromptsByCategory = (category: ViralPrompt['category']): ViralPrompt[] => {
  return viralPromptsLibrary.filter(prompt => prompt.category === category);
};

export const getPromptsByPlatform = (platform: ViralPrompt['platform']): ViralPrompt[] => {
  return viralPromptsLibrary.filter(prompt => prompt.platform === platform || prompt.platform === 'universal');
};

export const getTopPerformingPrompts = (limit: number = 10): ViralPrompt[] => {
  return viralPromptsLibrary
    .sort((a, b) => b.effectiveness_score - a.effectiveness_score)
    .slice(0, limit);
};

export const searchPrompts = (query: string): ViralPrompt[] => {
  const lowerQuery = query.toLowerCase();
  return viralPromptsLibrary.filter(prompt => 
    prompt.name.toLowerCase().includes(lowerQuery) ||
    prompt.template.toLowerCase().includes(lowerQuery) ||
    prompt.description.toLowerCase().includes(lowerQuery) ||
    prompt.psychological_triggers.some(trigger => trigger.toLowerCase().includes(lowerQuery))
  );
};