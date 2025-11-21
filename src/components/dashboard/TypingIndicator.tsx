
import React from 'react';

interface TypingIndicatorProps {
  currentMessage: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ currentMessage }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 max-w-3xl shadow-sm">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{currentMessage}</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-sm font-semibold">AI</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
