import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardChatInterface from '@/components/dashboard/DashboardChatInterface';
import { PageHelpModal } from '@/components/common/PageHelpModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';

interface CampaignInfo {
  id: string;
  name: string;
  type: string;
  status: string;
}

const ConversationalDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const campaignId = searchParams.get('campaignId');
  const [campaignInfo, setCampaignInfo] = useState<CampaignInfo | null>(null);

  // Fetch campaign info if campaignId is provided
  useEffect(() => {
    const fetchCampaignInfo = async () => {
      if (!campaignId || !user) return;

      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('id, name, type, status')
          .eq('id', campaignId)
          .eq('created_by', user.id)
          .single();

        if (!error && data) {
          setCampaignInfo(data);
        }
      } catch (error) {
        logger.error('Failed to fetch campaign info', { error, campaignId, userId: user?.id });
      }
    };

    fetchCampaignInfo();
  }, [campaignId, user]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0B0D10]">
      <div className="bg-white dark:bg-[#151A21] px-6 py-4 border-b border-gray-200 dark:border-[#273140] flex-shrink-0">
        {campaignInfo ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold dark:text-[#E9EEF5]">
                Planning: {campaignInfo.name}
              </h1>
              <Badge variant="secondary" className="capitalize">
                {campaignInfo.type.replace('_', ' ')}
              </Badge>
              <Badge
                variant={campaignInfo.status === 'active' ? 'default' : 'outline'}
                className={campaignInfo.status === 'active' ? 'bg-green-100 text-green-700' : ''}
              >
                {campaignInfo.status}
              </Badge>
            </div>
            <p className="text-muted-foreground dark:text-[#94A3B8]">
              Chat with your AI assistant to develop strategy and content for this campaign
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-2 dark:text-[#E9EEF5]">Conversational Dashboard</h1>
            <p className="text-muted-foreground dark:text-[#94A3B8]">
              Chat with your AI assistant to get insights and manage your marketing
            </p>
          </>
        )}
      </div>

      <DashboardChatInterface campaignId={campaignId || undefined} />
      <PageHelpModal helpKey="conversationalDashboard" />
    </div>
  );
};

export default ConversationalDashboard;
