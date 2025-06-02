
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { ProposalFormData, Proposal, GeneratedProposal } from '@/types/proposals';

interface Template {
  id: string;
  name: string;
  description: string;
  sections: string[];
  default_services?: string[];
  category?: string;
}

interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  error?: string;
}

export const useProposals = () => {
  const [templates, setTemplates] = useState<Record<string, Template>>({});
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const { toast } = useToast();

  const loadTemplates = async (retryCount = 0) => {
    setTemplatesLoading(true);
    try {
      console.log(`Loading proposal templates from backend... (attempt ${retryCount + 1})`);
      const response: ApiResponse = await apiClient.getProposalTemplates();
      console.log('Templates API response:', response);
      
      if (response.success && response.data) {
        console.log('Templates data received:', response.data);
        const templatesData = (response.data as any).data || response.data;
        setTemplates(templatesData as Record<string, Template>);
        setBackendAvailable(true);
        console.log('Templates set successfully:', templatesData);
        toast({
          title: "Templates Loaded",
          description: `${Object.keys(templatesData).length} templates loaded from server`,
        });
      } else {
        throw new Error(response.error || 'Failed to load templates from backend');
      }
    } catch (error) {
      console.error('Error loading templates from backend:', error);
      setBackendAvailable(false);
      
      if (retryCount < 2) {
        console.log(`Retrying template load... (attempt ${retryCount + 2})`);
        setTimeout(() => loadTemplates(retryCount + 1), 2000 * (retryCount + 1));
        return;
      }
      
      // Clear templates and show error - no fallback
      setTemplates({});
      toast({
        title: "Backend Connection Failed",
        description: `Unable to connect to server. Please check backend status.`,
        variant: "destructive",
      });
    } finally {
      setTemplatesLoading(false);
    }
  };

  const loadProposals = async () => {
    try {
      const response: ApiResponse = await apiClient.getProposals();
      if (response.success) {
        setProposals((response.data as Proposal[]) || []);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
      if (backendAvailable) {
        toast({
          title: "Error Loading Proposals",
          description: "Failed to load saved proposals",
          variant: "destructive",
        });
      }
    }
  };

  const generateProposal = async (formData: ProposalFormData) => {
    setLoading(true);
    try {
      console.log('Generating proposal with data:', formData);
      const response: ApiResponse = await apiClient.generateProposal(formData);
      
      if (response.success) {
        setGeneratedProposal(response.data as GeneratedProposal);
        toast({
          title: "Proposal Generated",
          description: "Your proposal has been successfully generated!",
        });
        return true;
      } else {
        console.error('Proposal generation failed:', response.error);
        toast({
          title: "Error",
          description: response.error || "Failed to generate proposal",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
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
      const response: ApiResponse = await apiClient.exportProposal(proposalId, format);
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

  const retryConnection = () => {
    loadTemplates();
    loadProposals();
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
    templatesLoading,
    backendAvailable,
    generateProposal,
    exportProposal,
    loadProposals,
    refreshTemplates: loadTemplates,
    retryConnection
  };
};
