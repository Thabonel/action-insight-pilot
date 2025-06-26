
import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2, AlertTriangle, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseCampaignFromConversation } from '@/lib/campaign-parser';
import { apiClient } from '@/lib/api-client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  query?: string;
  response?: string;
}

interface ConversationalChatInterfaceProps {
  chatHistory: ChatMessage[];
  isProcessing: boolean;
  query: string;
  setQuery: (query: string) => void;
  handleQuerySubmit: (e: React.FormEvent) => void;
  handleSuggestionClick: (suggestion: string) => void;
  user: any;
  // Campaign flow props
  isCampaignFlow?: boolean;
  currentQuestion?: string;
  progress?: { current: number; total: number; percentage: number };
  campaignCreationStatus?: 'idle' | 'in_progress' | 'creating' | 'completed' | 'error';
  collectedAnswers?: Record<string, any>;
  onAnswerProvided?: (answer: string) => void;
  onCampaignFlowReset?: () => void;
}

const ConversationalChatInterface: React.FC<ConversationalChatInterfaceProps> = ({
  chatHistory,
  isProcessing,
  query,
  setQuery,
  handleQuerySubmit,
  handleSuggestionClick,
  user,
  // Campaign flow props
  isCampaignFlow = false,
  currentQuestion = '',
  progress = { current: 0, total: 0, percentage: 0 },
  campaignCreationStatus = 'idle',
  collectedAnswers = {},
  onAnswerProvided,
  onCampaignFlowReset
}) => {
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [failedCampaignData, setFailedCampaignData] = useState<any>(null);

  // Function to detect if conversation contains enough campaign information
  const detectCampaignReady = (messages: ChatMessage[]) => {
    const conversationText = messages
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join(' ')
      .toLowerCase();

    // Keywords that indicate campaign creation readiness
    const readyPhrases = [
      'ready to create',
      'create the campaign',
      'enough information',
      'build your campaign',
      'create your campaign now',
      'shall we create',
      'let\'s create the campaign'
    ];

    return readyPhrases.some(phrase => conversationText.includes(phrase));
  };

  // Save failed campaign data to localStorage
  const saveFailedCampaignToStorage = (campaignData: any, conversationText: string) => {
    const failedAttempt = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      campaignData,
      conversationText,
      userId: user?.id
    };

    const existingAttempts = JSON.parse(localStorage.getItem('failedCampaignAttempts') || '[]');
    existingAttempts.push(failedAttempt);
    
    // Keep only the last 5 attempts to avoid storage bloat
    if (existingAttempts.length > 5) {
      existingAttempts.splice(0, existingAttempts.length - 5);
    }
    
    localStorage.setItem('failedCampaignAttempts', JSON.stringify(existingAttempts));
  };

  // Retry campaign creation
  const retryCampaignCreation = async () => {
    if (!failedCampaignData) return;
    
    setCampaignError(null);
    setIsCreatingCampaign(true);
    
    try {
      const result = await apiClient.createCampaignFromAI(failedCampaignData);
      
      if (result.success) {
        setCampaignCreated(true);
        setFailedCampaignData(null);
        console.log('Campaign created successfully on retry:', result.data);
      } else {
        setCampaignError(result.error || 'Failed to create campaign. Please try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setCampaignError(errorMessage);
      console.error('Error retrying campaign creation:', error);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Save answers for later
  const saveAnswersForLater = () => {
    if (!failedCampaignData) return;
    
    const conversationText = chatHistory
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');
    
    saveFailedCampaignToStorage(failedCampaignData, conversationText);
    setCampaignError(null);
    setFailedCampaignData(null);
    
    // Show success message temporarily
    setTimeout(() => {
      setCampaignCreated(false);
    }, 3000);
  };

  // Function to create campaign from conversation
  const createCampaignFromConversation = async () => {
    if (!user || isCreatingCampaign) return;

    setIsCreatingCampaign(true);
    setCampaignError(null);
    
    try {
      // Extract conversation text for parsing
      const conversationText = chatHistory
        .map(m => `${m.role}: ${m.content}`)
        .join('\n');

      // Parse campaign data from conversation
      const parsedCampaign = parseCampaignFromConversation(conversationText);

      // Create campaign in database
      const result = await apiClient.createCampaignFromAI(parsedCampaign);

      if (result.success) {
        setCampaignCreated(true);
        console.log('Campaign created successfully:', result.data);
      } else {
        const errorMessage = result.error || 'Failed to create campaign. Please try again.';
        setCampaignError(errorMessage);
        setFailedCampaignData(parsedCampaign);
        saveFailedCampaignToStorage(parsedCampaign, conversationText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while creating the campaign.';
      setCampaignError(errorMessage);
      
      // Try to parse campaign data for potential retry
      try {
        const conversationText = chatHistory
          .map(m => `${m.role}: ${m.content}`)
          .join('\n');
        const parsedCampaign = parseCampaignFromConversation(conversationText);
        setFailedCampaignData(parsedCampaign);
        saveFailedCampaignToStorage(parsedCampaign, conversationText);
      } catch (parseError) {
        console.error('Error parsing campaign data:', parseError);
      }
      
      console.error('Error creating campaign:', error);
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Check if campaign should be created when chat history updates
  useEffect(() => {
    if (chatHistory.length > 0 && !campaignCreated && !isCreatingCampaign) {
      const shouldCreate = detectCampaignReady(chatHistory);
      if (shouldCreate) {
        createCampaignFromConversation();
      }
    }
  }, [chatHistory, campaignCreated, isCreatingCampaign]);

  const suggestions = [
    "I want to create a new marketing campaign",
    "Help me plan a campaign strategy",
    "What industry are you in?",
    "Let's start building your campaign",
    "Guide me through campaign creation",
    "I need help with my marketing campaign"
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Progress Bar */}
        {isCampaignFlow && progress.total > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Campaign Creation Progress
              </span>
              <span className="text-sm text-blue-600">
                {progress.current}/{progress.total} questions completed
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Campaign Creation Assistant</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Ready to build your campaign</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to create your marketing campaign?</h4>
              <p className="text-gray-600 mb-6">I'll guide you through building a comprehensive campaign step-by-step</p>
              
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-700 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            chatHistory.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          {isCreatingCampaign && (
            <div className="flex justify-start">
              <div className="bg-green-100 text-green-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin w-4 h-4 text-green-600" />
                  <span className="text-sm">Creating your campaign...</span>
                </div>
              </div>
            </div>
          )}

          {campaignError && (
            <div className="flex justify-start">
              <div className="bg-red-100 text-red-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Campaign Creation Failed</span>
                </div>
                <p className="text-sm mb-3">{campaignError}</p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={retryCampaignCreation}
                    disabled={isCreatingCampaign}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                  <Button 
                    onClick={saveAnswersForLater}
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save for Later
                  </Button>
                </div>
              </div>
            </div>
          )}

          {campaignCreated && (
            <div className="flex justify-start">
              <div className="bg-green-100 text-green-900 p-3 rounded-lg max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Campaign created successfully! 🎉</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleQuerySubmit} className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={user ? "Tell me about your campaign needs..." : "Please log in to chat..."}
            disabled={!user || isProcessing}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 text-black placeholder-gray-500"
          />
          <Button
            type="submit"
            disabled={!query.trim() || isProcessing || !user}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* More Suggestions */}
        {chatHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">More suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationalChatInterface;
