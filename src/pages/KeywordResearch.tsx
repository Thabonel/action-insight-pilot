import React from 'react';
import { KeywordResearchPanel } from '@/components/keywords/KeywordResearchPanel';
import { PageHelpModal } from '@/components/common/PageHelpModal';

export const KeywordResearch: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <KeywordResearchPanel />
      <PageHelpModal helpKey="keywordResearch" />
    </div>
  );
};