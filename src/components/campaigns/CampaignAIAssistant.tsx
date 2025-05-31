
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Bot, Clock, TrendingUp, Target } from 'lucide-react';

const CampaignAIAssistant: React.FC = () => {
  const [insights, setInsights] = useState({
    userPattern: 'planner', // 'planner' | 'rusher'
    averagePlanningTime: '2.5 hours',
    successfulLaunchTimes: ['Tuesday 10 AM', 'Thursday 2 PM'],
    nextOptimalTime: 'Tomorrow at 10:30 AM',
    confidenceScore: 87
  });

  const [suggestions] = useState([
    {
      id: 1,
      type: 'timing',
      message: "Based on your pattern, campaigns launched Tuesday mornings perform 34% better",
      confidence: 92,
      icon: Clock
    },
    {
      id: 2,
      type: 'performance',
      message: "Your email campaigns consistently outperform social by 28%",
      confidence: 89,
      icon: TrendingUp
    },
    {
      id: 3,
      type: 'optimization',
      message: "Consider increasing budget on high-performing content campaigns",
      confidence: 76,
      icon: Target
    }
  ]);

  useEffect(() => {
    const userInsights = behaviorTracker.getInsights();
    // Update insights based on behavior tracking data
    if (userInsights.totalActions > 50) {
      setInsights(prev => ({
        ...prev,
        userPattern: userInsights.productivityScore > 75 ? 'planner' : 'rusher'
      }));
    }
  }, []);

  const handleSuggestionClick = (suggestion: any) => {
    behaviorTracker.trackAction('planning', 'campaign_ai_assistant', {
      suggestionType: suggestion.type,
      suggestionId: suggestion.id
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>AI Campaign Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Your Working Style</h4>
          <p className="text-sm text-blue-700">
            You're a <span className="font-semibold">{insights.userPattern}</span> - 
            you typically spend {insights.averagePlanningTime} planning campaigns.
          </p>
          <div className="mt-2 text-xs text-blue-600">
            Confidence: {insights.confidenceScore}%
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Smart Suggestions</h4>
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-4 w-4 text-gray-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{suggestion.message}</p>
                      <div className="mt-1 text-xs text-gray-500">
                        {suggestion.confidence}% confidence
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Next Optimal Launch</h4>
          <p className="text-sm text-green-700">{insights.nextOptimalTime}</p>
          <p className="text-xs text-green-600 mt-1">
            Based on your successful launch times: {insights.successfulLaunchTimes.join(', ')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignAIAssistant;
