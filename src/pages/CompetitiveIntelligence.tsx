
import React from 'react';
import CompetitorTracker from '@/components/competitive/CompetitorTracker';
import CreativeAnalytics from '@/components/competitive/CreativeAnalytics';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const CompetitiveIntelligence: React.FC = () => {
  return (
    <div className="space-y-8 p-6 bg-white min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Competitive Intelligence</h1>
        <p className="text-gray-600 mt-2">
          Track competitor activities, analyze creative strategies, and discover winning ad formats.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <CompetitorTracker />
        <CreativeAnalytics />
      </div>
      <PageHelpModal helpKey="competitiveIntelligence" />
    </div>
  );
};

export default CompetitiveIntelligence;
