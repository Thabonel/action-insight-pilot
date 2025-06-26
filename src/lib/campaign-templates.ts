export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  category: 'product-launch' | 'seasonal' | 'lead-generation' | 'brand-awareness' | 'retention';
  keywords: string[];
  template: {
    type: string;
    channel: string;
    target_audience: string;
    primary_objective: string;
    duration_days: number;
    budget_range: {
      min: number;
      max: number;
    };
    content: {
      messaging_theme: string;
      key_points: string[];
      cta: string;
    };
    kpi_targets: Record<string, number>;
    settings: {
      frequency: string;
      optimization_goal: string;
    };
  };
}

export const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'product-launch-social',
    name: 'Product Launch - Social Media',
    description: 'Comprehensive social media campaign for new product launches',
    category: 'product-launch',
    keywords: ['product launch', 'new product', 'launch', 'introduce', 'unveil', 'debut'],
    template: {
      type: 'social_media',
      channel: 'social',
      target_audience: 'Existing customers and prospects interested in [product category]',
      primary_objective: 'Drive awareness and early adoption of new product',
      duration_days: 45,
      budget_range: {
        min: 5000,
        max: 25000
      },
      content: {
        messaging_theme: 'Innovation and excitement around new product features',
        key_points: [
          'Highlight unique product features and benefits',
          'Share behind-the-scenes development story',
          'Customer testimonials and early reviews',
          'Limited-time launch offers or incentives'
        ],
        cta: 'Learn More & Pre-Order'
      },
      kpi_targets: {
        impressions: 500000,
        engagement_rate: 4.5,
        clicks: 15000,
        conversions: 500
      },
      settings: {
        frequency: 'daily',
        optimization_goal: 'conversions'
      }
    }
  },
  {
    id: 'seasonal-holiday',
    name: 'Holiday Seasonal Promotion',
    description: 'Drive sales during key holiday periods with targeted promotions',
    category: 'seasonal',
    keywords: ['holiday', 'seasonal', 'christmas', 'thanksgiving', 'black friday', 'cyber monday', 'valentine', 'mother\'s day'],
    template: {
      type: 'promotional',
      channel: 'multi_channel',
      target_audience: 'Holiday shoppers and gift buyers',
      primary_objective: 'Maximize sales during seasonal peak',
      duration_days: 21,
      budget_range: {
        min: 3000,
        max: 15000
      },
      content: {
        messaging_theme: 'Holiday spirit and urgency-driven promotional messaging',
        key_points: [
          'Limited-time holiday discounts and offers',
          'Gift guides and product recommendations',
          'Free shipping and special holiday services',
          'Countdown timers and scarcity messaging'
        ],
        cta: 'Shop Holiday Sale'
      },
      kpi_targets: {
        impressions: 300000,
        click_through_rate: 3.2,
        conversion_rate: 2.8,
        revenue: 50000
      },
      settings: {
        frequency: 'high_frequency',
        optimization_goal: 'revenue'
      }
    }
  },
  {
    id: 'lead-generation-b2b',
    name: 'B2B Lead Generation',
    description: 'Generate qualified leads for B2B sales pipeline',
    category: 'lead-generation',
    keywords: ['lead generation', 'b2b', 'leads', 'prospects', 'sales', 'qualified leads', 'business'],
    template: {
      type: 'lead_generation',
      channel: 'digital',
      target_audience: 'Business decision makers in [target industry]',
      primary_objective: 'Generate qualified leads for sales team',
      duration_days: 60,
      budget_range: {
        min: 8000,
        max: 20000
      },
      content: {
        messaging_theme: 'Value proposition and thought leadership',
        key_points: [
          'Industry insights and thought leadership content',
          'Case studies and success stories',
          'Free resources like whitepapers or webinars',
          'Solution-focused messaging addressing pain points'
        ],
        cta: 'Download Free Guide'
      },
      kpi_targets: {
        impressions: 200000,
        lead_conversion_rate: 3.5,
        cost_per_lead: 40,
        qualified_leads: 200
      },
      settings: {
        frequency: 'moderate',
        optimization_goal: 'lead_generation'
      }
    }
  },
  {
    id: 'brand-awareness-video',
    name: 'Brand Awareness - Video Campaign',
    description: 'Build brand recognition through engaging video content',
    category: 'brand-awareness',
    keywords: ['brand awareness', 'video', 'brand recognition', 'storytelling', 'awareness', 'brand building'],
    template: {
      type: 'brand_awareness',
      channel: 'video',
      target_audience: 'Broad audience aligned with brand values',
      primary_objective: 'Increase brand awareness and consideration',
      duration_days: 30,
      budget_range: {
        min: 10000,
        max: 30000
      },
      content: {
        messaging_theme: 'Brand story and values-driven content',
        key_points: [
          'Authentic brand storytelling',
          'Values and mission alignment',
          'Customer success stories',
          'Behind-the-scenes brand content'
        ],
        cta: 'Learn Our Story'
      },
      kpi_targets: {
        video_views: 1000000,
        brand_awareness_lift: 15,
        video_completion_rate: 65,
        social_shares: 5000
      },
      settings: {
        frequency: 'consistent',
        optimization_goal: 'video_views'
      }
    }
  },
  {
    id: 'customer-retention-email',
    name: 'Customer Retention - Email Series',
    description: 'Re-engage existing customers and reduce churn',
    category: 'retention',
    keywords: ['retention', 'customer retention', 'loyalty', 'churn', 're-engage', 'existing customers'],
    template: {
      type: 'retention',
      channel: 'email',
      target_audience: 'Existing customers showing signs of disengagement',
      primary_objective: 'Reduce churn and increase customer lifetime value',
      duration_days: 90,
      budget_range: {
        min: 2000,
        max: 8000
      },
      content: {
        messaging_theme: 'Personalized value and appreciation',
        key_points: [
          'Personalized product recommendations',
          'Exclusive offers for loyal customers',
          'Usage tips and best practices',
          'Customer success milestones and celebrations'
        ],
        cta: 'Redeem Exclusive Offer'
      },
      kpi_targets: {
        email_open_rate: 25,
        click_through_rate: 8,
        retention_rate: 85,
        repeat_purchase_rate: 30
      },
      settings: {
        frequency: 'weekly',
        optimization_goal: 'retention'
      }
    }
  }
];

export function findRelevantTemplates(userInput: string, limit: number = 3): CampaignTemplate[] {
  const input = userInput.toLowerCase();
  const scored = campaignTemplates.map(template => {
    let score = 0;
    
    // Check for exact keyword matches
    template.keywords.forEach(keyword => {
      if (input.includes(keyword.toLowerCase())) {
        score += 10;
      }
    });
    
    // Check for category-related terms
    const categoryTerms = {
      'product-launch': ['product', 'launch', 'new', 'introduce'],
      'seasonal': ['holiday', 'season', 'promotion', 'sale'],
      'lead-generation': ['lead', 'prospect', 'sales', 'generate'],
      'brand-awareness': ['brand', 'awareness', 'recognition'],
      'retention': ['retention', 'loyalty', 'existing', 'customer']
    };
    
    const terms = categoryTerms[template.category] || [];
    terms.forEach(term => {
      if (input.includes(term)) {
        score += 5;
      }
    });
    
    return { template, score };
  });
  
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.template);
}

export function applyCampaignTemplate(template: CampaignTemplate, userContext: any = {}) {
  return {
    name: userContext.name || `${template.name} Campaign`,
    type: template.template.type,
    channel: template.template.channel,
    description: userContext.description || template.description,
    target_audience: userContext.target_audience || template.template.target_audience,
    primary_objective: template.template.primary_objective,
    start_date: new Date(),
    end_date: new Date(Date.now() + template.template.duration_days * 24 * 60 * 60 * 1000),
    total_budget: userContext.budget || template.template.budget_range.min,
    content: {
      ...template.template.content,
      ...userContext.content
    },
    kpi_targets: template.template.kpi_targets,
    settings: template.template.settings,
    status: 'draft' as const
  };
}