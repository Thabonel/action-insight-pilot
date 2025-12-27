import React from 'react';
import { FloatingHelpButton } from '@/components/common/FloatingHelpButton';
import { KeywordResearchPanel } from '@/components/keywords/KeywordResearchPanel';

export const KeywordResearch: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <KeywordResearchPanel />
      <FloatingHelpButton helpSection="keywordResearch" />
    </div>
  );
};