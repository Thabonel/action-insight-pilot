
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface SyncResponse {
  synced_count: number;
  new_leads: number;
  updated_leads: number;
  sync_time: string;
  sources: string[];
}

export const useLeadActions = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const exportLeads = async (format: 'csv' | 'json' = 'csv') => {
    setIsExporting(true);
    try {
      const response = await apiClient.exportLeads(format);
      
      if (response.success && response.data) {
        // Create download link - ensure data is properly typed as string
        const dataString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        const blob = new Blob([dataString], { 
          type: format === 'csv' ? 'text/csv' : 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: `Leads exported as ${format.toUpperCase()} file`,
        });
      } else {
        throw new Error(response.error || 'Export failed');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsExporting(false);
    }
  };

  const syncLeads = async () => {
    setIsSyncing(true);
    try {
      const response = await apiClient.syncLeads();
      
      if (response.success && response.data) {
        // Properly type the response data
        const syncData = response.data as SyncResponse;
        const { synced_count, new_leads, updated_leads } = syncData;
        toast({
          title: "Sync Successful",
          description: `Synced ${synced_count} leads (${new_leads} new, ${updated_leads} updated)`,
        });
        return syncData;
      } else {
        throw new Error(response.error || 'Sync failed');
      }
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    exportLeads,
    syncLeads,
    isExporting,
    isSyncing,
  };
};
