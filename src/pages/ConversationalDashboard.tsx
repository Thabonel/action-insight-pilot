import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { MessageSquare, Send, Zap, TrendingUp, Users, Mail, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatResponse from '@/components/dashboard/ChatResponse';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import SystemOverviewCards from '@/components/dashboard/SystemOverviewCards';
import AIGreeting from '@/components/dashboard/AIGreeting';
import LearningInsights from '@/components/dashboard/LearningInsights';

const ConversationalDashboard: React.FC = () => {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    query: string;
    response: any;
    timestamp: Date;
  }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [insights, setInsights] = useState(behaviorTracker.getInsights());
  const [conversationContext, setConversationContext] = useState<any[]>([]);

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'conversational_dashboard', { section: 'main' });
    
    const interval = setInterval(() => {
      setInsights(behaviorTracker.getInsights());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const quickSuggestions = [
    "What should I focus on today?",
    "Show me my best performing campaigns",
    "What content should I create next?",
    "How are my leads converting?",
    "Why is my budget running out so fast?",
    "Schedule posts for next week"
  ];

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const actionId = behaviorTracker.trackFeatureStart('conversational_query');
    setIsProcessing(true);

    try {
      // Call real AI agent instead of fake processing
      const response = await processQueryWithAI(query, conversationContext);
      
      const newChat = {
        id: Date.now().toString(),
        query,
        response,
        timestamp: new Date(),
      };

      setChatHistory(prev => [newChat, ...prev]);
      
      // Update conversation context for better continuity
      setConversationContext(prev => [...prev, 
        { role: 'user', content: query },
        { role: 'assistant', content: response }
      ].slice(-10)); // Keep last 10 exchanges
      
      setQuery('');
      behaviorTracker.trackFeatureComplete('conversational_query', actionId, true);
    } catch (error) {
      console.error('Query processing failed:', error);
      behaviorTracker.trackFeatureComplete('conversational_query', actionId, false);
      
      // Show error response
      const errorResponse = {
        type: 'error',
        title: 'AI Assistant Temporarily Unavailable',
        explanation: 'I\'m having trouble processing your request right now. Please try again in a moment.',
        businessImpact: 'Your marketing data is safe and campaigns are still running.',
        nextActions: ['Try rephrasing your question', 'Check back in a few minutes', 'Contact support if issue persists']
      };
      
      const newChat = {
        id: Date.now().toString(),
        query,
        response: errorResponse,
        timestamp: new Date(),
      };
      
      setChatHistory(prev => [newChat, ...prev]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processQueryWithAI = async (userQuery: string, context: any[]) => {
    try {
      // Step 1: Get real campaign data
      const campaignsResponse = await fetch('/api/campaigns');
      const campaignData = await campaignsResponse.json();
      
      // Step 2: Determine the type of request and route to appropriate agent
      const queryType = determineQueryType(userQuery);
      
      // Step 3: Call the appropriate AI agent with real data
      let agentResponse;
      
      switch (queryType) {
        case 'daily_focus':
          agentResponse = await callDailyFocusAgent(userQuery, campaignData, context);
          break;
        case 'campaign_performance':
          agentResponse = await callCampaignAgent('analyze_performance', { 
            campaign_ids: campaignData.map((c: any) => c.id),
            query: userQuery,
            context: context
          });
          break;
        case 'content_suggestions':
          agentResponse = await callContentAgent(userQuery, campaignData, context);
          break;
        case 'lead_analysis':
          agentResponse = await callLeadAgent(userQuery, context);
          break;
        default:
          agentResponse = await callGeneralAgent(userQuery, campaignData, context);
      }
      
      // Step 4: Format response for the ChatResponse component
      return formatAgentResponse(agentResponse, queryType, campaignData);
      
    } catch (error) {
      console.error('AI processing error:', error);
      throw error;
    }
  };

  const determineQueryType = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('focus') && (lowerQuery.includes('today') || lowerQuery.includes('should'))) {
      return 'daily_focus';
    }
    if (lowerQuery.includes('campaign') && (lowerQuery.includes('perform') || lowerQuery.includes('best'))) {
      return 'campaign_performance';
    }
    if (lowerQuery.includes('content') && (lowerQuery.includes('create') || lowerQuery.includes('next'))) {
      return 'content_suggestions';
    }
    if (lowerQuery.includes('lead') && (lowerQuery.includes('convert') || lowerQuery.includes('quality'))) {
      return 'lead_analysis';
    }
    
    return 'general';
  };

  const callDailyFocusAgent = async (query: string, campaigns: any[], context: any[]) => {
    // This is the key improvement - analyze TODAY'S priorities based on real data
    const focusResponse = await fetch('/api/agents/daily-focus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        campaigns,
        context,
        date: new Date().toISOString().split('T')[0] // Today's date
      })
    });
    
    return await focusResponse.json();
  };

  const callCampaignAgent = async (task: string, data: any) => {
    const response = await fetch('/api/agents/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_type: task,
        input_data: data
      })
    });
    
    return await response.json();
  };

  const callContentAgent = async (query: string, campaigns: any[], context: any[]) => {
    const response = await fetch('/api/agents/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        campaigns,
        context
      })
    });
    
    return await response.json();
  };

  const callLeadAgent = async (query: string, context: any[]) => {
    const response = await fetch('/api/agents/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        context
      })
    });
    
    return await response.json();
  };

  const callGeneralAgent = async (query: string, campaigns: any[], context: any[]) => {
    // Use campaign agent as general agent for marketing questions
    const response = await fetch('/api/agents/campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_type: 'general_query',
        input_data: {
          query,
          campaigns,
          context
        }
      })
    });
    
    return await response.json();
  };

  const formatAgentResponse = (agentResponse: any, queryType: string, campaignData: any[]) => {
    // Convert AI agent responses to the format expected by ChatResponse component
    
    if (queryType === 'daily_focus') {
      return {
        type: 'daily_focus',
        title: 'Your Marketing Focus for Today',
        explanation: agentResponse.focus_summary || 'Based on your current campaigns and performance data, here\'s what deserves your attention today.',
        businessImpact: agentResponse.business_impact || 'Focusing on these priorities could improve your marketing ROI significantly.',
        nextActions: agentResponse.recommended_actions || [
          'Review underperforming campaigns',
          'Optimize high-potential content',
          'Follow up on hot leads'
        ],
        data: agentResponse.priority_items || []
      };
    }
    
    if (queryType === 'campaign_performance' && agentResponse.analyses) {
      return {
        type: 'campaigns_performance',
        title: 'Campaign Performance Analysis',
        data: agentResponse.analyses.map((analysis: any) => ({
          name: analysis.campaign_name,
          performance: analysis.performance_score,
          leads: analysis.key_metrics?.total_data_points || 0,
          conversion: `${analysis.key_metrics?.average_performance || 0}%`
        })),
        explanation: agentResponse.analyses[0]?.ai_recommendations?.join(' ') || 'Your campaigns are performing well overall.',
        businessImpact: `Based on current performance, these campaigns are generating significant value.`,
        nextActions: agentResponse.analyses[0]?.ai_recommendations || ['Continue monitoring', 'Optimize underperformers']
      };
    }
    
    // Default formatting for other response types
    return {
      type: 'general',
      title: agentResponse.title || 'AI Marketing Insights',
      explanation: agentResponse.explanation || agentResponse.summary || 'Here are insights based on your marketing data.',
      businessImpact: agentResponse.business_impact || agentResponse.impact || 'These insights can help improve your marketing effectiveness.',
      nextActions: agentResponse.next_actions || agentResponse.recommendations || ['Review the analysis', 'Take action on priority items']
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Greeting */}
        <AIGreeting insights={insights} />

        {/* System Overview Cards */}
        <SystemOverviewCards />

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
              <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-6 w-6" />
                  <CardTitle>AI Marketing Assistant</CardTitle>
                  <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    Online
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Chat History */}
                <div className="h-96 overflow-y-auto mb-6 space-y-4">
                  {chatHistory.length === 0 && !isProcessing && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to optimize your marketing?</h3>
                      <p className="text-slate-600 mb-4">Ask me anything about your campaigns, leads, or performance</p>
                      
                      {/* Quick Suggestions */}
                      <div className="space-y-2">
                        <p className="text-sm text-slate-500">Try asking:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isProcessing && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-slate-600">Analyzing your real campaign data...</span>
                        </div>
                      </div>
                    )}
                  
                  {chatHistory.map((chat) => (
                    <div key={chat.id} className="space-y-4">
                      {/* User Query */}
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-3 max-w-md">
                          {chat.query}
                        </div>
                      </div>
                      
                      {/* AI Response */}
                      <ChatResponse response={chat.response} />
                    </div>
                  ))}
                </div>
                
                {/* Query Input */}
                <form onSubmit={handleQuerySubmit} className="flex space-x-3">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me about your marketing performance..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    disabled={!query.trim() || isProcessing}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActionGrid insights={insights} />
            
            {/* Learning Insights */}
            <LearningInsights insights={insights} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationalDashboard;
