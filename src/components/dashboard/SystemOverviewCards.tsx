
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users, BarChart3, Zap, TrendingUp, Activity } from 'lucide-react';

const SystemOverviewCards: React.FC = () => {
  const metrics = [
    {
      title: 'Active Campaigns',
      value: '12',
      change: '+3 this week',
      trend: 'up',
      icon: Zap,
      color: 'blue',
      performance: 85
    },
    {
      title: 'Lead Generation',
      value: '1,247',
      change: '+12% vs last month',
      trend: 'up',
      icon: Users,
      color: 'green',
      performance: 92
    },
    {
      title: 'Content Engagement',
      value: '89.2%',
      change: '+5.3% improvement',
      trend: 'up',
      icon: BarChart3,
      color: 'purple',
      performance: 89
    },
    {
      title: 'Email Performance',
      value: '24.8%',
      change: 'Open rate stable',
      trend: 'stable',
      icon: Mail,
      color: 'orange',
      performance: 76
    },
    {
      title: 'Social Reach',
      value: '45.2K',
      change: '+18% this week',
      trend: 'up',
      icon: Activity,
      color: 'pink',
      performance: 94
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: 'All systems operational',
      trend: 'up',
      icon: TrendingUp,
      color: 'emerald',
      performance: 99
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
      green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
      purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
      orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
      pink: 'from-pink-500 to-pink-600 text-pink-600 bg-pink-50',
      emerald: 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const colorClasses = getColorClasses(metric.color);
        const [gradientFrom, gradientTo, textColor, bgColor] = colorClasses.split(' ');
        
        return (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-5`}></div>
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 truncate">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${bgColor}`}>
                  <Icon className={`h-4 w-4 ${textColor}`} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                  {metric.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <p className="text-xs text-slate-500">{metric.change}</p>
                
                {/* Performance bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Performance</span>
                    <span className="text-xs font-medium text-slate-600">{metric.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} h-1.5 rounded-full transition-all duration-1000`}
                      style={{ width: `${metric.performance}%` }}
                    ></div>
                  </div>
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
