import React from 'react';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';

const ConversationalDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Conversational Dashboard</h1>
        <p className="text-muted-foreground">
          Chat with your AI assistant to get insights and manage your marketing
        </p>
      </div>

      {/* AI Chat Interface */}
      <DashboardChatInterface />
    </div>
  );
};

export default ConversationalDashboard;

