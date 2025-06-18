
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  BarChart3, 
  Users, 
  Zap,
  PlusCircle,
  Settings,
  TrendingUp,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

interface QuickActionGridProps {
  insights: RealInsights | null;
}

const QuickActionGrid: React.FC<QuickActionGridProps> = ({ insights }) => {
  const navigate = useNavigate();

  const getPersonalizedActions = () => {
    const baseActions = [
      {
        icon: MessageSquare,
        title: 'Ask AI Assistant',
        description: 'Get instant help with marketing',
        action: () => {
          const chatInput = document.querySelector('input[placeholder*="Ask me about"]') as HTMLInputElement;
          if (chatInput) {
            chatInput.focus();
          }
        },
        color: 'bg-blue-500 hover:bg-blue-600',
        priority: 1
      },
      {
        icon: PlusCircle,
        title: 'Create Campaign',
        description: 'Start new marketing campaign',
        action: () => navigate('/campaigns'),
        color: 'bg-green-500 hover:bg-green-600',
        priority: 2
      },
      {
        icon: Users,
        title: 'View Leads',
        description: 'Manage lead pipeline',
        action: () => navigate('/leads'),
        color: 'bg-purple-500 hover:bg-purple-600',
        priority: 3
      },
      {
        icon: BarChart3,
        title: 'Analytics',
        description: 'View performance metrics',
        action: () => navigate('/analytics'),
        color: 'bg-orange-500 hover:bg-orange-600',
        priority: 4
      }
    ];

    // Add contextual actions based on insights
    const contextualActions = [];

    if (insights?.systemHealth?.status === 'warning' || insights?.systemHealth?.status === 'error') {
      contextualActions.push({
        icon: Settings,
        title: 'System Health',
        description: 'Check system status',
        action: () => navigate('/settings'),
        color: 'bg-yellow-500 hover:bg-yellow-600',
        priority: 0
      });
    }

    if (insights?.activeFeatures && insights.activeFeatures.includes('Campaigns')) {
      contextualActions.push({
        icon: TrendingUp,
        title: 'Campaign Performance',
        description: 'Review active campaigns',
        action: () => navigate('/campaigns'),
        color: 'bg-indigo-500 hover:bg-indigo-600',
        priority: 1.5
      });
    }

    if (insights?.recentActions && insights.recentActions.some(a => a.feature === 'Lead Management')) {
      contextualActions.push({
        icon: Target,
        title: 'Lead Scoring',
        description: 'Continue lead optimization',
        action: () => navigate('/leads'),
        color: 'bg-pink-500 hover:bg-pink-600',
        priority: 2.5
      });
    }

    // Merge and sort by priority
    const allActions = [...baseActions, ...contextualActions]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6); // Limit to 6 actions

    return allActions;
  };

  const actions = getPersonalizedActions();

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`quick-action-card ${action.color} hover:text-white text-white border-0`}
              onClick={action.action}
            >
              <action.icon className="h-5 w-5 flex-shrink-0 mb-2" />
              <div className="text-center w-full">
                <div className="action-title">{action.title}</div>
                <div className="action-description">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {!insights && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-700">
              <Zap className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm break-words">Actions will personalize as you use the platform</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActionGrid;
