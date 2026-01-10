
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SystemOverviewCards: React.FC = () => {
  const systemCards = [
    {
      title: 'System Status',
      status: 'Operational',
      statusType: 'success' as const,
      lastChecked: new Date().toLocaleTimeString(),
      details: 'All services running normally'
    },
    {
      title: 'Active Users',
      status: '1',
      statusType: 'info' as const,
      lastChecked: 'Live',
      details: 'Current session active'
    },
    {
      title: 'AI Assistant',
      status: 'Ready',
      statusType: 'success' as const,
      lastChecked: 'Connected',
      details: 'Processing queries normally'
    },
    {
      title: 'Performance',
      status: 'Good',
      statusType: 'success' as const,
      lastChecked: 'Real-time',
      details: 'Response times optimal'
    }
  ];

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {systemCards.map((card, index) => {
        return (
          <Card key={index} className="border-gray-200 shadow-sm bg-white system-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 text-sm truncate">{card.title}</h3>
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-1 ${getStatusColor(card.statusType)} flex-shrink-0`}
                >
                  {card.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-600 break-words">{card.details}</p>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span className="truncate">{card.lastChecked}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SystemOverviewCards;
