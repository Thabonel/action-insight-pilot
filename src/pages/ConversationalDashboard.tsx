import React from 'react';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';

const ConversationalDashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-2">Conversational Dashboard</h1>
        <p className="text-muted-foreground">
          Chat with your AI assistant to get insights and manage your marketing
        </p>
      </div>

      <DashboardChatInterface />
    </div>
  );
};

export default ConversationalDashboard;

