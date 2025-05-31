
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { Bot, TrendingUp, Target, Users, Lightbulb } from 'lucide-react';

const LeadAIAssistant: React.FC = () => {
  const [insights, setInsights] = useState({
    conversionRate: '23.4%',
    topSource: 'LinkedIn',
    bestTimeToContact: '10:30 AM',
    averageScoreAccuracy: 87,
    learningProgress: 'Improving daily'
  });

  const [suggestions] = useState([
    {
      id: 1,
      type: 'search',
      message: "Your SaaS leads from LinkedIn convert 34% better than average",
      confidence: 92,
      icon: Target,
      action: "Search similar leads"
    },
    {
      id: 2,
      type: 'timing',
      message: "Leads contacted within 2 hours have 67% higher conversion",
      confidence: 89,
      icon: TrendingUp,
      action: "Set up auto-outreach"
    },
    {
      id: 3,
      type: 'scoring',
      message: "Consider adjusting company size weight in scoring algorithm",
      confidence: 76,
      icon: Users,
      action: "Update scoring"
    }
  ]);

  const [quickActions] = useState([
    { label: "Find leads like my best converters", confidence: 94 },
    { label: "Score leads with new pattern data", confidence: 88 },
    { label: "Export hot leads for outreach", confidence: 92 },
    { label: "Analyze conversion bottlenecks", confidence: 85 }
  ]);

  const handleSuggestionClick = (suggestion: any) => {
    behaviorTracker.trackAction('feature_use', 'lead_ai_suggestion', {
      suggestionType: suggestion.type,
      suggestionId: suggestion.id,
      action: suggestion.action
    });
  };

  const handleQuickAction = (action: string) => {
    behaviorTracker.trackAction('feature_use', 'lead_quick_action', {
      action,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>Lead Intelligence AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Learning Status */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Learning Status</h4>
          <p className="text-sm text-blue-700">
            Conversion accuracy: <span className="font-semibold">{insights.averageScoreAccuracy}%</span>
          </p>
          <p className="text-sm text-blue-700">
            Best source: <span className="font-semibold">{insights.topSource}</span>
          </p>
          <div className="mt-2 text-xs text-blue-600">
            Status: {insights.learningProgress}
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Smart Insights</h4>
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

        {/* Performance Summary */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Current Performance</h4>
          <div className="space-y-1">
            <p className="text-sm text-green-700">
              Conversion Rate: <span className="font-semibold">{insights.conversionRate}</span>
            </p>
            <p className="text-sm text-green-700">
              Best Contact Time: <span className="font-semibold">{insights.bestTimeToContact}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadAIAssistant;
