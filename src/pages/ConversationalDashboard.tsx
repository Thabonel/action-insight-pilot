import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { MessageSquare, Send, Zap, TrendingUp, Users, Mail, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  const { toast } = useToast();
  const { user } = useAuth();

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

    // Check authentication
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    const actionId = behaviorTracker.trackFeatureStart('conversational_query');
    setIsProcessing(true);

    try {
      // Call real AI agent
      const response = await processQueryWithRealAI(query, conversationContext);
      
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
      
      toast({
        title: "AI Response Generated",
        description: "Your marketing assistant has analyzed your request.",
      });
    } catch (error) {
      console.error('Query processing failed:', error);
      behaviorTracker.trackFeatureComplete('conversational_query', actionId, false);
      
      // Show error response
      const errorResponse = {
        type: 'error',
        title: 'AI Assistant Temporarily Unavailable',
        explanation: error instanceof Error ? error.message : 'I\'m having trouble processing your request right now. Please try again in a moment.',
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
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processQueryWithRealAI = async (userQuery: string, context: any[]) => {
    try {
      // Step 1: Get real campaign data using direct fetch
      console.log('Fetching campaign data...');
      
      // Get the current session to access the token
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication token not available');
      }

      const directResponse = await fetch('https://wheels-wins-orchestrator.onrender.com/api/campaigns', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!directResponse.ok) {
        throw new Error(`Campaign fetch failed: ${directResponse.status} ${directResponse.statusText}`);
      }
      
      const campaignsResponse = await directResponse.json();
      
      if (!campaignsResponse.success) {
        throw new Error('Failed to fetch campaign data');
      }
      
      // Safely extract campaign data with proper type checking
      const campaignData = Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [];
      
      // Step 2: Determine query type and route to appropriate endpoint
      const queryType = determineQueryType(userQuery);
      
      // Step 3: Call the appropriate AI agent with real data using direct fetch
      let agentResponse;
      
      if (queryType === 'daily_focus') {
        agentResponse = await callDailyFocusAgent(userQuery, campaignData, context, authToken);
      } else {
        agentResponse = await callGeneralCampaignAgent(userQuery, campaignData, context, authToken);
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
    
    return 'general';
  };

  const callDailyFocusAgent = async (query: string, campaigns: any[], context: any[], authToken: string) => {
    const requestData = {
      query,
      campaigns,
      context,
      date: new Date().toISOString().split('T')[0] // Today's date
    };

    const response = await fetch('https://wheels-wins-orchestrator.onrender.com/api/agents/daily-focus', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Daily focus agent failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Daily focus agent failed: ${data.error}`);
    }
    
    return data.data;
  };

  const callGeneralCampaignAgent = async (query: string, campaigns: any[], context: any[], authToken: string) => {
    const requestData = {
      task_type: 'general_query',
      input_data: {
        query,
        campaigns,
        context
      }
    };

    const response = await fetch('https://wheels-wins-orchestrator.onrender.com/api/agents/campaign', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`Campaign agent failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Campaign agent failed: ${data.error}`);
    }
    
    return data.data;
  };

  const formatAgentResponse = (agentResponse: any, queryType: string, campaignData: any[]) => {
    // Handle the response based on your backend format
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
    
    // Default formatting for general queries
    return {
      type: 'general',
      title: agentResponse.title || 'AI Marketing Insights',
      explanation: agentResponse.explanation || agentResponse.focus_summary || 'Here are insights based on your marketing data.',
      businessImpact: agentResponse.business_impact || 'These insights can help improve your marketing effectiveness.',
      nextActions: agentResponse.recommended_actions || agentResponse.next_actions || ['Review the analysis', 'Take action on priority items']
    };
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Greeting - Fixed: pass insights prop */}
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
                    {user ? 'Online' : 'Login Required'}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {/* Authentication Message */}
                {!user && (
                  <div className="text-center py-8 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="w-16 h-16 bg-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-amber-800 mb-2">Authentication Required</h3>
                    <p className="text-amber-700">Please log in to start chatting with your AI marketing assistant</p>
                  </div>
                )}

                {/* Chat History */}
                <div className="h-96 overflow-y-auto mb-6 space-y-4">
                  {chatHistory.length === 0 && !isProcessing && user && (
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
                          <span className="text-sm text-slate-600">Connecting to AI assistant...</span>
                        </div>
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
                    placeholder={user ? "Ask me about your marketing performance..." : "Please log in to chat..."}
                    disabled={!user}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                  />
                  <Button
                    type="submit"
                    disabled={!query.trim() || isProcessing || !user}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions - Fixed: pass insights prop */}
            <QuickActionGrid insights={insights} />
            
            {/* Learning Insights - Keep insights prop */}
            <LearningInsights insights={insights} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationalDashboard;
