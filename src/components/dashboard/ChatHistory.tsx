
import React from 'react';
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
  user: any;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  chatHistory, 
  isTyping, 
  currentMessage, 
  user 
}) => {
  return (
    <div className="h-80 overflow-y-auto mb-4 space-y-4">
      {!user && <AuthenticationPrompt />}

      {chatHistory.length === 0 && !isTyping && user && <EmptyChatState />}
      
      {chatHistory.map((chat) => (
        <ChatMessage key={chat.id} chat={chat} />
      ))}
      
      {isTyping && <TypingIndicator currentMessage={currentMessage} />}
    </div>
  );
};

export default ChatHistory;
