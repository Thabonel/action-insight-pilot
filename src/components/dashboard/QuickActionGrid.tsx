
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Mail, Users, BarChart3, Settings, TrendingUp } from 'lucide-react';
import { behaviorTracker } from '@/lib/behavior-tracker';

interface QuickActionGridProps {
  insights: {
    totalActions: number;
    sessionDuration: number;
    topFeatures: string[];
    productivityScore: number;
    recommendations: string[];
  };
}

const QuickActionGrid: React.FC<QuickActionGridProps> = ({ insights }) => {
  const baseActions = [
    {
      id: 'create_campaign',
      title: 'Create Campaign',
      description: 'Launch new marketing campaign',
      icon: Zap,
      color: 'blue',
      successRate: 87,
      lastUsed: '2 hours ago'
    },
    {
      id: 'analyze_leads',
      title: 'Analyze Leads',
      description: 'Review lead quality & conversion',
      icon: Users,
      color: 'green',
      successRate: 94,
      lastUsed: '1 day ago'
    },
    {
      id: 'email_campaign',
      title: 'Email Campaign',
      description: 'Design & send email sequences',
      icon: Mail,
      color: 'orange',
      successRate: 76,
      lastUsed: '3 hours ago'
    },
    {
      id: 'performance_review',
      title: 'Performance Review',
      description: 'Analyze campaign metrics',
      icon: BarChart3,
      color: 'purple',
      successRate: 92,
      lastUsed: '30 minutes ago'
    },
    {
      id: 'optimize_content',
      title: 'Optimize Content',
      description: 'Improve content performance',
      icon: TrendingUp,
      color: 'emerald',
      successRate: 88,
      lastUsed: '1 hour ago'
    },
    {
      id: 'system_settings',
      title: 'System Settings',
      description: 'Configure automation rules',
      icon: Settings,
      color: 'gray',
      successRate: 65,
      lastUsed: '1 week ago'
    }
  ];

  // Reorder based on user's top features and success rates
  const actions = baseActions
    .map(action => ({
      ...action,
      priority: insights.topFeatures.includes(action.id) ? 1 : 0,
      combinedScore: (action.successRate * 0.7) + (insights.topFeatures.includes(action.id) ? 30 : 0)
    }))
    .sort((a, b) => b.combinedScore - a.combinedScore);

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 border-blue-200 hover:border-blue-300',
      green: 'from-green-500 to-green-600 border-green-200 hover:border-green-300',
      orange: 'from-orange-500 to-orange-600 border-orange-200 hover:border-orange-300',
      purple: 'from-purple-500 to-purple-600 border-purple-200 hover:border-purple-300',
      emerald: 'from-emerald-500 to-emerald-600 border-emerald-200 hover:border-emerald-300',
      gray: 'from-gray-500 to-gray-600 border-gray-200 hover:border-gray-300'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleActionClick = (actionId: string) => {
    behaviorTracker.trackAction('planning', actionId, { source: 'quick_actions' });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>Smart Actions</span>
        </CardTitle>
        <p className="text-sm text-slate-600">Optimized for your workflow</p>
      </CardHeader>
      
      <CardContent className="grid gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const colorClasses = getColorClasses(action.color);
          const isTopPerformer = action.successRate >= 85;
          
          return (
            <Button
              key={action.id}
              variant="outline"
              onClick={() => handleActionClick(action.id)}
              className={`h-auto p-4 justify-start hover:shadow-md transition-all duration-200 ${colorClasses.split(' ').slice(2).join(' ')}`}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses.split(' ').slice(0, 2).join(' ')} text-white`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-900">{action.title}</span>
                    {isTopPerformer && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full" title="High success rate"></div>
                    )}
                    {action.priority === 1 && (
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Frequently used"></div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{action.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">Success: {action.successRate}%</span>
                    <span className="text-xs text-slate-400">{action.lastUsed}</span>
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuickActionGrid;
