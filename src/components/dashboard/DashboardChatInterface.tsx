
import React from 'react';
import { MessageSquare } from 'lucide-react';
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
    <div className="flex flex-col flex-1 bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <ChatHistory
          chatHistory={chatHistory}
          isTyping={isTyping}
          currentMessage={chatMessage}
          user={user}
        />
      </div>

      <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
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
