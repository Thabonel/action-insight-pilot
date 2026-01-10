
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RealInsights } from '@/types/insights';

interface QuickActionGridProps {
  insights: RealInsights | null;
}

const QuickActionGrid: React.FC<QuickActionGridProps> = ({ insights }) => {
  const navigate = useNavigate();

  const getPersonalizedActions = () => {
    const baseActions = [
      {
        label: 'AI',
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
        label: '+',
        title: 'Create Campaign',
        description: 'Start new marketing campaign',
        action: () => navigate('/app/campaign-management'),
        color: 'bg-green-500 hover:bg-green-600',
        priority: 2
      },
      {
        label: 'L',
        title: 'View Leads',
        description: 'Manage lead pipeline',
        action: () => navigate('/app/leads'),
        color: 'bg-purple-500 hover:bg-purple-600',
        priority: 3
      },
      {
        label: 'A',
        title: 'Analytics',
        description: 'View performance metrics',
        action: () => navigate('/app/analytics'),
        color: 'bg-orange-500 hover:bg-orange-600',
        priority: 4
      }
    ];

    // Add contextual actions based on insights
    const contextualActions: typeof baseActions = [];

    if (insights?.recentActivities && insights.recentActivities.length > 0) {
      contextualActions.push({
        label: 'C',
        title: 'Continue Work',
        description: 'Resume recent activities',
        action: () => navigate('/app/campaign-management'),
        color: 'bg-indigo-500 hover:bg-indigo-600',
        priority: 1.5
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
              className={`h-40 p-4 ${action.color} hover:text-white text-white border-0 flex flex-col items-center justify-center text-center space-y-2 overflow-hidden`}
              onClick={action.action}
            >
              <span className="h-6 w-6 flex-shrink-0 font-bold text-lg">{action.label}</span>
              <div className="flex flex-col items-center space-y-1 w-full">
                <div className="text-sm font-medium leading-tight text-center whitespace-normal break-words hyphens-auto w-full px-1">
                  {action.title}
                </div>
                <div className="text-xs opacity-90 leading-tight text-center whitespace-normal break-words hyphens-auto w-full px-1">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>

        {!insights && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-700">
              <span className="text-sm">Actions will personalize as you use the platform</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActionGrid;
