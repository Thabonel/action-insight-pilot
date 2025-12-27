
import React from 'react';
import AnalyticsAIAssistant from '@/components/analytics/AnalyticsAIAssistant';
import IntelligentDashboards from '@/components/analytics/IntelligentDashboards';
import PerformanceInsights from '@/components/analytics/PerformanceInsights';
import PredictiveAnalytics from '@/components/analytics/PredictiveAnalytics';
import ReportingFeatures from '@/components/analytics/ReportingFeatures';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const Analytics: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
        <p className="text-gray-600 mt-2">AI-powered analytics that predict performance and suggest optimizations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Assistant */}
        <div className="lg:col-span-1">
          <AnalyticsAIAssistant />
        </div>

        {/* Intelligent Dashboards */}
        <div className="lg:col-span-2">
          <IntelligentDashboards />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Performance Insights */}
        <PerformanceInsights />

        {/* Predictive Analytics */}
        <PredictiveAnalytics />
      </div>

      {/* Reporting Features */}
      <ReportingFeatures />
      <PageHelpModal helpKey="analytics" />
    </div>
  );
};

export default Analytics;
