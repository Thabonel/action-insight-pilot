import React from 'react';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const ConversationalDashboard: React.FC = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0B0D10]">
      <div className="bg-white dark:bg-[#151A21] px-6 py-4 border-b border-gray-200 dark:border-[#273140] flex-shrink-0">
        <h1 className="text-3xl font-bold mb-2 dark:text-[#E9EEF5]">Conversational Dashboard</h1>
        <p className="text-muted-foreground dark:text-[#94A3B8]">
          Chat with your AI assistant to get insights and manage your marketing
        </p>
      </div>

      <DashboardChatInterface />
      <PageHelpModal helpKey="conversationalDashboard" />
    </div>
  );
};

export default ConversationalDashboard;

