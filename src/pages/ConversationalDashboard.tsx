import React from 'react';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';

const ConversationalDashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
        <h1 className="text-2xl font-semibold">AI Marketing Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Chat with your AI assistant to get insights and manage your marketing
        </p>
      </div>

      <DashboardChatInterface />
    </div>
  );
};

export default ConversationalDashboard;

