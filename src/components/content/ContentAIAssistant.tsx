
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Bot, TrendingUp, Target, Lightbulb, FileText, Zap } from 'lucide-react';

const ContentAIAssistant: React.FC = () => {
  const [insights] = useState({
    topContentType: 'How-to Guides',
    avgEngagement: '6.8%',
    bestPublishTime: '10:30 AM',
    contentAccuracy: 89,
    learningStatus: 'Continuously improving'
  });

  const [suggestions] = useState([
    {
      id: 1,
      type: 'topic',
      message: "Your 'Marketing Automation' content gets 45% higher engagement",
      confidence: 94,
      icon: Target,
      action: "Create similar content"
    },
    {
      id: 2,
      type: 'format',
      message: "List-based content performs 32% better for your audience",
      confidence: 87,
      icon: TrendingUp,
      action: "Use list format"
    },
    {
      id: 3,
      type: 'timing',
      message: "Publishing at 10:30 AM increases views by 23%",
      confidence: 91,
      icon: Lightbulb,
      action: "Schedule for optimal time"
    }
  ]);

  const [quickActions] = useState([
    { label: "Create content like top performer", confidence: 96 },
    { label: "Generate topic variations", confidence: 89 },
    { label: "Optimize existing content", confidence: 85 },
    { label: "Schedule for best time", confidence: 92 }
  ]);

  const handleSuggestionClick = (suggestion: any) => {
    behaviorTracker.trackAction('feature_use', 'content_ai_suggestion', {
      suggestionType: suggestion.type,
      suggestionId: suggestion.id,
      action: suggestion.action
    });
  };

  const handleQuickAction = (action: string) => {
    behaviorTracker.trackAction('feature_use', 'content_quick_action', {
      action,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-purple-600" />
          <span>Content Intelligence AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Learning Status */}
        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-medium text-purple-900 mb-2">Performance Insights</h4>
          <p className="text-sm text-purple-700">
            Top format: <span className="font-semibold">{insights.topContentType}</span>
          </p>
          <p className="text-sm text-purple-700">
            Avg engagement: <span className="font-semibold">{insights.avgEngagement}</span>
          </p>
          <div className="mt-2 text-xs text-purple-600">
            Prediction accuracy: {insights.contentAccuracy}%
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
          <h4 className="font-medium text-green-900 mb-2">Content Health</h4>
          <div className="space-y-1">
            <p className="text-sm text-green-700">
              Best publish time: <span className="font-semibold">{insights.bestPublishTime}</span>
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

export default ContentAIAssistant;
