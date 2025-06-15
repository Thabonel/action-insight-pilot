
import React from 'react';
import { Calendar, MessageSquare, Settings as SettingsIcon, TrendingUp } from 'lucide-react';

export interface Insight {
  title: string;
  value: number;
}

interface InsightsCardsProps {
  insights: Insight[];
}

const InsightsCards: React.FC<InsightsCardsProps> = ({ insights }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {insights.map((insight, index) => {
        const icons = [Calendar, MessageSquare, SettingsIcon, TrendingUp];
        const colors = ['text-blue-600', 'text-green-500', 'text-purple-600', 'text-orange-500'];
        const Icon = icons[index % icons.length];
        const colorClass = colors[index % colors.length];

        return (
          <div key={insight.title} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${colorClass}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-slate-600 truncate">
                      {insight.title}
                    </dt>
                    <dd className="text-lg font-medium text-slate-900">
                      {insight.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InsightsCards;
