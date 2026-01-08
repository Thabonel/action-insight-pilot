import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface ConversationalContext {
  chatHistory?: Array<{ role: string; content: string }>;
  previousQuery?: string;
  isFollowUp?: boolean;
  [key: string]: unknown;
}

export interface ConversationalQuery {
  query: string;
  context?: ConversationalContext;
  sessionId?: string;
}

export interface ConversationalMetadata {
  isCampaignFlow?: boolean;
  hasBasicInfo?: boolean;
  hasKPITargets?: boolean;
  hasBudget?: boolean;
  isMultiChannel?: boolean;
  campaignTypeOptions?: Array<{
    label: string;
    value: string;
    description: string;
  }>;
  [key: string]: unknown;
}

export interface ConversationalResponse {
  response: string;
  suggestions?: string[];
  followUp?: string[];
  metadata?: ConversationalMetadata;
}

export interface CampaignData {
  id: string;
  name: string;
  status?: string;
  [key: string]: unknown;
}

export interface DashboardActivity {
  type: string;
  message: string;
  timestamp: Date;
}

export interface DashboardTrends {
  positive: number;
  negative: number;
  neutral: number;
}

export class ConversationalService {
  static async getAuthToken(): Promise<string> {
    return 'mock-auth-token';
  }

  static async fetchCampaignData(): Promise<CampaignData[]> {
    const result = await apiClient.getCampaigns();
    return (result.data as CampaignData[]) || [];
  }

  static async callDailyFocusAgent(userQuery: string): Promise<ApiResponse<{ response: string }>> {
    return {
      success: true,
      data: { response: `Daily focus response to: ${userQuery}` }
    };
  }

  static async callGeneralCampaignAgent(userQuery: string): Promise<ApiResponse<{ response: string }>> {
    return {
      success: true,
      data: { response: `Campaign agent response to: ${userQuery}` }
    };
  }

  async processQuery(queryData: ConversationalQuery): Promise<ApiResponse<ConversationalResponse>> {
    try {
      const result = await apiClient.queryAgent(queryData.query, queryData.context);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: {
            response: result.data.message,
            suggestions: [
              'Tell me more about this',
              'Show me related metrics',
              'What are the next steps?'
            ],
            followUp: [
              'Would you like to see detailed analytics?',
              'Should I create a report for this?'
            ]
          }
        };
      }
      
      return result as ApiResponse<ConversationalResponse>;
    } catch (error) {
      console.error('Error processing conversational query:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process query'
      };
    }
  }

  async generateSuggestions(_context: ConversationalContext): Promise<string[]> {
    return [
      'How can I improve my campaign performance?',
      'What are my best performing content pieces?',
      'Show me lead conversion trends',
      'Help me optimize my email campaigns'
    ];
  }

  async processFollowUp(previousQuery: string, followUpQuery: string): Promise<ApiResponse<ConversationalResponse>> {
    const context = {
      previousQuery,
      isFollowUp: true
    };
    
    return this.processQuery({
      query: followUpQuery,
      context
    });
  }

  async getDashboardInsights(): Promise<ApiResponse<{
    totalActions: number;
    recentActivities: DashboardActivity[];
    suggestions: string[];
    trends: DashboardTrends;
  }>> {
    return {
      success: true,
      data: {
        totalActions: 25,
        recentActivities: [
          { type: 'campaign', message: 'New campaign created', timestamp: new Date() },
          { type: 'lead', message: 'Lead scored', timestamp: new Date() }
        ],
        suggestions: [
          'Review campaign performance',
          'Optimize email subject lines',
          'Update lead scoring criteria'
        ],
        trends: { positive: 60, negative: 20, neutral: 20 }
      }
    };
  }

  async generateResponse(query: string, context?: ConversationalContext): Promise<ApiResponse<ConversationalResponse>> {
    // Enhanced response generation with KPI target questions
    const response = await this.generateCampaignResponse(query, context);
    return response;
  }

  async generateCampaignResponse(query: string, context?: ConversationalContext): Promise<ApiResponse<ConversationalResponse>> {
    const lowerQuery = query.toLowerCase();
    
    // Check if this is campaign creation flow
    const isCampaignFlow = lowerQuery.includes('campaign') || lowerQuery.includes('marketing') || 
                          lowerQuery.includes('promotion') || lowerQuery.includes('launch');
    
    if (isCampaignFlow) {
      return this.handleCampaignFlow(query, context);
    }
    
    return this.processQuery({ query, context });
  }

  async handleCampaignFlow(query: string, context?: ConversationalContext): Promise<ApiResponse<ConversationalResponse>> {
    const lowerQuery = query.toLowerCase();
    const chatHistory = context?.chatHistory || [];

    // Determine what information we have and what we need
    const hasBasicInfo = this.hasBasicCampaignInfo(chatHistory);
    const hasKPITargets = this.hasKPITargets(chatHistory);
    const hasBudget = this.hasBudgetInfo(chatHistory);
    const isMultiChannel = this.detectMultiChannel(chatHistory);
    
    let response = '';
    let suggestions: string[] = [];
    
    if (!hasBasicInfo) {
      // Ask for basic campaign information with structured options
      response = `Hello! I'm excited to help you create an amazing marketing campaign!

Let's start by understanding what you're looking to achieve. What type of campaign would you like to create?

**Popular options:**
**Email Marketing** - Nurture leads and drive conversions
**Social Media** - Build awareness and engagement  
**Product Launch** - Generate buzz for new offerings
**Lead Generation** - Capture and qualify prospects
**Content Marketing** - Establish thought leadership
**Multi-Channel** - Combine multiple channels for maximum impact

What's your main goal with this campaign? (e.g., "increase sales," "build brand awareness," "generate leads")`;
      
      suggestions = [
        "Email campaign to increase customer retention",
        "Social media campaign for brand awareness", 
        "Multi-channel product launch campaign",
        "Lead generation campaign for B2B prospects",
        "Content campaign to establish thought leadership"
      ];
    } else if (!hasBudget) {
      // Ask for budget information with multi-channel considerations
      if (isMultiChannel) {
        response = `Great! I see you're planning a multi-channel campaign. This is excellent for maximizing reach and impact.

For multi-channel campaigns, budget allocation is crucial. What's your total budget, and do you have preferences for how to split it across channels?

For example:
- "$10,000 total - 60% for social ads, 40% for email marketing"
- "$5,000 budget split equally between channels"
- "I need help determining the optimal budget allocation"`;
        
        suggestions = [
          "$10,000 total, 60% social media, 40% email",
          "$5,000 split equally between channels",
          "I need help with budget allocation",
          "$15,000 for comprehensive multi-channel approach"
        ];
      } else {
        response = `Great! Now let's talk about budget. Having a clear budget helps me recommend the best strategies and tactics for your campaign.

What budget range are you working with for this campaign? Please include:
- Total campaign budget
- Preferred budget allocation (if you have preferences)

For example: "$5,000 total budget" or "$10,000 with $7,000 for ads and $3,000 for creative"`;
        
        suggestions = [
          "$5,000 total budget",
          "$10,000 budget, mostly for advertising",
          "$2,000 for a small campaign",
          "I need help determining budget"
        ];
      }
    } else if (!hasKPITargets) {
      // Ask for KPI targets with multi-channel considerations
      if (isMultiChannel) {
        response = `Perfect! For your multi-channel campaign, let's set specific KPI targets for each channel to measure success effectively.

What are your key performance targets? Please specify goals for:

**Overall Campaign Goals:**
- Total leads or conversions you want to achieve
- Timeline for these results

**Channel-Specific Targets:**
- Email: Open rates, click rates, conversions
- Social Media: Engagement rates, reach, follower growth  
- Paid Ads: CTR, CPA, ROAS

**Measurement Period:**
- Monthly, quarterly, or campaign duration targets

For example: "Generate 200 total leads in 3 months - 120 from email (25% open rate) and 80 from social media (5% engagement rate)"`;
        
        suggestions = [
          "200 total leads: 120 from email, 80 from social",
          "5% engagement on social, 25% email open rate",
          "100 conversions per month across all channels",
          "$50 CPA for paid ads, 3% email conversion rate"
        ];
      } else {
        response = `Excellent! Now let's set some specific KPI targets to measure your campaign's success. This will help us track performance and optimize as we go.

What are your key performance targets? Please let me know your goals for:

**Lead Generation Goals:**
- How many new leads do you want to generate?
- Target conversion rate (if known)?

**Engagement Targets:**
- Expected engagement rate (for social campaigns)?
- Email open/click rates (for email campaigns)?

**Timeline:**
- What's your measurement period? (e.g., monthly, quarterly)
- When do you want to achieve these targets?

For example: "Generate 100 qualified leads per month with a 3% conversion rate" or "Achieve 5% email open rate and 25% click rate"`;
        
        suggestions = [
          "Generate 100 leads per month",
          "Achieve 5% engagement rate on social media",
          "Get 25% email open rate and 3% click rate",
          "I need 50 conversions with 2% conversion rate"
        ];
      }
    } else {
      // All information gathered, ready to create campaign
      if (isMultiChannel) {
        response = `Excellent! I have all the information needed for your multi-channel campaign:

Campaign strategy across multiple channels
Budget allocation for each channel
Channel-specific KPI targets and measurement

I'll create a comprehensive multi-channel campaign that includes:
- **Linked campaigns** for each channel with shared messaging
- **Budget distribution** optimized for your goals
- **Unified tracking** across all channels
- **Cross-channel optimization** opportunities
- **Coordinated launch timeline** for maximum impact

This approach will maximize your reach while maintaining consistent messaging across all touchpoints. Ready to create your multi-channel campaign?`;
      } else {
        response = `Perfect! I have all the information I need to create your campaign:

Campaign type and objectives
Budget allocation  
KPI targets and measurement goals

Based on our conversation, I'll create a comprehensive campaign plan with:
- Detailed strategy aligned with your KPI targets
- Budget breakdown optimized for your goals
- Measurement framework to track the KPIs you specified
- Timeline for achieving your target metrics

Ready to create the campaign? I'll generate a complete campaign plan that includes tracking for all your specified KPI targets.`;
      }
      
      suggestions = [
        "Yes, create the campaign",
        "Let me review the details first",
        "Can we adjust the KPI targets?",
        "Show me the campaign preview"
      ];
    }
    
    return {
      success: true,
      data: {
        response,
        suggestions,
        followUp: [
          'Would you like to see examples of similar campaigns?',
          'Do you need help setting realistic KPI targets?'
        ],
        metadata: {
          isCampaignFlow: true,
          hasBasicInfo,
          hasKPITargets,
          hasBudget,
          isMultiChannel,
          campaignTypeOptions: !hasBasicInfo ? [
            { label: "Email Marketing", value: "email", description: "Nurture leads and drive conversions" },
            { label: "Social Media", value: "social", description: "Build awareness and engagement" },
            { label: "Product Launch", value: "product_launch", description: "Generate buzz for new offerings" },
            { label: "Lead Generation", value: "lead_generation", description: "Capture and qualify prospects" },
            { label: "Content Marketing", value: "content", description: "Establish thought leadership" },
            { label: "Multi-Channel", value: "multi_channel", description: "Combine multiple channels for maximum impact" }
          ] : undefined
        }
      }
    };
  }

  private detectMultiChannel(chatHistory: Array<{ role: string; content: string }>): boolean {
    const text = chatHistory.map(msg => msg.content).join(' ').toLowerCase();
    return text.includes('multi-channel') ||
           text.includes('multiple channels') ||
           text.includes('cross-channel') ||
           (text.includes('email') && text.includes('social')) ||
           (text.includes('paid') && text.includes('organic')) ||
           (text.split('campaign').length > 2); // Multiple mentions of different campaign types
  }

  private hasBasicCampaignInfo(chatHistory: Array<{ role: string; content: string }>): boolean {
    const text = chatHistory.map(msg => msg.content).join(' ').toLowerCase();
    return text.includes('campaign') && (
      text.includes('email') || text.includes('social') || text.includes('launch') ||
      text.includes('marketing') || text.includes('promotion') || text.includes('brand')
    );
  }

  private hasKPITargets(chatHistory: Array<{ role: string; content: string }>): boolean {
    const text = chatHistory.map(msg => msg.content).join(' ').toLowerCase();
    return text.includes('leads') || text.includes('conversion') || text.includes('engagement') ||
           text.includes('open rate') || text.includes('click rate') || text.includes('kpi') ||
           /\d+\s*(leads?|conversions?|%|percent)/.test(text);
  }

  private hasBudgetInfo(chatHistory: Array<{ role: string; content: string }>): boolean {
    const text = chatHistory.map(msg => msg.content).join(' ').toLowerCase();
    return text.includes('budget') || text.includes('spend') || /\$\d+/.test(text);
  }
}

export const conversationalService = new ConversationalService();
