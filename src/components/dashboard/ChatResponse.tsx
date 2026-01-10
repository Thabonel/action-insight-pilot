
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ChatResponseData {
  message?: string;
  content?: string;
}

interface ChatResponseProps {
  response: string | ChatResponseData | null;
}

const ChatResponse: React.FC<ChatResponseProps> = ({ response }) => {
  if (!response) {
    return null;
  }

  const displayText = typeof response === 'string'
    ? response
    : response.message || response.content || 'AI response';

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">AI</span>
      </div>
      <div className="bg-gray-100 rounded-lg px-4 py-3 flex-1">
        <div className="text-sm text-gray-800">
          {displayText}
        </div>
      </div>
    </div>
  );
};

export default ChatResponse;
