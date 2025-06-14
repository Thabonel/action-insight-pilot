
import React from 'react';

interface ChatMessageData {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

interface ChatMessageProps {
  chat: ChatMessageData;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ chat }) => {
  return (
    <div className="space-y-3">
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
  );
};

export default ChatMessage;
