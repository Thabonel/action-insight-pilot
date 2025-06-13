
import React from 'react';
import { Calendar, MessageSquare, Settings as SettingsIcon } from 'lucide-react';

interface InsightsCardsProps {
  insights: {
    sessionDuration: number;
    totalActions: number;
    productivityScore: number;
    topFeatures: string[];
  };
}

const InsightsCards: React.FC<InsightsCardsProps> = ({ insights }) => {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-600 truncate">
                  Session Duration
                </dt>
                <dd className="text-lg font-medium text-slate-900">
                  {formatDuration(insights.sessionDuration)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-600 truncate">
                  Actions Taken
                </dt>
                <dd className="text-lg font-medium text-slate-900">
                  {insights.totalActions}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <SettingsIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-600 truncate">
                  Productivity Score
                </dt>
                <dd className="text-lg font-medium text-slate-900">
                  {insights.productivityScore}%
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-600 truncate">
                  Top Feature
                </dt>
                <dd className="text-lg font-medium text-slate-900 capitalize">
                  {insights.topFeatures[0] || 'Dashboard'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsCards;
