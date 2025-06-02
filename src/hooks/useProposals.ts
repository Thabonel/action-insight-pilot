
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  }, {} as Record<string, any>);

  const generateProposal = async (formData: ProposalFormData) => {
    setLoading(true);
    try {
      console.log('Generating proposal with data:', formData);
      
      // Get the selected template
      const selectedTemplate = getTemplate(formData.template_type);
      if (!selectedTemplate) {
        throw new Error('Selected template not found');
      }

      // Generate a mock proposal based on the template and form data
      const mockProposal: GeneratedProposal = {
        id: crypto.randomUUID(),
        template_type: formData.template_type,
        client_info: formData.client_info,
        content: {
          executive_summary: `This proposal outlines ${selectedTemplate.name.toLowerCase()} services for ${formData.client_info.company_name}. ${selectedTemplate.description}`,
          proposed_services: selectedTemplate.template_content.sections?.map(section => 
            `${section.title}: ${section.content}`
          ).join('\n\n') || 'Custom services based on your requirements.'
        },
        pricing: selectedTemplate.template_content.default_services?.map((service, index) => ({
          item: service,
          description: `Professional ${service.toLowerCase()} services`,
          price: formData.budget_range.min + (index * 1000),
          quantity: 1
        })) || [],
        timeline: selectedTemplate.template_content.sections?.map((section, index) => ({
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

      setGeneratedProposal(mockProposal);
      toast({
        title: "Proposal Generated",
        description: "Your proposal has been successfully generated!",
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

  const exportProposal = async (proposalId: string, format: string) => {
    try {
      toast({
        title: "Export Started",
        description: `Your proposal is being exported as ${format.toUpperCase()}`,
      });
      
      // Mock export functionality
      const blob = new Blob(['Mock proposal export'], { type: 'text/plain' });
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

  const loadProposals = async () => {
    // Mock proposals for now - could be implemented with Supabase later
    const mockProposals: Proposal[] = [
      {
        id: crypto.randomUUID(),
        client_name: "Sample Corp",
        template_type: "web_development",
        status: "sent",
        created_at: new Date().toISOString(),
        value: 15000
      }
    ];
    setProposals(mockProposals);
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
    exportProposal,
    loadProposals,
    refreshTemplates: () => {}, // Templates are auto-refreshed by the hook
    retryConnection: () => {} // No longer needed with direct Supabase connection
  };
};
