import React, { useEffect, useState } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import AIGreeting from '@/components/dashboard/AIGreeting';
import ChatResponse from '@/components/dashboard/ChatResponse';
import LearningInsights from '@/components/dashboard/LearningInsights';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import SystemOverviewCards from '@/components/dashboard/SystemOverviewCards';

const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState(behaviorTracker.getInsights());

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'dashboard', { section: 'main' });
    
    // Update insights every 30 seconds
    const interval = setInterval(() => {
      setInsights(behaviorTracker.getInsights());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AI Marketing Command Center</h1>
        <p className="mt-2 text-slate-600">
          Your intelligent marketing automation platform is learning your patterns and optimizing for success.
        </p>
      </div>

      {/* System Overview Cards */}
      <SystemOverviewCards />

      {/* AI Greeting */}
      <AIGreeting />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActionGrid />
        </div>
        
        {/* Learning Insights */}
        <LearningInsights insights={insights} />
      </div>

      {/* Chat Response */}
      <ChatResponse />
    </div>
  );
};

export default Dashboard;
