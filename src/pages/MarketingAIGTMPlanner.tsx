import { MarketingAIGTMPlanner } from '@/components/MarketingAIGTMPlanner';
import { PageHelpModal } from '@/components/common/PageHelpModal';

export default function MarketingAIGTMPlannerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <MarketingAIGTMPlanner />
      </div>
      <PageHelpModal helpKey="gtmPlanner" />
    </div>
  );
}