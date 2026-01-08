
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProposalFormData, Proposal, GeneratedProposal } from '@/types/proposals';
import { useProposalTemplates } from '@/hooks/useProposalTemplates';

export const useProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [generatedProposal, setGeneratedProposal] = useState<GeneratedProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use the new proposal templates hook
  const { 
    templates: templatesList, 
    loading: templatesLoading, 
    error: templatesError,
    getTemplate 
  } = useProposalTemplates();

  // Convert templates array to the expected object format for backward compatibility
  const templates = templatesList.reduce((acc, template) => {
    acc[template.id] = {
      id: template.id,
      name: template.name,
      description: template.description,
      sections: template.template_content.sections?.map(s => s.title) || [],
      default_services: template.template_content.default_services || [],
      category: template.category
    };
    return acc;
  }, {} as Record<string, { id: string; name: string; description: string; sections: string[]; default_services: string[]; category: string }>);

  const generateProposal = async (formData: ProposalFormData) => {
    setLoading(true);
    try {
      console.log('Generating proposal with data:', formData);
      
      // Get the selected template
      const selectedTemplate = getTemplate(formData.template_type);
      if (!selectedTemplate) {
        throw new Error('Selected template not found');
      }

      // Call AI edge function to generate actual proposal content
      const { data, error } = await supabase.functions.invoke('full-content-generator', {
        body: {
          type: 'proposal',
          brief: {
            template_type: formData.template_type,
            client_company: formData.client_info.company_name,
            client_industry: formData.client_info.industry,
            project_description: formData.project_details.description,
            services: formData.project_details.services,
            budget_range: formData.budget_range,
            duration: formData.project_details.duration,
            call_transcript: formData.call_transcript
          }
        }
      });

      if (error) throw error;

      const generatedProposal: GeneratedProposal = {
        id: crypto.randomUUID(),
        template_type: formData.template_type,
        client_info: formData.client_info,
        content: {
          executive_summary: data.content?.executive_summary || `Professional ${selectedTemplate.name.toLowerCase()} services for ${formData.client_info.company_name}.`,
          proposed_services: data.content?.proposed_services || selectedTemplate.template_content.sections?.map(section => 
            `${section.title}: ${section.content}`
          ).join('\n\n') || 'Custom services based on your requirements.'
        },
        pricing: data.pricing || selectedTemplate.template_content.default_services?.map((service, index) => ({
          item: service,
          description: `Professional ${service.toLowerCase()} services`,
          price: formData.budget_range.min + (index * 1000),
          quantity: 1
        })) || [],
        timeline: data.timeline || selectedTemplate.template_content.sections?.map((section, index) => ({
          phase: section.title,
          duration: `${index + 1} week${index > 0 ? 's' : ''}`,
          deliverables: [`${section.title} completion`]
        })) || [],
        terms: {
          payment_terms: selectedTemplate.template_content.pricing_structure === 'monthly_retainer' 
            ? 'Monthly retainer payment' 
            : '50% upfront, 50% upon completion',
          warranty: '90-day warranty on all deliverables'
        },
        created_at: new Date().toISOString(),
        status: 'draft'
      };

      setGeneratedProposal(generatedProposal);
      toast({
        title: "Proposal Generated",
        description: "Your proposal has been successfully generated using AI!",
      });
      return true;
    } catch (error) {
      console.error('Error generating proposal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate proposal. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const saveProposal = async (proposal: GeneratedProposal) => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .insert([{
          client_name: proposal.client_info.company_name,
          template_type: proposal.template_type,
          content: proposal.content,
          pricing: proposal.pricing,
          timeline: proposal.timeline,
          terms: proposal.terms,
          status: proposal.status,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Proposal Saved",
        description: "Your proposal has been saved successfully!",
      });
      
      await loadProposals();
    } catch (error) {
      console.error('Error saving proposal:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportProposal = async (proposalId: string, format: string) => {
    try {
      toast({
        title: "Export Started",
        description: `Your proposal is being exported as ${format.toUpperCase()}`,
      });
      
      // Get proposal data first
      const proposal = proposals.find(p => p.id === proposalId) || generatedProposal;
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      
      // Generate actual export content
      const exportContent = format === 'pdf' 
        ? await generatePDFExport(proposal)
        : await generateWordExport(proposal);
      
      const blob = new Blob([exportContent], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal-${proposalId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generatePDFExport = async (proposal: GeneratedProposal) => {
    // Basic text export for now - could be enhanced with proper PDF generation
    return `
PROPOSAL FOR ${proposal.client_info?.company_name || proposal.client_name}

${proposal.content?.executive_summary || ''}

PROPOSED SERVICES:
${proposal.content?.proposed_services || ''}

PRICING:
${(proposal.pricing as Array<{ item: string; price: number }>)?.map(item => `${item.item}: $${item.price}`).join('\n') || ''}

TIMELINE:
${(proposal.timeline as Array<{ phase: string; duration: string }>)?.map(phase => `${phase.phase}: ${phase.duration}`).join('\n') || ''}

TERMS:
${proposal.terms?.payment_terms || ''}
${proposal.terms?.warranty || ''}
    `;
  };

  const generateWordExport = async (proposal: GeneratedProposal) => {
    return generatePDFExport(proposal); // Same content for now
  };

  const loadProposals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProposals: Proposal[] = (data || []).map(proposal => ({
        id: proposal.id,
        client_name: proposal.client_name,
        template_type: proposal.template_type,
        status: proposal.status,
        created_at: proposal.created_at,
        value: proposal.pricing?.reduce((total: number, item) => total + (item.price * (item.quantity || 1)), 0) || 0
      }));

      setProposals(mappedProposals);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast({
        title: "Error",
        description: "Failed to load proposals. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadProposals();
    }
  }, [user]);

  return {
    templates,
    proposals,
    generatedProposal,
    loading,
    templatesLoading,
    backendAvailable: !templatesError, // Available if no error loading templates
    generateProposal,
    saveProposal,
    exportProposal,
    loadProposals,
    refreshTemplates: () => {}, // Templates are auto-refreshed by the hook
    retryConnection: () => {} // No longer needed with direct Supabase connection
  };
};
