
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

interface RealInsights {
  totalUsers?: number;
  activeFeatures?: string[];
  recentActions?: Array<{
    action: string;
    timestamp: Date;
    feature: string;
  }>;
  systemHealth?: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastCheck: Date;
  };
}

interface LearningInsightsProps {
  insights: RealInsights | null;
}

const LearningInsights: React.FC<LearningInsightsProps> = ({ insights }) => {
  const generateInsights = () => {
    if (!insights) return [];

    const generatedInsights = [];

    // System health insight
    if (insights.systemHealth) {
      const { status, uptime } = insights.systemHealth;
      if (status === 'healthy' && uptime > 0) {
        generatedInsights.push({
          type: 'positive',
          title: 'System Running Smoothly',
          description: `Your system has been running reliably${uptime > 3600 ? ` for ${Math.floor(uptime / 3600)} hours` : ''}`,
          action: 'View System Status',
          priority: 'low'
        });
      } else if (status === 'warning') {
        generatedInsights.push({
          type: 'warning',
          title: 'System Performance Notice',
          description: 'Some features may be running slower than usual',
          action: 'Check System Health',
          priority: 'medium'
        });
      }
    }

    // Activity-based insights
    if (insights.recentActions && insights.recentActions.length > 0) {
      const recentFeatures = [...new Set(insights.recentActions.map(a => a.feature))];
      if (recentFeatures.length === 1) {
        generatedInsights.push({
          type: 'info',
          title: `Focused on ${recentFeatures[0]}`,
          description: `You've been actively working with ${recentFeatures[0].toLowerCase()} features`,
          action: 'Explore More Features',
          priority: 'low'
        });
      } else if (recentFeatures.length > 2) {
        generatedInsights.push({
          type: 'positive',
          title: 'Multi-Feature Usage',
          description: `You're effectively using ${recentFeatures.length} different features`,
          action: 'View Usage Analytics',
          priority: 'low'
        });
      }
    }

    // Feature availability insight
    if (insights.activeFeatures && insights.activeFeatures.length > 0) {
      generatedInsights.push({
        type: 'info',
        title: 'Available Features',
        description: `${insights.activeFeatures.length} features are ready to help optimize your marketing`,
        action: 'Explore Features',
        priority: 'low'
      });
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
