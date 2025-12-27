import React from 'react';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';
import { HelpButton } from '@/components/common/HelpButton';
import { FloatingHelpButton } from '@/components/common/FloatingHelpButton';
import { helpContent } from '@/config/helpContent';

const ConversationalDashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <HelpButton
        title={helpContent.conversationalDashboard.title}
        content={helpContent.conversationalDashboard.content}
      />
      <div className="bg-white px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-3xl font-bold mb-2">Conversational Dashboard</h1>
        <p className="text-muted-foreground">
          Chat with your AI assistant to get insights and manage your marketing
        </p>
      </div>

      <DashboardChatInterface />
      <FloatingHelpButton helpSection="conversationalDashboard" />
    </div>
  );
};

export default ConversationalDashboard;

