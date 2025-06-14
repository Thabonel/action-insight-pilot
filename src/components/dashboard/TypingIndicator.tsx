
import React from 'react';

interface TypingIndicatorProps {
  currentMessage: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentMessage }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs">
          {currentMessage}
        </div>
      </div>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">AI</span>
        </div>
        <div className="bg-gray-100 rounded-lg px-4 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
