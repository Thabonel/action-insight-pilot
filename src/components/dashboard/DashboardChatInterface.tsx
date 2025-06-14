
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
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-slate-900">AI Marketing Assistant</h3>
        <p className="text-sm text-slate-600">Ask me anything about your marketing automation</p>
      </div>
      
      <div className="p-6">
        <ChatHistory 
          chatHistory={chatHistory}
          isTyping={isTyping}
          currentMessage={chatMessage}
          user={user}
        />
        
        <ChatInput
          chatMessage={chatMessage}
          setChatMessage={setChatMessage}
          onSubmit={handleChatSubmit}
          user={user}
          isTyping={isTyping}
        />
      </div>
    </div>
  );
};

export default DashboardChatInterface;
