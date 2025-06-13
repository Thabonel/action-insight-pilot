import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MessageSquare, Calendar, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState(behaviorTracker.getInsights());
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    message: string;
    response: string;
    timestamp: Date;
  }>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data for charts
  const performanceData = [
    { name: 'Mon', campaigns: 4, leads: 24, emails: 12 },
    { name: 'Tue', campaigns: 3, leads: 18, emails: 15 },
    { name: 'Wed', campaigns: 6, leads: 32, emails: 20 },
    { name: 'Thu', campaigns: 8, leads: 45, emails: 18 },
    { name: 'Fri', campaigns: 5, leads: 28, emails: 22 },
    { name: 'Sat', campaigns: 2, leads: 15, emails: 8 },
    { name: 'Sun', campaigns: 1, leads: 12, emails: 5 },
  ];

  const activityData = [
    { feature: 'Campaigns', usage: insights.topFeatures.filter(f => f === 'campaigns').length * 10 || 5 },
    { feature: 'Content', usage: insights.topFeatures.filter(f => f === 'content').length * 10 || 8 },
    { feature: 'Social', usage: insights.topFeatures.filter(f => f === 'social').length * 10 || 12 },
    { feature: 'Email', usage: insights.topFeatures.filter(f => f === 'email').length * 10 || 15 },
    { feature: 'Analytics', usage: insights.topFeatures.filter(f => f === 'analytics').length * 10 || 6 },
  ];

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'dashboard', { section: 'main' });
    
    // Update insights every 30 seconds
    const interval = setInterval(() => {
      setInsights(behaviorTracker.getInsights());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // Check authentication
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI assistant.",
        variant: "destructive",
      });
      return;
    }

    const actionId = behaviorTracker.trackFeatureStart('chat');
    setIsTyping(true);

    try {
      // Get real campaign data
      const campaignsResponse = await apiClient.getCampaigns();
      
      if (!campaignsResponse.success) {
        throw new Error('Failed to fetch campaign data');
      }
      
      const campaignData = Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [];
      
      // Determine query type and call appropriate AI agent
      const queryType = determineQueryType(chatMessage);
      let agentResponse;
      
      if (queryType === 'daily_focus') {
        agentResponse = await callDailyFocusAgent(chatMessage, campaignData);
      } else {
        agentResponse = await callGeneralCampaignAgent(chatMessage, campaignData);
      }
      
      // Format the AI response for display
      const formattedResponse = formatAgentResponse(agentResponse, queryType);
      
      const newChat = {
        id: Date.now().toString(),
        message: chatMessage,
        response: formattedResponse,
        timestamp: new Date(),
      };

      setChatHistory(prev => [newChat, ...prev]);
      setChatMessage('');
      behaviorTracker.trackFeatureComplete('chat', actionId, true);
      
      toast({
        title: "AI Response Generated",
        description: "Your marketing assistant has analyzed your request.",
      });
    } catch (error) {
      console.error('Chat processing failed:', error);
      behaviorTracker.trackFeatureComplete('chat', actionId, false);
      
      // Show error response
      const errorResponse = error instanceof Error ? error.message : 'I\'m having trouble processing your request right now. Please try again in a moment.';
      
      const newChat = {
        id: Date.now().toString(),
        message: chatMessage,
        response: errorResponse,
        timestamp: new Date(),
      };
      
      setChatHistory(prev => [newChat, ...prev]);
      setChatMessage('');
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const determineQueryType = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('focus') && (lowerQuery.includes('today') || lowerQuery.includes('should'))) {
      return 'daily_focus';
    }
    
    return 'general';
  };

  const callDailyFocusAgent = async (query: string, campaigns: any[]) => {
    const requestData = {
      query,
      campaigns,
      context: [],
      date: new Date().toISOString().split('T')[0]
    };

    const response = await apiClient.httpClient.request('/api/agents/daily-focus', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    if (!response.success) {
      throw new Error(`Daily focus agent failed: ${response.error}`);
    }
    
    return response.data;
  };

  const callGeneralCampaignAgent = async (query: string, campaigns: any[]) => {
    const requestData = {
      task_type: 'general_query',
      input_data: {
        query,
        campaigns,
        context: []
      }
    };

    const response = await apiClient.httpClient.request('/api/agents/campaign', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    if (!response.success) {
      throw new Error(`Campaign agent failed: ${response.error}`);
    }
    
    return response.data;
  };

  const formatAgentResponse = (agentResponse: any, queryType: string) => {
    if (!agentResponse.success) {
      throw new Error(agentResponse.error || 'AI agent returned an error');
    }
    
    const responseData = agentResponse.data;
    
    if (queryType === 'daily_focus') {
      return responseData.focus_summary || responseData.explanation || 'Based on your current campaigns and performance data, here\'s what deserves your attention today.';
    }
    
    return responseData.explanation || responseData.focus_summary || 'Here are insights based on your marketing data.';
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes}m`;
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Marketing Command Center</h1>
        <p className="mt-2 text-slate-600">
          Your intelligent marketing automation platform is learning your patterns and optimizing for success.
        </p>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Session Duration
                  </dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {formatDuration(insights.sessionDuration)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Actions Taken
                  </dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {insights.totalActions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <SettingsIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Productivity Score
                  </dt>
                  <dd className="text-lg font-medium text-slate-900">
                    {insights.productivityScore}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-600 truncate">
                    Top Feature
                  </dt>
                  <dd className="text-lg font-medium text-slate-900 capitalize">
                    {insights.topFeatures[0] || 'Dashboard'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-slate-900">AI Marketing Assistant</h3>
              <p className="text-sm text-slate-600">Ask me anything about your marketing automation</p>
            </div>
            
            <div className="p-6">
              <div className="h-80 overflow-y-auto mb-4 space-y-4">
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

                {chatHistory.length === 0 && !isTyping && user && (
                  <div className="text-center text-slate-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>Start a conversation with your AI assistant</p>
                    <p className="text-sm mt-2">Try asking: "What should I focus on today?"</p>
                  </div>
                )}
                
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">AI</span>
                    </div>
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
                        {chat.message}
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">AI</span>
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-xs">
                        {chat.response}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <form onSubmit={handleChatSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder={user ? "Ask your AI assistant..." : "Please log in to chat..."}
                  disabled={!user}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim() || isTyping || !user}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">AI Recommendations</h3>
            <div className="space-y-3">
              {insights.recommendations.length > 0 ? (
                insights.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-slate-700">{rec}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Keep using the platform to get personalized recommendations!</p>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Feature Usage</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="usage" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Weekly Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="campaigns" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="emails" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
