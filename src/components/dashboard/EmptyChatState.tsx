
import React from 'react';
import { MessageSquare } from 'lucide-react';

const EmptyChatState: React.FC = () => {
  return (
    <div className="text-center text-slate-500 py-8">
      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
      <p>Start a conversation with your AI assistant</p>
      <p className="text-sm mt-2">Try asking: "What should I focus on today?"</p>
    </div>
  );
};

export default EmptyChatState;
