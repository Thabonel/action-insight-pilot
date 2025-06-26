export interface CampaignQuestion {
  key: string;
  prompt: string;
  validation: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    type?: 'text' | 'number' | 'select' | 'multiselect';
    options?: string[];
    min?: number;
    max?: number;
  };
}

export const CAMPAIGN_QUESTIONS: CampaignQuestion[] = [
  {
    key: 'industry',
    prompt: 'What industry or sector does your business operate in? This helps me understand your market context and competition.',
    validation: {
      required: true,
      type: 'text',
      minLength: 2,
      maxLength: 100
    }
  },
  {
    key: 'target_audience',
    prompt: 'Who is your primary target audience? Please describe their demographics, interests, pain points, and behaviors.',
    validation: {
      required: true,
      type: 'text',
      minLength: 10,
      maxLength: 500
    }
  },
  {
    key: 'budget',
    prompt: 'What is your total marketing budget for this campaign? Please provide a number in USD.',
    validation: {
      required: true,
      type: 'number',
      min: 100,
      max: 10000000
    }
  },
  {
    key: 'goals',
    prompt: 'What are your primary campaign objectives? (e.g., brand awareness, lead generation, sales, customer retention)',
    validation: {
      required: true,
      type: 'multiselect',
      options: [
        'Brand Awareness',
        'Lead Generation',
        'Sales Conversion',
        'Customer Retention',
        'Website Traffic',
        'Social Media Engagement',
        'Product Launch',
        'Market Expansion'
      ]
    }
  },
  {
    key: 'timeline',
    prompt: 'What is your desired campaign timeline? How long should this campaign run?',
    validation: {
      required: true,
      type: 'select',
      options: [
        '1-2 weeks',
        '1 month',
        '2-3 months',
        '3-6 months',
        '6-12 months',
        'Ongoing/Always-on'
      ]
    }
  },
  {
    key: 'channels',
    prompt: 'Which marketing channels would you like to focus on? Select all that apply.',
    validation: {
      required: true,
      type: 'multiselect',
      options: [
        'Social Media (Facebook, Instagram, Twitter)',
        'Google Ads (Search & Display)',
        'Email Marketing',
        'Content Marketing (Blog, SEO)',
        'LinkedIn Advertising',
        'YouTube/Video Marketing',
        'Influencer Marketing',
        'Print/Traditional Media',
        'Events/Webinars',
        'Affiliate Marketing'
      ]
    }
  },
  {
    key: 'key_messages',
    prompt: 'What are the key messages or value propositions you want to communicate? What makes your offering unique?',
    validation: {
      required: true,
      type: 'text',
      minLength: 20,
      maxLength: 300
    }
  },
  {
    key: 'success_metrics',
    prompt: 'How will you measure campaign success? What specific metrics matter most to your business?',
    validation: {
      required: true,
      type: 'multiselect',
      options: [
        'Website Traffic',
        'Lead Quality & Quantity',
        'Sales Revenue',
        'Conversion Rate',
        'Cost Per Acquisition (CPA)',
        'Return on Ad Spend (ROAS)',
        'Brand Awareness Metrics',
        'Social Media Engagement',
        'Email Open/Click Rates',
        'Customer Lifetime Value'
      ]
    }
  }
];