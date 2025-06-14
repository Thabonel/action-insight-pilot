
import React from 'react';
import { MessageSquare } from 'lucide-react';

const AuthenticationPrompt: React.FC = () => {
  return (
    <div className="text-center py-8 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="w-16 h-16 bg-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
        <MessageSquare className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-medium text-amber-800 mb-2">Authentication Required</h3>
      <p className="text-amber-700">Please log in to start chatting with your AI marketing assistant</p>
    </div>
  );
};

export default AuthenticationPrompt;
