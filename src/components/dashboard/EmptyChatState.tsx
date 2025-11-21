
import React from 'react';
import { MessageSquare } from 'lucide-react';

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-6 mb-6">
        <MessageSquare className="h-12 w-12 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        Start a conversation with your AI assistant
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Get insights about your marketing campaigns, ask for recommendations, or explore your data
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 transition-colors cursor-pointer">
          <p className="text-sm font-medium text-gray-700">What should I focus on today?</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 transition-colors cursor-pointer">
          <p className="text-sm font-medium text-gray-700">How are my campaigns performing?</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 transition-colors cursor-pointer">
          <p className="text-sm font-medium text-gray-700">Suggest improvements for my strategy</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-300 transition-colors cursor-pointer">
          <p className="text-sm font-medium text-gray-700">Generate content ideas</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
