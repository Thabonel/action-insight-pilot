import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export interface ConversationalQuery {
  query: string;
  context?: any;
  sessionId?: string;
}

export interface ConversationalResponse {
  response: string;
  suggestions?: string[];
  followUp?: string[];
  metadata?: any;
}

export class ConversationalService {
  static async getAuthToken(): Promise<string> {
    return 'mock-auth-token';
  }

  static async fetchCampaignData(): Promise<any[]> {
    const result = await apiClient.getCampaigns();
    return result.data || [];
  }

  static async callDailyFocusAgent(userQuery: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { response: `Daily focus response to: ${userQuery}` }
    };
  }

  static async callGeneralCampaignAgent(userQuery: string): Promise<ApiResponse<any>> {
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

  async generateSuggestions(context: any): Promise<string[]> {
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

  async getDashboardInsights(): Promise<ApiResponse<any>> {
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

  async generateResponse(query: string, context?: any): Promise<ApiResponse<ConversationalResponse>> {
    // Enhanced response generation with KPI target questions
    const response = await this.generateCampaignResponse(query, context);
    return response;
  }

  async generateCampaignResponse(query: string, context?: any): Promise<ApiResponse<ConversationalResponse>> {
    const lowerQuery = query.toLowerCase();
    
    // Check if this is campaign creation flow
    const isCampaignFlow = lowerQuery.includes('campaign') || lowerQuery.includes('marketing') || 
                          lowerQuery.includes('promotion') || lowerQuery.includes('launch');
    
    if (isCampaignFlow) {
      return this.handleCampaignFlow(query, context);
    }
    
    return this.processQuery({ query, context });
  }

  async handleCampaignFlow(query: string, context?: any): Promise<ApiResponse<ConversationalResponse>> {
    const lowerQuery = query.toLowerCase();
    const chatHistory = context?.chatHistory || [];
    
    // Determine what information we have and what we need
    const hasBasicInfo = this.hasBasicCampaignInfo(chatHistory);
    const hasKPITargets = this.hasKPITargets(chatHistory);
    const hasBudget = this.hasBudgetInfo(chatHistory);
    
    let response = '';
    let suggestions: string[] = [];
    
    if (!hasBasicInfo) {
      // Ask for basic campaign information
      response = `I'd be happy to help you create a marketing campaign! Let me gather some key information first.

What type of campaign are you looking to create? For example:
- Email marketing campaign
- Social media campaign  
- Product launch campaign
- Lead generation campaign
- Content marketing campaign

Also, what's your primary goal for this campaign?`;
      
      suggestions = [
        "I want to create an email campaign",
        "Social media campaign for brand awareness",
        "Product launch campaign",
        "Lead generation campaign"
      ];
    } else if (!hasBudget) {
      // Ask for budget information
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
    } else if (!hasKPITargets) {
      // Ask for KPI targets - this is the new part!
      response = `Excellent! Now let's set some specific KPI targets to measure your campaign's success. This will help us track performance and optimize as we go.

What are your key performance targets? Please let me know your goals for:

📈 **Lead Generation Goals:**
- How many new leads do you want to generate?
- Target conversion rate (if known)?

📊 **Engagement Targets:**
- Expected engagement rate (for social campaigns)?
- Email open/click rates (for email campaigns)?

⏱️ **Timeline:**
- What's your measurement period? (e.g., monthly, quarterly)
- When do you want to achieve these targets?

For example: "Generate 100 qualified leads per month with a 3% conversion rate" or "Achieve 5% email open rate and 25% click rate"`;
      
      suggestions = [
        "Generate 100 leads per month",
        "Achieve 5% engagement rate on social media",
        "Get 25% email open rate and 3% click rate",
        "I need 50 conversions with 2% conversion rate"
      ];
    } else {
      // All information gathered, ready to create campaign
      response = `Perfect! I have all the information I need to create your campaign:

✅ Campaign type and objectives
✅ Budget allocation  
✅ KPI targets and measurement goals

Based on our conversation, I'll create a comprehensive campaign plan with:
- Detailed strategy aligned with your KPI targets
- Budget breakdown optimized for your goals
- Measurement framework to track the KPIs you specified
- Timeline for achieving your target metrics

Ready to create the campaign? I'll generate a complete campaign plan that includes tracking for all your specified KPI targets.`;
      
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
          hasBudget
        }
      }
    };
  }

  private hasBasicCampaignInfo(chatHistory: any[]): boolean {
    const text = chatHistory.map((msg: any) => msg.content).join(' ').toLowerCase();
    return text.includes('campaign') && (
      text.includes('email') || text.includes('social') || text.includes('launch') ||
      text.includes('marketing') || text.includes('promotion') || text.includes('brand')
    );
  }

  private hasKPITargets(chatHistory: any[]): boolean {
    const text = chatHistory.map((msg: any) => msg.content).join(' ').toLowerCase();
    return text.includes('leads') || text.includes('conversion') || text.includes('engagement') ||
           text.includes('open rate') || text.includes('click rate') || text.includes('kpi') ||
           /\d+\s*(leads?|conversions?|%|percent)/.test(text);
  }

  private hasBudgetInfo(chatHistory: any[]): boolean {
    const text = chatHistory.map((msg: any) => msg.content).join(' ').toLowerCase();
    return text.includes('budget') || text.includes('spend') || /\$\d+/.test(text);
  }
}

export const conversationalService = new ConversationalService();
