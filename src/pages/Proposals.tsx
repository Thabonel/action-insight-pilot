
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProposalFormData } from '@/types/proposals';
import { useProposals } from '@/hooks/useProposals';
import ProposalForm from '@/components/proposals/ProposalForm';
import ProposalPreview from '@/components/proposals/ProposalPreview';
import ProposalsList from '@/components/proposals/ProposalsList';
import LiveContentSuggestions from '@/components/content/LiveContentSuggestions';
import { PageHelpModal } from '@/components/common/PageHelpModal';

const Proposals: React.FC = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ProposalFormData>({
    template_type: '',
    client_info: {
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      industry: ''
    },
    project_details: {
      description: '',
      scope: '',
      services: [],
      duration: 8,
      features: []
    },
    call_transcript: '',
    budget_range: {
      min: 5000,
      max: 10000
    }
  });

  const {
    templates,
    proposals,
    generatedProposal,
    loading,
    templatesLoading,
    backendAvailable,
    generateProposal,
    exportProposal
  } = useProposals();

  const handleInputChange = (section: string, field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof ProposalFormData] as object),
        [field]: value
      }
    }));
  };

  const handleFormDataChange = (updates: Partial<ProposalFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleGenerateProposal = async () => {
    const success = await generateProposal(formData);
    if (success) {
      setActiveTab('preview');
    }
  };

  interface ContentSuggestion {
    content: string;
    tags?: string[];
  }

  const handleSuggestionSelect = (content: ContentSuggestion) => {
    // Update form data with selected content
    setFormData(prev => ({
      ...prev,
      project_details: {
        ...prev.project_details,
        description: content.content,
        features: content.tags || []
      }
    }));
  };

  // Create content brief for live suggestions
  const contentBrief = {
    title: formData.client_info.company_name ? 
      `Business Proposal for ${formData.client_info.company_name}` : 
      'Business Proposal',
    content_type: 'proposal',
    target_audience: formData.client_info.industry || 'Business',
    key_messages: formData.project_details.services || [],
    platform: 'proposal',
    tone: 'professional',
    length: 'long',
    keywords: formData.project_details.features || [],
    cta: 'Schedule a consultation'
  };

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-[#0B0D10] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-[#E9EEF5]">Proposal Generator</h1>
          <p className="text-slate-600 dark:text-[#94A3B8] mt-2">Create professional proposals with AI assistance</p>
        </div>
        <Button onClick={() => setActiveTab('create')} className="flex items-center gap-2">
          New Proposal
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="create">Create Proposal</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="manage">Manage Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProposalForm
                formData={formData}
                templates={templates}
                loading={loading}
                templatesLoading={templatesLoading}
                backendAvailable={backendAvailable}
                onInputChange={handleInputChange}
                onFormDataChange={handleFormDataChange}
                onSubmit={handleGenerateProposal}
              />
            </div>
            <div className="lg:col-span-1">
              {formData.client_info.company_name && (
                <LiveContentSuggestions
                  brief={contentBrief}
                  onSuggestionSelect={handleSuggestionSelect}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <ProposalPreview
            proposal={generatedProposal}
            onExport={exportProposal}
          />
        </TabsContent>

        <TabsContent value="manage">
          <ProposalsList
            proposals={proposals}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onExport={exportProposal}
          />
        </TabsContent>
      </Tabs>
      <PageHelpModal helpKey="proposals" />
    </div>
  );
};

export default Proposals;
