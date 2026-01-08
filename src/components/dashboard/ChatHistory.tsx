
import React from 'react';
import { User } from '@supabase/supabase-js';
import ChatMessage from './ChatMessage';
import EmptyChatState from './EmptyChatState';
import TypingIndicator from './TypingIndicator';
import AuthenticationPrompt from './AuthenticationPrompt';

interface ChatMessageData {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

interface ChatHistoryProps {
  chatHistory: ChatMessageData[];
  isTyping: boolean;
  currentMessage: string;
  user: User | null;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  chatHistory,
  isTyping,
  currentMessage,
  user
}) => {
  return (
    <div className="w-full h-full">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {!user && <AuthenticationPrompt />}

        {chatHistory.length === 0 && !isTyping && user && <EmptyChatState />}

        {chatHistory.map((chat) => (
          <ChatMessage key={chat.id} chat={chat} />
        ))}

        {isTyping && <TypingIndicator currentMessage={currentMessage} />}
      </div>
    </div>
  );
};

export default ChatHistory;
