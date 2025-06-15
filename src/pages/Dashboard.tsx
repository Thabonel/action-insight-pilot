
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemOverviewCards from '@/components/dashboard/SystemOverviewCards';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import EnhancedChatInterface from '@/components/dashboard/EnhancedChatInterface';

const Dashboard: React.FC = () => {
  // Mock dashboard data for the PerformanceChart
  const mockDashboardData = {
    analytics: {},
    campaigns: {},
    leads: {},
    email: {},
    social: {},
    systemStats: {}
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Marketing Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Monitor your campaigns, analyze performance, and optimize your marketing strategy.
        </p>
      </div>

      {/* System Overview Cards */}
      <SystemOverviewCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-slate-900">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart dashboardData={mockDashboardData} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActionGrid />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced AI Chat Interface */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">AI Marketing Assistant</h2>
        <EnhancedChatInterface />
      </div>
    </div>
  );
};

export default Dashboard;
