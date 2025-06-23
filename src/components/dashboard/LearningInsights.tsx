
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { RealInsights } from '@/types/insights';

interface LearningInsightsProps {
  insights: RealInsights | null;
}

const LearningInsights: React.FC<LearningInsightsProps> = ({ insights }) => {
  const generateInsights = () => {
    if (!insights) return [];

    const generatedInsights = [];

    // Activity-based insights
    if (insights.recentActivities && insights.recentActivities.length > 0) {
      generatedInsights.push({
        type: 'positive',
        title: 'Recent Activity Detected',
        description: `You've completed ${insights.recentActivities.length} actions recently`,
        action: 'View Activity Details',
        priority: 'medium'
      });
    }

    // Suggestions-based insights
    if (insights.suggestions && insights.suggestions.length > 0) {
      generatedInsights.push({
        type: 'info',
        title: 'Optimization Suggestions',
        description: `${insights.suggestions.length} suggestions available to improve your campaigns`,
        action: 'View Suggestions',
        priority: 'low'
      });
    }

    // Trends-based insights
    if (insights.trends) {
      const { positive, negative, neutral } = insights.trends;
      if (positive > negative) {
        generatedInsights.push({
          type: 'positive',
          title: 'Positive Trends',
          description: `${positive} positive trends detected in your performance`,
          action: 'Analyze Trends',
          priority: 'low'
        });
      }
    }

    // Default helpful insight
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        type: 'info',
        title: 'Getting Started',
        description: 'Ask me anything about your marketing campaigns, leads, or performance metrics',
        action: 'Start Conversation',
        priority: 'medium'
      });
    }

    return generatedInsights.slice(0, 3); // Limit to 3 insights
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Brain className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-l-green-500 bg-green-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const displayInsights = generateInsights();

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 animate-pulse" />
            <span>Learning Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayInsights.map((insight, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border-l-4 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                </div>
                {insight.priority === 'medium' && (
                  <Badge variant="outline" className="text-xs">Important</Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-3">{insight.description}</p>
              <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                {insight.action}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          ))}

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Updated {new Date().toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>Learning from your usage</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningInsights;
