
import React from 'react';

const AuthenticationPrompt: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-8 border border-amber-200 max-w-md mx-auto text-center shadow-sm">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md">
          <span className="text-2xl text-white font-bold">?</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-600 mb-6">
          Please log in to start chatting with your AI marketing assistant
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm">
          Sign In to Continue
        </button>
      </div>
    </div>
  );
};

export default AuthenticationPrompt;
