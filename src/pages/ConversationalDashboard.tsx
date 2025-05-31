
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

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'conversational_dashboard', { section: 'main' });
    
    const interval = setInterval(() => {
      setInsights(behaviorTracker.getInsights());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const quickSuggestions = [
    "Show me my best performing campaigns",
    "What content should I create next?",
    "How are my leads converting?",
    "Schedule posts for next week",
    "Why is my budget running out so fast?"
  ];

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const actionId = behaviorTracker.trackFeatureStart('conversational_query');
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const response = processQuery(query);
      
      const newChat = {
        id: Date.now().toString(),
        query,
        response,
        timestamp: new Date(),
      };

      setChatHistory(prev => [newChat, ...prev]);
      setQuery('');
      setIsProcessing(false);
      behaviorTracker.trackFeatureComplete('conversational_query', actionId, true);
    }, 2000);
  };

  const processQuery = (userQuery: string) => {
    const lowerQuery = userQuery.toLowerCase();
    
    if (lowerQuery.includes('campaign') && lowerQuery.includes('performing')) {
      return {
        type: 'campaigns_performance',
        title: 'Your Best Performing Campaigns',
        data: [
          { name: 'Email Series A', performance: 85, leads: 142, conversion: '12.4%' },
          { name: 'Social Campaign B', performance: 78, leads: 89, conversion: '8.9%' },
          { name: 'Content Push C', performance: 72, leads: 156, conversion: '7.2%' }
        ],
        explanation: "Your Email Series A is crushing it with 85% performance score and 12.4% conversion rate.",
        businessImpact: "This campaign is generating $15,400 in monthly recurring revenue.",
        nextActions: ["Scale Email Series A budget by 50%", "Create similar email sequences", "A/B test subject lines"]
      };
    }
    
    if (lowerQuery.includes('content') && lowerQuery.includes('create')) {
      return {
        type: 'content_suggestions',
        title: 'AI Content Recommendations',
        suggestions: [
          { type: 'Blog Post', topic: '5 Marketing Automation Trends', confidence: 94 },
          { type: 'Video', topic: 'Customer Success Story', confidence: 87 },
          { type: 'Infographic', topic: 'Lead Generation Stats', confidence: 82 }
        ],
        explanation: "Based on your audience engagement, blog posts about automation trends perform 40% better.",
        businessImpact: "Content like this typically generates 200+ qualified leads per month.",
        nextActions: ["Start with the blog post", "Interview successful customers", "Design infographic template"]
      };
    }

    if (lowerQuery.includes('leads') && lowerQuery.includes('convert')) {
      return {
        type: 'lead_conversion',
        title: 'Lead Conversion Analysis',
        data: [
          { source: 'Organic Search', leads: 245, converted: 31, rate: 12.7 },
          { source: 'Social Media', leads: 189, converted: 18, rate: 9.5 },
          { source: 'Email Campaign', leads: 156, converted: 22, rate: 14.1 },
          { source: 'Paid Ads', leads: 98, converted: 8, rate: 8.2 }
        ],
        explanation: "Email campaigns have your highest conversion rate at 14.1%, while paid ads need optimization.",
        businessImpact: "Improving paid ad conversion by 3% could add $8,200 monthly revenue.",
        nextActions: ["Optimize paid ad landing pages", "Increase email campaign frequency", "Create retargeting campaigns"]
      };
    }

    // Default response
    return {
      type: 'general',
      title: 'AI Assistant Response',
      explanation: "I understand you're asking about your marketing performance. Let me analyze your data and provide insights.",
      businessImpact: "Continuous optimization of your marketing stack can improve ROI by 25-40%.",
      nextActions: ["Review campaign performance", "Analyze lead quality", "Optimize conversion funnels"]
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
                          <span className="text-sm text-slate-600">Analyzing your data...</span>
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
