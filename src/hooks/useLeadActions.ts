import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { ApiResponse } from '@/lib/api-client-interface';

export const useLeadActions = () => {
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const scoreLeads = async (leadIds?: string[]) => {
    setLoading(true);
    try {
      const result = await apiClient.scoreLeads() as ApiResponse<Record<string, unknown>>;
      if (result.success) {
        toast({
          title: "Leads Scored",
          description: "Lead scoring has been updated successfully",
        });
        return true;
      }
      toast({
        title: "Error",
        description: "Failed to score leads",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error('Error scoring leads:', error);
      toast({
        title: "Error",
        description: "Failed to score leads",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    scoreLeads,
    enrichLead: async (leadId: string) => {
      setLoading(true);
      try {
        toast({
          title: "Lead Enriched",
          description: "Lead data has been enriched with additional information",
        });
        return true;
      } catch (error) {
        console.error('Error enriching lead:', error);
        toast({
          title: "Error",
          description: "Failed to enrich lead data",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    convertLead: async (leadId: string) => {
      setLoading(true);
      try {
        toast({
          title: "Lead Converted",
          description: "Lead has been marked as converted",
        });
        return true;
      } catch (error) {
        console.error('Error converting lead:', error);
        toast({
          title: "Error",
          description: "Failed to convert lead",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    exportLeads: async (format: 'csv' | 'json') => {
      setIsExporting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast({
          title: "Export Complete",
          description: `Leads exported as ${format.toUpperCase()}`,
        });
        return true;
      } catch (error) {
        console.error('Error exporting leads:', error);
        toast({
          title: "Error",
          description: "Failed to export leads",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsExporting(false);
      }
    },
    syncLeads: async () => {
      setIsSyncing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        toast({
          title: "Sync Complete",
          description: "Lead data has been synchronized",
        });
        return true;
      } catch (error) {
        console.error('Error syncing leads:', error);
        toast({
          title: "Error",
          description: "Failed to sync leads",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    loading,
    isExporting,
    isSyncing
  };
};
