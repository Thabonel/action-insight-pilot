
import React from 'react';

interface EmptyChatStateProps {
  onSuggestionClick?: (suggestion: string) => void;
  hasCampaigns?: boolean;
  hasAutopilot?: boolean;
}

const EmptyChatState: React.FC<EmptyChatStateProps> = ({
  onSuggestionClick,
  hasCampaigns = false,
  hasAutopilot = false
}) => {
  // Contextual suggestions based on user state
  const getSuggestions = () => {
    if (!hasCampaigns) {
      // New user - no campaigns yet
      return [
        "Help me create my first marketing campaign",
        "What marketing channels work best for small businesses?",
        "How do I define my target audience?",
        "What's a good marketing budget to start with?"
      ];
    }

    if (hasAutopilot) {
      // User has autopilot enabled
      return [
        "How is autopilot optimizing my campaigns?",
        "What improvements has the AI made this week?",
        "Show me autopilot performance insights",
        "What should I adjust in my autopilot settings?"
      ];
    }

    // User has campaigns but no autopilot
    return [
      "What should I focus on today?",
      "How are my campaigns performing?",
      "Suggest improvements for my strategy",
      "Generate content ideas"
    ];
  };

  const suggestions = getSuggestions();

  const handleClick = (suggestion: string) => {
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
            onClick={() => handleClick(suggestion)}
            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer group"
          >
            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
              {suggestion}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyChatState;
