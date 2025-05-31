
import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { apiClient } from '@/lib/api-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { MessageSquare, Calendar, Settings as SettingsIcon, ChevronDown } from 'lucide-react';

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

    const actionId = behaviorTracker.trackFeatureStart('chat');
    setIsTyping(true);

    // Simulate AI response
    const responses = [
      "I can help you create a new campaign. What's your target audience?",
      "Based on your recent activity, I'd recommend focusing on email automation.",
      "Your productivity score is excellent! Let's optimize your lead generation.",
      "I notice you're active during peak hours. Perfect time for social media posting!",
      "Would you like me to analyze your campaign performance and suggest improvements?"
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    // Simulate typing delay
    setTimeout(() => {
      const newChat = {
        id: Date.now().toString(),
        message: chatMessage,
        response,
        timestamp: new Date(),
      };

      setChatHistory(prev => [newChat, ...prev]);
      setChatMessage('');
      setIsTyping(false);
      behaviorTracker.trackFeatureComplete('chat', actionId, true);
    }, 1500);
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
                {chatHistory.length === 0 && (
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
                  placeholder="Ask your AI assistant..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim() || isTyping}
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
