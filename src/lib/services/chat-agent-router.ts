
import { apiClient } from '@/lib/api-client';

export interface AgentRouteResult {
  agentType: string;
  confidence: number;
  context: Record<string, any>;
}

export class ChatAgentRouter {
  private static agentPatterns = {
    campaign: [
      /campaign/i, /marketing campaign/i, /create campaign/i, /campaign performance/i,
      /campaign analytics/i, /campaign optimization/i, /budget/i, /roi/i
    ],
    content: [
      /content/i, /blog/i, /article/i, /write/i, /generate content/i,
      /social post/i, /copy/i, /headline/i, /seo/i
    ],
    email: [
      /email/i, /newsletter/i, /email campaign/i, /email automation/i,
      /email template/i, /subject line/i, /email marketing/i
    ],
    leads: [
      /lead/i, /prospect/i, /lead generation/i, /lead scoring/i,
      /lead nurturing/i, /conversion/i, /sales funnel/i
    ],
    social: [
      /social/i, /facebook/i, /twitter/i, /instagram/i, /linkedin/i,
      /social media/i, /post scheduling/i, /engagement/i
    ],
    analytics: [
      /analytics/i, /metrics/i, /performance/i, /report/i, /dashboard/i,
      /insights/i, /kpi/i, /data/i, /statistics/i
    ],
    proposal: [
      /proposal/i, /quote/i, /estimate/i, /contract/i, /pricing/i,
      /proposal template/i, /client proposal/i
    ]
  };

  static analyzeQuery(query: string): AgentRouteResult {
    const lowerQuery = query.toLowerCase();
    const scores = new Map<string, number>();

    // Calculate pattern match scores
    for (const [agentType, patterns] of Object.entries(this.agentPatterns)) {
      let score = 0;
      for (const pattern of patterns) {
        if (pattern.test(lowerQuery)) {
          score += 1;
        }
      }
      if (score > 0) {
        scores.set(agentType, score);
      }
    }

    // Find the highest scoring agent
    let bestAgent = 'general';
    let bestScore = 0;
    for (const [agent, score] of scores.entries()) {
      if (score > bestScore) {
        bestAgent = agent;
        bestScore = score;
      }
    }

    return {
      agentType: bestAgent,
      confidence: bestScore > 0 ? Math.min(bestScore * 0.3, 1) : 0.1,
      context: { matchedPatterns: bestScore }
    };
  }

  static async routeQuery(query: string, userId?: string): Promise<any> {
    const routeResult = this.analyzeQuery(query);
    
    try {
      switch (routeResult.agentType) {
        case 'campaign':
          return await this.handleCampaignQuery(query);
        case 'content':
          return await this.handleContentQuery(query);
        case 'email':
          return await this.handleEmailQuery(query);
        case 'leads':
          return await this.handleLeadsQuery(query);
        case 'social':
          return await this.handleSocialQuery(query);
        case 'analytics':
          return await this.handleAnalyticsQuery(query);
        case 'proposal':
          return await this.handleProposalQuery(query);
        default:
          return await this.handleGeneralQuery(query, userId);
      }
    } catch (error) {
      console.error('Error routing query:', error);
      return {
        type: 'error',
        content: 'I encountered an error processing your request. Please try again.',
        agentType: routeResult.agentType
      };
    }
  }

  private static async handleCampaignQuery(query: string) {
    if (query.toLowerCase().includes('create') || query.toLowerCase().includes('new')) {
      return {
        type: 'campaign_action',
        content: 'I can help you create a new marketing campaign. What type of campaign would you like to create?',
        actions: [
          { label: 'Create Email Campaign', action: 'create_email_campaign' },
          { label: 'Create Social Campaign', action: 'create_social_campaign' },
          { label: 'Create Content Campaign', action: 'create_content_campaign' }
        ],
        agentType: 'campaign'
      };
    }

    try {
      const campaigns = await apiClient.getCampaigns();
      return {
        type: 'campaign_data',
        content: `You have ${campaigns.data?.length || 0} campaigns. Here's what I can help you with:`,
        data: campaigns.data,
        agentType: 'campaign'
      };
    } catch (error) {
      return {
        type: 'campaign_info',
        content: 'I can help you with campaign management, creation, and optimization. What would you like to do?',
        agentType: 'campaign'
      };
    }
  }

  private static async handleContentQuery(query: string) {
    return {
      type: 'content_assistance',
      content: 'I can help you create and optimize content. What type of content would you like to work on?',
      actions: [
        { label: 'Generate Blog Post', action: 'generate_blog' },
        { label: 'Create Social Content', action: 'generate_social' },
        { label: 'Write Email Copy', action: 'generate_email' }
      ],
      agentType: 'content'
    };
  }

  private static async handleEmailQuery(query: string) {
    try {
      const analytics = await apiClient.getEmailAnalytics();
      return {
        type: 'email_data',
        content: 'Here\'s your email marketing overview:',
        data: analytics.data,
        agentType: 'email'
      };
    } catch (error) {
      return {
        type: 'email_assistance',
        content: 'I can help you with email campaigns, automation, and analytics. What would you like to do?',
        agentType: 'email'
      };
    }
  }

  private static async handleLeadsQuery(query: string) {
    try {
      const leads = await apiClient.getLeads();
      return {
        type: 'leads_data',
        content: `You have ${leads.data?.length || 0} leads in your pipeline.`,
        data: leads.data,
        agentType: 'leads'
      };
    } catch (error) {
      return {
        type: 'leads_assistance',
        content: 'I can help you with lead generation, scoring, and nurturing. What would you like to know?',
        agentType: 'leads'
      };
    }
  }

  private static async handleSocialQuery(query: string) {
    try {
      const analytics = await apiClient.getSocialAnalytics();
      return {
        type: 'social_data',
        content: 'Here\'s your social media performance:',
        data: analytics.data,
        agentType: 'social'
      };
    } catch (error) {
      return {
        type: 'social_assistance',
        content: 'I can help you with social media management, scheduling, and analytics. What would you like to do?',
        agentType: 'social'
      };
    }
  }

  private static async handleAnalyticsQuery(query: string) {
    return {
      type: 'analytics_overview',
      content: 'I can provide insights on your marketing performance. What metrics would you like to explore?',
      actions: [
        { label: 'Campaign Performance', action: 'show_campaign_analytics' },
        { label: 'Lead Analytics', action: 'show_lead_analytics' },
        { label: 'Social Analytics', action: 'show_social_analytics' }
      ],
      agentType: 'analytics'
    };
  }

  private static async handleProposalQuery(query: string) {
    try {
      const proposals = await apiClient.getProposals();
      return {
        type: 'proposal_data',
        content: `You have ${proposals.data?.length || 0} proposals.`,
        data: proposals.data,
        agentType: 'proposal'
      };
    } catch (error) {
      return {
        type: 'proposal_assistance',
        content: 'I can help you create and manage proposals. Would you like to create a new proposal?',
        agentType: 'proposal'
      };
    }
  }

  private static async handleGeneralQuery(query: string, userId?: string) {
    return {
      type: 'general_assistance',
      content: 'I\'m here to help with your marketing automation. I can assist with campaigns, content creation, email marketing, lead management, social media, analytics, and proposals. What would you like to work on?',
      agentType: 'general'
    };
  }
}
