
import React from 'react';
import { useChatLogic } from '@/hooks/useChatLogic';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

interface DashboardChatInterfaceProps {
  onChatUpdate?: (chatHistory: ChatMessage[]) => void;
}

const DashboardChatInterface: React.FC<DashboardChatInterfaceProps> = ({ onChatUpdate }) => {
  const {
    chatMessage,
    setChatMessage,
    chatHistory,
    isTyping,
    handleChatSubmit,
    user
  } = useChatLogic({ onChatUpdate });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="bg-white dark:bg-[#151A21] border-b border-gray-200 dark:border-[#273140] px-6 py-4 flex-shrink-0">
        <h3 className="text-lg font-medium text-slate-900 dark:text-[#E9EEF5]">AI Marketing Assistant</h3>
        <p className="text-sm text-slate-600 dark:text-[#94A3B8]">Ask me anything about your marketing automation</p>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0B0D10]">
        <ChatHistory
          chatHistory={chatHistory}
          isTyping={isTyping}
          currentMessage={chatMessage}
          user={user}
        />
      </div>

      <div className="border-t border-gray-200 dark:border-[#273140] bg-white dark:bg-[#151A21] p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            chatMessage={chatMessage}
            setChatMessage={setChatMessage}
            onSubmit={handleChatSubmit}
            user={user}
            isTyping={isTyping}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardChatInterface;
