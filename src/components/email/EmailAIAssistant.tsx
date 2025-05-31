
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Bot, Clock, Target, TrendingUp, Mail, Zap } from 'lucide-react';

const EmailAIAssistant: React.FC = () => {
  const [insights] = useState({
    optimalSendTime: '10:30 AM',
    bestPerformingType: 'Educational',
    avgOpenRate: '32.4%',
    avgClickRate: '4.8%',
    conversionAccuracy: 89,
    learningStatus: 'Analyzing send patterns'
  });

  const [suggestions] = useState([
    {
      id: 1,
      type: 'timing',
      message: "Your audience opens emails 45% more at 10:30 AM on Tuesdays",
      confidence: 94,
      icon: Clock,
      action: "Optimize send times"
    },
    {
      id: 2,
      type: 'subject',
      message: "Subject lines with numbers get 28% higher open rates",
      confidence: 87,
      icon: Target,
      action: "Generate subjects"
    },
    {
      id: 3,
      type: 'content',
      message: "Educational content drives 3x more conversions",
      confidence: 92,
      icon: TrendingUp,
      action: "Create educational email"
    }
  ]);

  const [quickActions] = useState([
    { label: "Optimize all campaign times", accuracy: 94 },
    { label: "Generate A/B test variations", accuracy: 91 },
    { label: "Create high-converting sequence", accuracy: 88 },
    { label: "Analyze campaign performance", accuracy: 96 }
  ]);

  const handleSuggestionClick = (suggestion: any) => {
    behaviorTracker.trackAction('feature_use', 'email_ai_suggestion', {
      suggestionType: suggestion.type,
      suggestionId: suggestion.id,
      action: suggestion.action
    });
  };

  const handleQuickAction = (action: string) => {
    behaviorTracker.trackAction('feature_use', 'email_quick_action', {
      action,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>Email AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Performance Insights */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Performance Intelligence</h4>
          <div className="space-y-1">
            <p className="text-sm text-blue-700">
              Best send time: <span className="font-semibold">{insights.optimalSendTime}</span>
            </p>
            <p className="text-sm text-blue-700">
              Top content: <span className="font-semibold">{insights.bestPerformingType}</span>
            </p>
            <p className="text-sm text-blue-700">
              Open rate: <span className="font-semibold">{insights.avgOpenRate}</span>
            </p>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Prediction accuracy: {insights.conversionAccuracy}%
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
                    {action.accuracy}%
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Learning Status */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Email Intelligence</h4>
          <div className="space-y-1">
            <p className="text-sm text-green-700">
              Click rate: <span className="font-semibold">{insights.avgClickRate}</span>
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

export default EmailAIAssistant;
