
import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ChatSession, ChatMessage } from '@/lib/api-client-interface';

interface EnhancedChatInterfaceProps {
  chatHistory: ChatMessage[];
  isProcessing: boolean;
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: (e: React.FormEvent) => void;
  handleSuggestionClick: (suggestion: string) => void;
  user: User | null;
  chatSessions?: ChatSession[];
  onCreateNewSession?: () => void;
  onSelectSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  currentSessionId?: string;
  researchNotes?: { id: string; content: string }[];
  onSaveNote?: (message: ChatMessage) => void;
  onInsertNote?: (note: { id: string; content: string }) => void;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  chatHistory,
  isProcessing,
  query,
  setQuery,
  handleQuerySubmit,
  handleSuggestionClick,
  user,
  chatSessions = [],
  onCreateNewSession,
  onSelectSession,
  onDeleteSession,
  currentSessionId,
  researchNotes = [],
  onSaveNote,
  onInsertNote
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSessionSelect = (session: ChatSession) => {
    if (onSelectSession) {
      onSelectSession(session.id);
    }
    setShowSessions(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatSessionDate = (session: ChatSession) => {
    return new Date(session.createdAt).toLocaleDateString();
  };

  const suggestions = [
    "Show me today's campaign performance",
    "Generate a social media post about our new product",
    "What are the top performing email subjects?",
    "Create a workflow for lead nurturing"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>AI Assistant</CardTitle>
          <div className="flex items-center space-x-2">
            {chatSessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSessions(!showSessions)}
              >
                Sessions ({chatSessions.length})
              </Button>
            )}
            {onCreateNewSession && (
              <Button variant="outline" size="sm" onClick={onCreateNewSession}>
                New Chat
              </Button>
            )}
            <Button variant="ghost" size="sm">
              ...
            </Button>
          </div>
        </div>
        
        {showSessions && (
          <div className="mt-4 border rounded-lg p-2 bg-gray-50 max-h-40 overflow-y-auto">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-white ${
                  currentSessionId === session.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">Chat</div>
                  <div className="text-xs text-gray-500">
                    {formatSessionDate(session)} • {session.messages.length} messages
                  </div>
                </div>
                {onDeleteSession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    x
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to help!
                </h3>
                <p className="text-gray-600 mb-6">
                  Ask me anything about your marketing campaigns, analytics, or content creation.
                </p>
                <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left justify-start"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar className="h-8 w-8">
                  {message.role === 'user' ? (
                    <>
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>U</AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-blue-100">AI</AvatarFallback>
                  )}
                </Avatar>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    {message.role === 'assistant' && onSaveNote && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onSaveNote(message)}>
                        +
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100">AI</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-gray-100">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <form onSubmit={handleQuerySubmit} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your question here..."
                disabled={isProcessing}
                className="pr-20"
              />
            </div>
            <Button
              type="submit"
              disabled={isProcessing || !query.trim()}
              size="sm"
            >
              Send
            </Button>
          </form>

          {researchNotes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {researchNotes.map((note) => (
                <Badge
                  key={note.id}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => onInsertNote && onInsertNote(note)}
                >
                  {note.content.slice(0, 30)}
                </Badge>
              ))}
            </div>
          )}

          {!user && (
            <div className="mt-2 text-center">
              <Badge variant="outline" className="text-xs">
                Please sign in to save your conversation history
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChatInterface;
