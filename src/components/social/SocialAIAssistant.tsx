
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Bot, TrendingUp, Clock, Target, Share2, Zap } from 'lucide-react';

const SocialAIAssistant: React.FC = () => {
  const [insights] = useState({
    bestPlatform: 'LinkedIn',
    avgEngagement: '8.4%',
    bestPostTime: '10:30 AM',
    engagementAccuracy: 92,
    learningStatus: 'Analyzing posting patterns'
  });

  const [suggestions] = useState([
    {
      id: 1,
      type: 'timing',
      message: "Your LinkedIn posts get 40% more engagement at 10:30 AM",
      confidence: 94,
      icon: Clock,
      action: "Schedule next post"
    },
    {
      id: 2,
      type: 'content',
      message: "Video content gets 3x more engagement than images",
      confidence: 89,
      icon: TrendingUp,
      action: "Create video post"
    },
    {
      id: 3,
      type: 'platform',
      message: "Twitter threads perform 65% better than single tweets",
      confidence: 91,
      icon: Target,
      action: "Create thread"
    }
  ]);

  const [quickActions] = useState([
    { label: "Post to optimal platforms", confidence: 96 },
    { label: "Schedule week of content", confidence: 89 },
    { label: "Repurpose top performer", confidence: 85 },
    { label: "Analyze competitor posts", confidence: 92 }
  ]);

  const handleSuggestionClick = (suggestion: any) => {
    behaviorTracker.trackAction('feature_use', 'social_ai_suggestion', {
      suggestionType: suggestion.type,
      suggestionId: suggestion.id,
      action: suggestion.action
    });
  };

  const handleQuickAction = (action: string) => {
    behaviorTracker.trackAction('feature_use', 'social_quick_action', {
      action,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>Social Media AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Learning Status */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Engagement Insights</h4>
          <p className="text-sm text-blue-700">
            Top platform: <span className="font-semibold">{insights.bestPlatform}</span>
          </p>
          <p className="text-sm text-blue-700">
            Avg engagement: <span className="font-semibold">{insights.avgEngagement}</span>
          </p>
          <div className="mt-2 text-xs text-blue-600">
            Prediction accuracy: {insights.engagementAccuracy}%
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Smart Recommendations</h4>
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
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">
                          {suggestion.confidence}% confidence
                        </div>
                        <Button size="sm" variant="outline" className="text-xs">
                          {suggestion.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => handleQuickAction(action.label)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{action.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {action.confidence}%
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Posting Intelligence</h4>
          <div className="space-y-1">
            <p className="text-sm text-green-700">
              Best time: <span className="font-semibold">{insights.bestPostTime}</span>
            </p>
            <p className="text-sm text-green-700">
              Status: <span className="font-semibold">{insights.learningStatus}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialAIAssistant;
