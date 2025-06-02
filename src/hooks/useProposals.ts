
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { ProposalFormData, Proposal, GeneratedProposal } from '@/types/proposals';

export const useProposals = () => {
  const [templates, setTemplates] = useState<Record<string, any>>({});
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      const response = await apiClient.getProposalTemplates();
      if (response.success) {
        setTemplates(response.data || {});
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadProposals = async () => {
    try {
      const response = await apiClient.getProposals();
      if (response.success) {
        setProposals((response.data as Proposal[]) || []);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  const generateProposal = async (formData: ProposalFormData) => {
    setLoading(true);
    try {
      const response = await apiClient.generateProposal(formData);
      if (response.success) {
        setGeneratedProposal(response.data as GeneratedProposal);
        toast({
          title: "Proposal Generated",
          description: "Your proposal has been successfully generated!",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to generate proposal",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate proposal. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const exportProposal = async (proposalId: string, format: string) => {
    try {
      const response = await apiClient.exportProposal(proposalId, format);
      if (response.success && response.data) {
        const exportData = response.data as { download_url?: string };
        toast({
          title: "Export Started",
          description: `Your proposal is being exported as ${format.toUpperCase()}`,
        });
        if (exportData.download_url) {
          window.open(exportData.download_url, '_blank');
        }
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTemplates();
    loadProposals();
  }, []);

  return {
    templates,
    proposals,
    generatedProposal,
    loading,
    generateProposal,
    exportProposal,
    loadProposals
  };
};
