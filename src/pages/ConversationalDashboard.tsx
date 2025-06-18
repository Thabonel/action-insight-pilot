
import React from 'react';
import { useConversationalDashboard } from '@/hooks/useConversationalDashboard';
import ConversationalChatInterface from '@/components/dashboard/ConversationalChatInterface';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import SystemOverviewCards from '@/components/dashboard/SystemOverviewCards';
import AIGreeting from '@/components/dashboard/AIGreeting';
import LearningInsights from '@/components/dashboard/LearningInsights';

const ConversationalDashboard: React.FC = () => {
  const {
    query,
    setQuery,
    chatHistory,
    isProcessing,
    insights,
    user,
    handleQuerySubmit,
    handleSuggestionClick
  } = useConversationalDashboard();

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
            <ConversationalChatInterface
              chatHistory={chatHistory}
              isProcessing={isProcessing}
              query={query}
              setQuery={setQuery}
              handleQuerySubmit={handleQuerySubmit}
              handleSuggestionClick={handleSuggestionClick}
              user={user}
            />
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
