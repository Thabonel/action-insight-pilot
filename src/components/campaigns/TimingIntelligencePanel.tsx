
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, TrendingUp, Zap } from 'lucide-react';

const TimingIntelligencePanel: React.FC = () => {
  const timingData = {
    averagePlanningTime: '2.3 hours',
    bestLaunchDays: ['Tuesday', 'Thursday'],
    bestLaunchTimes: ['10:00 AM', '2:00 PM'],
    successRateByTiming: {
      morning: 85,
      afternoon: 72,
      evening: 45
    },
    nextRecommendation: {
      day: 'Tuesday',
      time: '10:30 AM',
      confidence: 89
    }
  };

  const weeklyPattern = [
    { day: 'Mon', success: 65, campaigns: 8 },
    { day: 'Tue', success: 85, campaigns: 12 },
    { day: 'Wed', success: 72, campaigns: 10 },
    { day: 'Thu', success: 88, campaigns: 15 },
    { day: 'Fri', success: 68, campaigns: 9 },
    { day: 'Sat', success: 45, campaigns: 3 },
    { day: 'Sun', success: 38, campaigns: 2 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <span>Timing Intelligence</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Planning Pattern */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Your Planning Pattern</span>
          </h4>
          <p className="text-sm text-blue-700">
            You typically spend <strong>{timingData.averagePlanningTime}</strong> from 
            planning to launch. This is 23% faster than average users.
          </p>
        </div>

        {/* Weekly Success Pattern */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Weekly Success Pattern</span>
          </h4>
          <div className="space-y-2">
            {weeklyPattern.map((day) => (
              <div key={day.day} className="flex items-center space-x-3">
                <span className="w-8 text-sm font-medium text-gray-600">{day.day}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${day.success}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{day.success}%</span>
                <span className="text-xs text-gray-500 w-16">{day.campaigns} campaigns</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time of Day Performance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Time of Day Performance</h4>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(timingData.successRateByTiming).map(([time, rate]) => (
              <div key={time} className="text-center bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-bold text-gray-900">{rate}%</div>
                <div className="text-sm text-gray-600 capitalize">{time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Recommendation */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Next Optimal Launch</span>
          </h4>
          <p className="text-sm text-green-700">
            <strong>{timingData.nextRecommendation.day} at {timingData.nextRecommendation.time}</strong>
          </p>
          <p className="text-xs text-green-600 mt-1">
            {timingData.nextRecommendation.confidence}% confidence based on your patterns
          </p>
        </div>

        {/* Best Performing Times */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2">Your Best Launch Times</h4>
          <div className="flex flex-wrap gap-2">
            {timingData.bestLaunchDays.map((day) => (
              <span key={day} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {day}s
              </span>
            ))}
            {timingData.bestLaunchTimes.map((time) => (
              <span key={time} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {time}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimingIntelligencePanel;
