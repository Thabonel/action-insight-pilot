
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 max-w-3xl shadow-sm">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{chat.message}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-sm font-semibold">AI</span>
        </div>
        <div className="flex-1 max-w-3xl">
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
            <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">{chat.response}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
