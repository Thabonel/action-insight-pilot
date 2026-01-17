
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { User } from '@supabase/supabase-js';

interface ChatInputProps {
  chatMessage: string;
  setChatMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  user: User | null;
  isTyping: boolean;
}

export interface ChatInputHandle {
  focus: () => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(({
  chatMessage,
  setChatMessage,
  onSubmit,
  user,
  isTyping
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder={user ? "What can I help you with today?" : "Please log in to chat..."}
          disabled={!user || isTyping}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 200) + 'px';
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 placeholder:text-gray-400 resize-none text-[15px] leading-relaxed shadow-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!chatMessage.trim() || isTyping || !user}
        className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm flex-shrink-0"
      >
        Send
      </button>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;
