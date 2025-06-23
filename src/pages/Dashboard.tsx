
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemOverviewCards from '@/components/dashboard/SystemOverviewCards';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import EnhancedChatInterface from '@/components/dashboard/EnhancedChatInterface';
import { RealInsights } from '@/types/insights';

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

  // Mock insights for QuickActionGrid - matches RealInsights interface
  const mockInsights: RealInsights = {
    totalActions: 1,
    recentActivities: [
      {
        type: 'dashboard_visit',
        message: 'Visited marketing dashboard',
        timestamp: new Date()
      }
    ],
    suggestions: ['Set up your first campaign', 'Connect your email platform', 'Review analytics'],
    trends: {
      positive: 1,
      negative: 0,
      neutral: 0
    }
  };

  return (
    <div className="space-y-8 p-6 bg-white min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Marketing Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor your campaigns, analyze performance, and optimize your marketing strategy.
        </p>
      </div>

      {/* System Overview Cards */}
      <SystemOverviewCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-black">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart dashboardData={mockDashboardData} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-gray-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-black">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickActionGrid insights={mockInsights} />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced AI Chat Interface */}
      <div>
        <h2 className="text-2xl font-bold text-black mb-4">AI Marketing Assistant</h2>
        <EnhancedChatInterface />
      </div>
    </div>
  );
};

export default Dashboard;
