
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface ConversationalData {
  campaigns: any[];
  leads: any[];
  insights: any[];
  metrics: any;
}

export const useConversationalDashboard = () => {
  const [data, setData] = useState<ConversationalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all necessary data for the conversational dashboard
      const [campaignsResult, leadsResult, analyticsResult] = await Promise.all([
        apiClient.getCampaigns(),
        apiClient.getLeads(),
        apiClient.getAnalytics()
      ]);

      setData({
        campaigns: campaignsResult.success ? campaignsResult.data || [] : [],
        leads: leadsResult.success ? leadsResult.data || [] : [],
        insights: analyticsResult.success ? analyticsResult.data?.insights || [] : [],
        metrics: analyticsResult.success ? analyticsResult.data?.metrics || {} : {}
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};
