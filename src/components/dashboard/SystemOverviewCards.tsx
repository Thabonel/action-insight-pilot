
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const SystemOverviewCards: React.FC = () => {
  const systemCards = [
    {
      title: 'System Status',
      status: 'Operational',
      statusType: 'success' as const,
      icon: CheckCircle,
      lastChecked: new Date().toLocaleTimeString(),
      details: 'All services running normally'
    },
    {
      title: 'Active Users',
      status: '1',
      statusType: 'info' as const,
      icon: Users,
      lastChecked: 'Live',
      details: 'Current session active'
    },
    {
      title: 'AI Assistant',
      status: 'Ready',
      statusType: 'success' as const,
      icon: Zap,
      lastChecked: 'Connected',
      details: 'Processing queries normally'
    },
    {
      title: 'Performance',
      status: 'Good',
      statusType: 'success' as const,
      icon: TrendingUp,
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

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {systemCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="border-gray-200 shadow-sm bg-white system-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${getIconColor(card.statusType)} flex-shrink-0`} />
                  <h3 className="font-medium text-gray-900 text-sm truncate">{card.title}</h3>
                </div>
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
                  <Clock className="h-3 w-3 flex-shrink-0" />
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
