
import React from 'react';

interface SuggestionItem {
  text: string;
  category: 'focus' | 'performance' | 'strategy' | 'content' | 'campaign';
}

interface EmptyChatStateProps {
  onSuggestionClick?: (suggestion: string) => void;
  hasCampaigns?: boolean;
  hasAutopilot?: boolean;
}

// Contextual suggestions based on user's current state
const getSuggestions = (hasCampaigns: boolean, hasAutopilot: boolean): SuggestionItem[] => {
  if (!hasCampaigns) {
    // New user without campaigns - focus on getting started
    return [
      { text: "Help me create my first marketing campaign", category: 'campaign' },
      { text: "What marketing channels work best for small businesses?", category: 'strategy' },
      { text: "Generate content ideas for launching a new product", category: 'content' },
      { text: "What's the best way to reach my target audience?", category: 'strategy' },
    ];
  }

  if (hasAutopilot) {
    // User has autopilot enabled - focus on optimization and insights
    return [
      { text: "How is autopilot optimizing my campaigns?", category: 'performance' },
      { text: "What improvements has the AI made this week?", category: 'focus' },
      { text: "Show me the ROI of my automated campaigns", category: 'performance' },
      { text: "Suggest ways to improve my autopilot settings", category: 'strategy' },
    ];
  }

  // User has campaigns but no autopilot - focus on performance and growth
  return [
    { text: "What should I focus on today?", category: 'focus' },
    { text: "How are my campaigns performing?", category: 'performance' },
    { text: "Suggest improvements for my strategy", category: 'strategy' },
    { text: "Generate content ideas for my campaigns", category: 'content' },
  ];
};

const EmptyChatState: React.FC<EmptyChatStateProps> = ({
  onSuggestionClick,
  hasCampaigns = false,
  hasAutopilot = false
}) => {
  const suggestions = getSuggestions(hasCampaigns, hasAutopilot);

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-6 mb-6 w-24 h-24 flex items-center justify-center">
        <span className="text-3xl text-blue-600 font-bold">AI</span>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        Start a conversation with your AI assistant
      </h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Get insights about your marketing campaigns, ask for recommendations, or explore your data
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSuggestionClick(suggestion.text)}
            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
              {suggestion.text}
            </p>
          </button>
        ))}
      </div>
      {!hasCampaigns && (
        <p className="mt-6 text-xs text-gray-400">
          Tip: Click any suggestion above to get started quickly
        </p>
      )}
    </div>
  );
};

export default EmptyChatState;
