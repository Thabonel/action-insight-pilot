
interface AgentResponseInput {
  title?: string;
  focus_summary?: string;
  explanation?: string;
  business_impact?: string;
  recommended_actions?: string[];
  priority_items?: unknown[];
  query?: string;
  next_actions?: string[];
}

interface CampaignDataItem {
  id: string;
  name?: string;
  [key: string]: unknown;
}

interface FormattedAgentResponse {
  type: string;
  title: string;
  explanation: string;
  businessImpact: string;
  nextActions: string[];
  data?: unknown[];
}

export class QueryProcessor {
  static determineQueryType(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('focus') && (lowerQuery.includes('today') || lowerQuery.includes('should'))) {
      return 'daily_focus';
    }

    return 'general';
  }

  static formatAgentResponse(
    agentResponse: AgentResponseInput,
    queryType: string,
    campaignData: CampaignDataItem[]
  ): FormattedAgentResponse {
    if (!agentResponse) {
      throw new Error('AI agent returned no data');
    }
    
    if (queryType === 'daily_focus') {
      return {
        type: 'daily_focus',
        title: agentResponse.title || 'Your Marketing Focus for Today',
        explanation: agentResponse.focus_summary || agentResponse.explanation || 'Based on your current campaigns and performance data, here\'s what deserves your attention today.',
        businessImpact: agentResponse.business_impact || 'Focusing on these priorities could improve your marketing ROI significantly.',
        nextActions: agentResponse.recommended_actions || [
          'Review underperforming campaigns',
          'Optimize high-potential content',
          'Follow up on hot leads'
        ],
        data: agentResponse.priority_items || []
      };
    }
    
    const lowerQuery = agentResponse.query?.toLowerCase() || '';
    let title = 'AI Marketing Insights';
    let explanation = agentResponse.explanation || agentResponse.focus_summary || 'Here are insights based on your marketing data.';
    
    if (lowerQuery.includes('campaign') && lowerQuery.includes('running')) {
      title = `Campaign Status Overview`;
      explanation = `You currently have ${campaignData.length} campaigns in your system. ${agentResponse.explanation || 'All campaigns appear to be configured and ready for optimization.'}`;
    } else if (lowerQuery.includes('best') && lowerQuery.includes('performing')) {
      title = 'Top Performing Campaigns';
      explanation = agentResponse.explanation || `Based on your campaign data, here are the performance insights for your ${campaignData.length} campaigns.`;
    }
    
    return {
      type: 'general',
      title,
      explanation,
      businessImpact: agentResponse.business_impact || 'These insights can help improve your marketing effectiveness.',
      nextActions: agentResponse.recommended_actions || agentResponse.next_actions || ['Review the analysis', 'Take action on priority items']
    };
  }
}
