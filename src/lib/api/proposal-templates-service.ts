
import { supabase } from '@/integrations/supabase/client';

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template_content: {
    sections: Array<{
      title: string;
      content: string;
    }>;
    default_services: string[];
    pricing_structure: string;
  };
  created_at: string;
  updated_at: string;
}

export class ProposalTemplatesService {
  async getTemplates(): Promise<ProposalTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }

      return (data || []).map(template => ({
        ...template,
        template_content: template.template_content as ProposalTemplate['template_content']
      }));
    } catch (error) {
      console.error('Error in getTemplates:', error);
      throw error;
    }
  }

  async getTemplatesByCategory(category: string): Promise<ProposalTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch templates for category ${category}: ${error.message}`);
      }

      return (data || []).map(template => ({
        ...template,
        template_content: template.template_content as ProposalTemplate['template_content']
      }));
    } catch (error) {
      console.error('Error in getTemplatesByCategory:', error);
      throw error;
    }
  }

  async getTemplate(id: string): Promise<ProposalTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No data found
        }
        console.error('Supabase error:', error);
        throw new Error(`Failed to fetch template: ${error.message}`);
      }

      return {
        ...data,
        template_content: data.template_content as ProposalTemplate['template_content']
      };
    } catch (error) {
      console.error('Error in getTemplate:', error);
      throw error;
    }
  }
}

export const proposalTemplatesService = new ProposalTemplatesService();
