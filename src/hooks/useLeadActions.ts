
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export const useLeadActions = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const exportLeads = async (format: 'csv' | 'json' = 'csv') => {
    setIsExporting(true);
    try {
      const response = await apiClient.exportLeads(format);
      
      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], { 
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
      
      if (response.success) {
        const { synced_count, new_leads, updated_leads } = response.data;
        toast({
          title: "Sync Successful",
          description: `Synced ${synced_count} leads (${new_leads} new, ${updated_leads} updated)`,
        });
        return response.data;
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
