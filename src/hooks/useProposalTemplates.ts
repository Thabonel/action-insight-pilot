
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { proposalTemplatesService, ProposalTemplate } from '@/lib/api/proposal-templates-service';

export const useProposalTemplates = () => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const templatesData = await proposalTemplatesService.getTemplates();
      setTemplates(templatesData);
      console.log(`Loaded ${templatesData.length} proposal templates from Supabase`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      console.error('Error loading proposal templates:', err);
      toast({
        title: "Error Loading Templates",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(template => template.category === category);
  };

  const getCategories = () => {
    const categories = [...new Set(templates.map(template => template.category))];
    return categories.sort();
  };

  const getTemplate = (id: string) => {
    return templates.find(template => template.id === id);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    loadTemplates,
    getTemplatesByCategory,
    getCategories,
    getTemplate,
  };
};
