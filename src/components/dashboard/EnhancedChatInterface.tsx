
import React from 'react';
import { MessageSquare, Plus, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import ChatResponse from '@/components/dashboard/ChatResponse';
import { useEnhancedChat } from '@/hooks/useEnhancedChat';

const EnhancedChatInterface: React.FC = () => {
  const {
    sessions,
    currentSession,
    messages,
    isProcessing,
    query,
    setQuery,
    handleQuerySubmit,
    createNewSession,
    switchSession,
    deleteSession,
    user
  } = useEnhancedChat();

  if (!user) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6" />
            <span>AI Marketing Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 bg-amber-50 border border-amber-200 rounded-lg">
            <MessageSquare className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-amber-800 mb-2">Authentication Required</h3>
            <p className="text-amber-700">Please log in to start chatting with your AI marketing assistant</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sessions Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Chat Sessions</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => createNewSession()}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  currentSession?.id === session.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => switchSession(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">
              {currentSession?.title || 'AI Marketing Assistant'}
            </span>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && !isProcessing && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to optimize your marketing?
                </h3>
                <p className="text-gray-600">
                  Ask me anything about your campaigns, leads, or performance
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-3 max-w-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{message.query}</span>
                      {message.agentType && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          {message.agentType}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                <ChatResponse response={message.response} />
              </div>
            ))}

            {isProcessing && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-3 max-w-md">
                    {query}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Processing your request...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Query Input */}
        <div className="p-4 border-t border-gray-200">
          <form onSubmit={handleQuerySubmit} className="flex space-x-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask me about your marketing performance..."
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <Button
              type="submit"
              disabled={!query.trim() || isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
