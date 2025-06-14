
import React from 'react';
import { MessageSquare, Send, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ChatResponse from '@/components/dashboard/ChatResponse';

interface ChatMessage {
  id: string;
  query: string;
  response: any;
  timestamp: Date;
}

interface ConversationalChatInterfaceProps {
  chatHistory: ChatMessage[];
  isProcessing: boolean;
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: (e: React.FormEvent) => void;
  handleSuggestionClick: (suggestion: string) => void;
  user: any;
  serverStatus: 'sleeping' | 'waking' | 'awake' | 'error';
}

const ConversationalChatInterface: React.FC<ConversationalChatInterfaceProps> = ({
  chatHistory,
  isProcessing,
  query,
  setQuery,
  handleQuerySubmit,
  handleSuggestionClick,
  user,
  serverStatus
}) => {
  const quickSuggestions = [
    "What should I focus on today?",
    "Show me my best performing campaigns",
    "What content should I create next?",
    "How are my leads converting?",
    "Why is my budget running out so fast?",
    "Schedule posts for next week"
  ];

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
      <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <MessageSquare className="h-6 w-6" />
          <CardTitle>AI Marketing Assistant</CardTitle>
          <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              serverStatus === 'awake' ? 'bg-green-400 animate-pulse' : 
              serverStatus === 'waking' ? 'bg-yellow-400 animate-pulse' : 
              'bg-red-400'
            }`}></div>
            {user ? (serverStatus === 'awake' ? 'Online' : serverStatus === 'waking' ? 'Starting...' : 'Offline') : 'Login Required'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Authentication Message */}
        {!user && (
          <div className="text-center py-8 mb-6 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="w-16 h-16 bg-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-medium text-amber-800 mb-2">Authentication Required</h3>
            <p className="text-amber-700">Please log in to start chatting with your AI marketing assistant</p>
          </div>
        )}

        {/* Chat History */}
        <div className="h-96 overflow-y-auto mb-6 space-y-4">
          {chatHistory.length === 0 && !isProcessing && user && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to optimize your marketing?</h3>
              <p className="text-slate-600 mb-4">Ask me anything about your campaigns, leads, or performance</p>
              
              {/* Quick Suggestions */}
              <div className="space-y-2">
                <p className="text-sm text-slate-500">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Display messages in chronological order */}
          {chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-4">
              {/* User Query */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-3 max-w-md">
                  {chat.query}
                </div>
              </div>
              
              {/* AI Response */}
              <ChatResponse response={chat.response} />
            </div>
          ))}
          
          {isProcessing && (
            <div className="space-y-4">
              {/* Show user's current query */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg px-4 py-3 max-w-md">
                  {query}
                </div>
              </div>
              
              {/* Show processing indicator */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-slate-600">
                      {serverStatus === 'waking' ? 'Waking up AI assistant...' : 'Processing your request...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Query Input */}
        <form onSubmit={handleQuerySubmit} className="flex space-x-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={user ? "Ask me about your marketing performance..." : "Please log in to chat..."}
            disabled={!user || isProcessing}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
          <Button
            type="submit"
            disabled={!query.trim() || isProcessing || !user}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConversationalChatInterface;
