
import React from 'react';

interface ChatInputProps {
  chatMessage: string;
  setChatMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  user: any;
  isTyping: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  chatMessage,
  setChatMessage,
  onSubmit,
  user,
  isTyping
}) => {
  return (
    <form onSubmit={onSubmit} className="flex space-x-2">
      <input
        type="text"
        value={chatMessage}
        onChange={(e) => setChatMessage(e.target.value)}
        placeholder={user ? "What can I help you with today?" : "Please log in to chat..."}
        disabled={!user || isTyping}
        className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-500"
      />
      <button
        type="submit"
        disabled={!chatMessage.trim() || isTyping || !user}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
