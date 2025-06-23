
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface ChatResponseProps {
  response: any;
}

const ChatResponse: React.FC<ChatResponseProps> = ({ response }) => {
  if (!response) {
    return null;
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <MessageSquare className="h-4 w-4 text-white" />
      </div>
      <div className="bg-gray-100 rounded-lg px-4 py-3 flex-1">
        <div className="text-sm text-gray-800">
          {typeof response === 'string' ? response : response.message || 'AI response'}
        </div>
      </div>
    </div>
  );
};

export default ChatResponse;
